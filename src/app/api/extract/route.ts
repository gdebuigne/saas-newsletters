import { NextRequest, NextResponse } from "next/server"
import { extractFromUrl, extractFromPdf, extractFromImage, isSupportedImageType } from "@/lib/extractor"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5MB (Claude Vision limit)

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file") as File | null

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
      }

      const mimeType = file.type

      // Image upload
      if (isSupportedImageType(mimeType)) {
        if (file.size > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            { error: `Image too large. Maximum size is 5MB (received ${(file.size / 1024 / 1024).toFixed(1)}MB)` },
            { status: 413 }
          )
        }
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await extractFromImage(buffer, mimeType)
        return NextResponse.json(result)
      }

      // PDF upload
      if (mimeType.includes("pdf") || file.name.endsWith(".pdf")) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File too large. Maximum size is 10MB (received ${(file.size / 1024 / 1024).toFixed(1)}MB)` },
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

    // JSON body with URL
    const body = await req.json()
    const { url } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Please provide a valid URL" }, { status: 400 })
    }

    const result = await extractFromUrl(url)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[extract]", err)
    const message = err instanceof Error ? err.message : "Extraction failed"
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
