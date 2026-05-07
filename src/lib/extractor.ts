import * as cheerio from "cheerio"
import type { ExtractResult } from "@/types"

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

  // Try article content first, then main, then body
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
    throw new Error("Invalid URL format")
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported")
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PostCraftBot/1.0; +https://postcraft.app)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "fr,en;q=0.9",
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Could not fetch the page`)
    }

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("text/html")) {
      throw new Error("The URL does not point to an HTML page")
    }

    const html = await response.text()
    const result = extractTextFromHtml(html, url)

    if (result.wordCount < 50) {
      throw new Error("The page contains too little text to generate meaningful posts")
    }

    return result
  } catch (err) {
    clearTimeout(timeout)
    if ((err as Error).name === "AbortError") {
      throw new Error("The page took too long to load (timeout 15s)")
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

    if (wordCount < 50) {
      throw new Error("The PDF contains too little text to generate meaningful posts")
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
    if ((err as Error).message.includes("too little text")) throw err
    throw new Error("Could not parse the PDF. Make sure it contains readable text (not scanned images).")
  } finally {
    await parser.destroy()
  }
}
