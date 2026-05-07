import Anthropic from "@anthropic-ai/sdk"
import { buildSystemPrompt, buildUserPrompt } from "./prompts"
import type { Network, Tone, Format, Proposal, GeneratedPost } from "@/types"

const MODEL = "claude-sonnet-4-20250514"

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key.startsWith("sk-ant-your")) {
    throw new Error("ANTHROPIC_API_KEY is not configured. Add your key to .env.local and restart the server.")
  }
  return new Anthropic({ apiKey: key })
}

function parseProposals(raw: string, network: Network, tone: Tone, format: Format): Proposal[] {
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    // Claude sometimes returns a JSON object inside extra text — try to extract it
    const match = cleaned.match(/\[[\s\S]+\]/)
    if (!match) throw new Error("Claude returned invalid JSON. Try again.")
    parsed = JSON.parse(match[0])
  }

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
      angle: item.angle ?? `Proposal ${idx + 1}`,
    }
  })
}

function handleAnthropicError(err: unknown): never {
  const e = err as { status?: number; message?: string }
  if (e.status === 401) throw new Error("Invalid Anthropic API key. Check ANTHROPIC_API_KEY in .env.local.")
  if (e.status === 429) throw new Error("Anthropic rate limit reached. Wait a moment and try again.")
  if (e.status === 529) throw new Error("Anthropic API is overloaded. Try again in a few seconds.")
  throw new Error(e.message ?? "Claude API error")
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
  const client = getClient()
  const systemPrompt = buildSystemPrompt(network, tone, format, count)
  const userPrompt = buildUserPrompt(content, sourceUrl)

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    })

    const textContent = message.content.find((c) => c.type === "text")
    if (!textContent || textContent.type !== "text") throw new Error("No text response from Claude")

    return parseProposals(textContent.text, network, tone, format)
  } catch (err) {
    if ((err as Error).message.includes(".env.local")) throw err
    if ((err as Error).message.includes("JSON")) throw err
    handleAnthropicError(err)
  }
}
