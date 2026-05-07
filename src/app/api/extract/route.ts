import { NextRequest, NextResponse } from "next/server"
import { extractFromUrl, extractFromPdf, extractFromImage, isSupportedImageType } from "@/lib/extractor"

const MAX_PDF_SIZE = 10 * 1024 * 1024  // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5MB (Claude Vision limit)

function apiKeyError() {
  return NextResponse.json(
    { error: "Mistral API key not configured. Add MISTRAL_API_KEY=... to your .env.local file and restart the dev server." },
    { status: 503 }
  )
}

function isKeyMissing() {
  const key = process.env.MISTRAL_API_KEY
  return !key || key.trim().length < 8
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file") as File | null

      if (!file) {
        return NextResponse.json({ error: "No file provided." }, { status: 400 })
      }

      const mimeType = file.type

      // Image upload — requires Claude Vision
      if (isSupportedImageType(mimeType)) {
        if (isKeyMissing()) return apiKeyError()
        if (file.size > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            { error: `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.` },
            { status: 413 }
          )
        }
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await extractFromImage(buffer, mimeType)
        return NextResponse.json(result)
      }

      // PDF upload — no API key needed
      if (mimeType.includes("pdf") || file.name.toLowerCase().endsWith(".pdf")) {
        if (file.size > MAX_PDF_SIZE) {
          return NextResponse.json(
            { error: `PDF too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.` },
            { status: 413 }
          )
        }
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await extractFromPdf(buffer)
        return NextResponse.json(result)
      }

      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or an image (PNG, JPG, WEBP, GIF)." },
        { status: 400 }
      )
    }

    // JSON body with URL — no API key needed
    let body: { url?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
    }

    const { url } = body
    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "Please provide a valid URL." }, { status: 400 })
    }

    const result = await extractFromUrl(url.trim())
    return NextResponse.json(result)

  } catch (err) {
    console.error("[extract]", err)
    const message = err instanceof Error ? err.message : "Extraction failed. Please try again."
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
