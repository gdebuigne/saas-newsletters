import OpenAI from "openai"
import { buildSystemPrompt, buildUserPrompt } from "./prompts"
import type { Network, Tone, Format, Proposal, GeneratedPost } from "@/types"

const TEXT_MODEL = "mistral-large-latest"

function getClient(): OpenAI {
  const key = process.env.MISTRAL_API_KEY
  if (!key || key.trim().length < 8) {
    throw new Error("MISTRAL_API_KEY is not configured. Add it to .env.local and restart the server.")
  }
  return new OpenAI({
    apiKey: key,
    baseURL: "https://api.mistral.ai/v1",
  })
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
    const match = cleaned.match(/\[[\s\S]+\]/)
    if (!match) throw new Error("The AI returned an invalid response. Please try again.")
    parsed = JSON.parse(match[0])
  }

  if (!Array.isArray(parsed)) throw new Error("Expected JSON array from AI")

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

function handleApiError(err: unknown): never {
  const e = err as { status?: number; message?: string }
  if (e.status === 401) throw new Error("Invalid Mistral API key. Check MISTRAL_API_KEY in .env.local.")
  if (e.status === 429) throw new Error("Rate limit reached. Wait a moment and try again.")
  if (e.status === 529 || e.status === 503) throw new Error("Mistral API is temporarily unavailable. Try again in a few seconds.")
  throw new Error(e.message ?? "AI generation failed")
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
    const completion = await client.chat.completions.create({
      model: TEXT_MODEL,
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    })

    const text = completion.choices[0]?.message?.content
    if (!text) throw new Error("No response from AI")

    return parseProposals(text, network, tone, format)
  } catch (err) {
    const msg = (err as Error).message ?? ""
    if (msg.includes(".env.local") || msg.includes("JSON") || msg.includes("invalid response")) throw err
    handleApiError(err)
  }
}
