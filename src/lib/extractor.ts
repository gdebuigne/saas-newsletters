import * as cheerio from "cheerio"
import Anthropic from "@anthropic-ai/sdk"
import type { ExtractResult } from "@/types"

const IMAGE_ANALYSIS_MODEL = "claude-sonnet-4-20250514"
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const
type SupportedImageType = typeof SUPPORTED_IMAGE_TYPES[number]

function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key.startsWith("sk-ant-your")) {
    throw new Error("ANTHROPIC_API_KEY is not configured. Add your key to .env.local and restart the server.")
  }
  return new Anthropic({ apiKey: key })
}

const UNWANTED_SELECTORS = [
  "nav", "header", "footer", "aside", "script", "style", "noscript",
  ".nav", ".header", ".footer", ".sidebar", ".ads", ".advertisement",
  ".cookie", ".popup", ".modal", "#nav", "#header", "#footer",
  "[role='navigation']", "[role='banner']", "[role='contentinfo']",
  ".social-share", ".related-posts", ".comments", "#comments",
]

function extractTextFromHtml(html: string, url: string): ExtractResult {
  const $ = cheerio.load(html)

  const title =
    $("meta[property='og:title']").attr("content") ||
    $("title").text() ||
    $("h1").first().text() ||
    "Untitled"

  const summary =
    $("meta[property='og:description']").attr("content") ||
    $("meta[name='description']").attr("content") ||
    ""

  UNWANTED_SELECTORS.forEach((sel) => {
    try { $(sel).remove() } catch { /* ignore invalid selectors */ }
  })

  const contentSelectors = ["article", "main", "[role='main']", ".post-content", ".article-content", ".entry-content", ".content", "body"]
  let bodyText = ""

  for (const sel of contentSelectors) {
    const el = $(sel).first()
    if (el.length) {
      bodyText = el.text().replace(/\s+/g, " ").trim()
      if (bodyText.length > 200) break
    }
  }

  const wordCount = bodyText.split(/\s+/).filter(Boolean).length

  return {
    title: title.trim().slice(0, 300),
    summary: summary.trim().slice(0, 500),
    body: bodyText.slice(0, 12000),
    sourceUrl: url,
    wordCount,
  }
}

export async function extractFromUrl(url: string): Promise<ExtractResult> {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new Error("Invalid URL. Make sure it starts with https://")
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.")
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
      },
    })

    clearTimeout(timeout)

    if (response.status === 403 || response.status === 401) {
      throw new Error("This site blocks automated access. Try copy-pasting the article text instead.")
    }
    if (response.status === 404) {
      throw new Error("Page not found (404). Check that the URL is correct.")
    }
    if (!response.ok) {
      throw new Error(`Could not fetch the page (HTTP ${response.status}).`)
    }

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      throw new Error("The URL doesn't point to a readable web page.")
    }

    const html = await response.text()
    const result = extractTextFromHtml(html, url)

    if (result.wordCount < 30) {
      throw new Error("Could not extract enough text from this page. The site may use JavaScript rendering — try copy-pasting the content.")
    }

    return result
  } catch (err) {
    clearTimeout(timeout)
    if ((err as Error).name === "AbortError") {
      throw new Error("The page took too long to load (15s timeout). Try again or check the URL.")
    }
    throw err
  }
}

export async function extractFromPdf(buffer: Buffer): Promise<ExtractResult> {
  const { PDFParse } = await import("pdf-parse")
  const parser = new PDFParse({ data: buffer })

  try {
    const result = await parser.getText()
    const rawText = result.text ?? ""
    const text = rawText.replace(/\s+/g, " ").trim()
    const wordCount = text.split(/\s+/).filter(Boolean).length

    if (wordCount < 20) {
      throw new Error("This PDF contains too little text. It may be a scanned image PDF — only text-based PDFs are supported.")
    }

    const lines = rawText.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 10)
    const title = lines[0]?.slice(0, 200) || "PDF Document"

    return {
      title,
      summary: lines.slice(1, 4).join(" ").slice(0, 500),
      body: text.slice(0, 12000),
      wordCount,
    }
  } catch (err) {
    const msg = (err as Error).message ?? ""
    if (msg.includes("little text") || msg.includes("scanned")) throw err
    throw new Error("Could not read this PDF. Make sure it's not password-protected and contains selectable text.")
  } finally {
    await parser.destroy()
  }
}

export function isSupportedImageType(mimeType: string): mimeType is SupportedImageType {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType as SupportedImageType)
}

export async function extractFromImage(buffer: Buffer, mimeType: SupportedImageType): Promise<ExtractResult> {
  const client = getAnthropicClient()
  const base64 = buffer.toString("base64")

  try {
    const message = await client.messages.create({
      model: IMAGE_ANALYSIS_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: base64 },
            },
            {
              type: "text",
              text: `Analyze this image thoroughly. Extract all visible text (captions, post content, quotes, headlines, overlaid text). Identify the main topic, key message, and any notable data points.

Respond in this exact format:
TITLE: [main subject or headline, 10 words max]
SUMMARY: [1–2 sentence summary of the core message]
CONTENT: [detailed description with ALL visible text, context, key takeaways, statistics or quotes, and what makes this content interesting]`,
            },
          ],
        },
      ],
    })

    const text = message.content.find((c) => c.type === "text")?.text ?? ""

    const titleMatch = text.match(/^TITLE:\s*(.+)$/m)
    const summaryMatch = text.match(/^SUMMARY:\s*(.+)$/m)
    const contentMatch = text.match(/^CONTENT:\s*([\s\S]+)$/m)

    const title = titleMatch?.[1]?.trim() ?? "Image Content"
    const summary = summaryMatch?.[1]?.trim() ?? ""
    const body = contentMatch?.[1]?.trim() ?? text
    const wordCount = body.split(/\s+/).filter(Boolean).length

    return { title, summary, body, wordCount }
  } catch (err) {
    const e = err as { status?: number; message?: string }
    if (e.status === 401 || e.message?.includes(".env.local")) {
      throw new Error("Invalid Anthropic API key. Add ANTHROPIC_API_KEY=sk-ant-... to .env.local and restart the dev server.")
    }
    if (e.status === 429) throw new Error("Anthropic rate limit reached. Wait a moment and try again.")
    throw new Error(e.message ?? "Image analysis failed")
  }
}
