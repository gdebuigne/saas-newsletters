import OpenAI from "openai"
import { jsonrepair } from "jsonrepair"
import { buildSystemPrompt, buildUserPrompt } from "./prompts"
import type { Network, Tone, Format, Proposal, GeneratedPost, Language } from "@/types"

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

  let root: unknown
  try {
    root = JSON.parse(cleaned)
  } catch {
    try {
      root = JSON.parse(jsonrepair(cleaned))
    } catch (e) {
      console.error("[parseProposals] failed:", (e as Error).message, "| first 200:", cleaned.slice(0, 200))
      throw new Error("The AI returned an invalid response. Please try again.")
    }
  }

  // Accept either { proposals: [...] } or a bare array
  const list = (root as { proposals?: unknown[] }).proposals ?? (Array.isArray(root) ? root : null)
  if (!list) throw new Error("Expected JSON array from AI")

  const stripMarkdown = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/~~(.*?)~~/g, "$1")
      .replace(/^- /gm, "")
      .replace(/^• /gm, "")

  return (list as { angle: string; post: GeneratedPost }[]).map((item, idx: number) => {
    const post = item.post as GeneratedPost

    if (post.type !== "carousel" && (post as import("@/types").ClassicPost).content) {
      ;(post as import("@/types").ClassicPost).content = stripMarkdown(
        (post as import("@/types").ClassicPost).content
      )
    }

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
  language,
}: {
  content: string
  sourceUrl?: string
  network: Network
  tone: Tone
  format: Format
  count: number
  language: Language
}): Promise<Proposal[]> {
  const client = getClient()
  const systemPrompt = buildSystemPrompt(network, tone, format, count, language)
  const userPrompt = buildUserPrompt(content, sourceUrl)

  try {
    const completion = await client.chat.completions.create({
      model: TEXT_MODEL,
      max_tokens: 4096,
      response_format: { type: "json_object" },
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
    if (msg.includes(".env.local") || msg.includes("invalid response") || msg.includes("Please try again")) throw err
    handleApiError(err)
  }
}
