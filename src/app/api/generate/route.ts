import { NextRequest, NextResponse } from "next/server"
import { generatePosts } from "@/lib/claude"
import type { GenerateRequest } from "@/types"

const VALID_NETWORKS = ["linkedin", "instagram", "twitter", "threads", "facebook"]
const VALID_TONES = ["professional", "inspiring", "humorous", "educational", "provocative", "storytelling"]
const VALID_FORMATS = ["classic", "carousel", "thread", "bullets", "narrative"]
const VALID_LANGUAGES = ["fr", "en"]

function isKeyMissing() {
  const key = process.env.MISTRAL_API_KEY
  return !key || key.trim().length < 8
}

export async function POST(req: NextRequest) {
  if (isKeyMissing()) {
    return NextResponse.json(
      { error: "Mistral API key not configured. Add MISTRAL_API_KEY=... to .env.local and restart the dev server." },
      { status: 503 }
    )
  }

  let body: GenerateRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { content, sourceUrl, network, tone, format, count, language } = body

  if (!content || typeof content !== "string" || content.trim().length < 50) {
    return NextResponse.json({ error: "Content is too short (minimum 50 characters)" }, { status: 400 })
  }

  if (!VALID_NETWORKS.includes(network)) {
    return NextResponse.json({ error: `Invalid network. Must be one of: ${VALID_NETWORKS.join(", ")}` }, { status: 400 })
  }

  if (!VALID_TONES.includes(tone)) {
    return NextResponse.json({ error: `Invalid tone. Must be one of: ${VALID_TONES.join(", ")}` }, { status: 400 })
  }

  if (!VALID_FORMATS.includes(format)) {
    return NextResponse.json({ error: `Invalid format. Must be one of: ${VALID_FORMATS.join(", ")}` }, { status: 400 })
  }

  const resolvedLanguage = VALID_LANGUAGES.includes(language) ? language : "fr"
  const proposalCount = Math.min(Math.max(Number(count) || 3, 3), 5)

  try {
    const proposals = await generatePosts({
      content: content.trim(),
      sourceUrl,
      network,
      tone,
      format,
      count: proposalCount,
      language: resolvedLanguage,
    })

    return NextResponse.json({ proposals })
  } catch (err) {
    console.error("[generate] Claude API error:", err)
    const message = err instanceof Error ? err.message : "Generation failed"
    const isRateLimit = message.toLowerCase().includes("rate") || message.toLowerCase().includes("429")
    return NextResponse.json(
      { error: isRateLimit ? "Claude API rate limit reached. Please wait a moment and try again." : message },
      { status: isRateLimit ? 429 : 500 }
    )
  }
}
