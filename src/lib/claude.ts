import Anthropic from "@anthropic-ai/sdk"
import { buildSystemPrompt, buildUserPrompt } from "./prompts"
import type { Network, Tone, Format, Proposal, GeneratedPost } from "@/types"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = "claude-sonnet-4-20250514"

function parseProposals(raw: string, network: Network, tone: Tone, format: Format): Proposal[] {
  // Strip markdown code fences if present
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()

  const parsed = JSON.parse(cleaned)

  if (!Array.isArray(parsed)) throw new Error("Expected JSON array from Claude")

  return parsed.map((item: { angle: string; post: GeneratedPost }, idx: number) => {
    const post = item.post as GeneratedPost
    let charCount = 0

    if (post.type === "carousel") {
      charCount = post.caption.length + post.slides.reduce((acc, s) => acc + s.title.length + s.body.length, 0)
    } else {
      charCount = post.content.length
    }

    return {
      id: `${Date.now()}-${idx}`,
      network,
      tone,
      format,
      post,
      charCount,
      angle: item.angle ?? `Proposition ${idx + 1}`,
    }
  })
}

export async function generatePosts({
  content,
  sourceUrl,
  network,
  tone,
  format,
  count,
}: {
  content: string
  sourceUrl?: string
  network: Network
  tone: Tone
  format: Format
  count: number
}): Promise<Proposal[]> {
  const systemPrompt = buildSystemPrompt(network, tone, format, count)
  const userPrompt = buildUserPrompt(content, sourceUrl)

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  const textContent = message.content.find((c) => c.type === "text")
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude")
  }

  return parseProposals(textContent.text, network, tone, format)
}
