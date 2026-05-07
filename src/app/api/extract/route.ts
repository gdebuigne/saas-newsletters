import { NextRequest, NextResponse } from "next/server"
import { extractFromUrl, extractFromPdf } from "@/lib/extractor"

const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file") as File | null

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
      }

      if (file.size > MAX_PDF_SIZE) {
        return NextResponse.json(
          { error: `File too large. Maximum size is 10MB (received ${(file.size / 1024 / 1024).toFixed(1)}MB)` },
          { status: 413 }
        )
      }

      if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
        return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 })
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await extractFromPdf(buffer)
      return NextResponse.json(result)
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
    const message = err instanceof Error ? err.message : "Extraction failed"
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
