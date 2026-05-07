"use client"

import { useState, useRef, useCallback } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Link, FileText, AlertCircle, CheckCircle2, X, Loader2, ImageIcon } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { ExtractResult } from "@/types"

const MAX_PDF_MB = 10
const MAX_IMAGE_MB = 5
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]

function WordCountBadge({ count }: { count: number }) {
  const color = count < 100 ? "text-amber-600 bg-amber-50 border-amber-200" : "text-green-700 bg-green-50 border-green-200"
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium", color)}>
      {count < 100 ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
      {count} words
    </span>
  )
}

function ExtractionResult({
  result,
  imagePreview,
  onClear,
}: {
  result: ExtractResult
  imagePreview?: string
  onClear: () => void
}) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
      {imagePreview && (
        <div className="relative w-full h-32 bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Uploaded image"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute bottom-2 left-3 text-white text-xs font-medium bg-black/40 px-2 py-0.5 rounded-full">
            Analysed by Claude Vision
          </span>
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Extracted content</p>
            <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{result.title}</h3>
          </div>
          <button onClick={onClear} className="flex-shrink-0 p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        {result.summary && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{result.summary}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <WordCountBadge count={result.wordCount} />
          {result.wordCount < 100 && (
            <p className="text-xs text-amber-600">Short content — post quality may be limited</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SkeletonResult() {
  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4 space-y-2">
      <Skeleton className="h-3 w-24 skeleton-shimmer" />
      <Skeleton className="h-4 w-full skeleton-shimmer" />
      <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
      <Skeleton className="h-3 w-full skeleton-shimmer" />
      <Skeleton className="h-3 w-2/3 skeleton-shimmer" />
    </div>
  )
}

function DropZone({
  onFile,
  accept,
  isExtracting,
  label,
  hint,
  preview,
  fileName,
  fileSize,
  icon: Icon,
}: {
  onFile: (f: File) => void
  accept: string
  isExtracting: boolean
  label: string
  hint: string
  preview?: string
  fileName?: string
  fileSize?: number
  icon: React.ComponentType<{ className?: string }>
}) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) onFile(file)
    },
    [onFile]
  )

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 overflow-hidden",
        isDragging
          ? "border-[#2D5BE3] bg-[#EEF2FD]"
          : "border-border hover:border-[#2D5BE3]/50 hover:bg-muted/50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
      />

      {preview ? (
        <div className="relative h-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-xs font-medium truncate max-w-[180px] px-2">{fileName}</p>
              {fileSize !== undefined && (
                <p className="text-xs opacity-70 mt-0.5">{(fileSize / 1024 / 1024).toFixed(1)} MB</p>
              )}
            </div>
          </div>
        </div>
      ) : fileName ? (
        <div className="p-5 flex items-center justify-center gap-2">
          <Icon className="w-5 h-5 text-[#2D5BE3]" />
          <span className="text-sm font-medium text-foreground truncate max-w-[180px]">{fileName}</span>
          {fileSize !== undefined && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {(fileSize / 1024 / 1024).toFixed(1)} MB
            </Badge>
          )}
        </div>
      ) : (
        <div className="p-6 space-y-1 text-center">
          <Icon className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      )}

      {isExtracting && (
        <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#2D5BE3]" />
          <p className="text-xs text-muted-foreground">Analysing…</p>
        </div>
      )}
    </div>
  )
}

export function InputPanel() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | undefined>()

  const { extracted, isExtracting, extractError, urlInput, setUrlInput, setExtracted, setIsExtracting, setExtractError } = useAppStore()

  const uploadFile = useCallback(
    async (file: File, formData: FormData) => {
      setIsExtracting(true)
      setExtractError(null)
      try {
        const res = await fetch("/api/extract", { method: "POST", body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Extraction failed")
        setExtracted(data as ExtractResult)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Extraction failed"
        setExtractError(msg)
        toast.error(msg)
        return false
      } finally {
        setIsExtracting(false)
      }
      return true
    },
    [setExtracted, setIsExtracting, setExtractError]
  )

  const handlePdfFile = useCallback(async (file: File) => {
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum ${MAX_PDF_MB}MB`)
      return
    }
    setPdfFile(file)
    const fd = new FormData()
    fd.append("file", file)
    const ok = await uploadFile(file, fd)
    if (!ok) setPdfFile(null)
  }, [uploadFile])

  const handleImageFile = useCallback(async (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Unsupported format. Use PNG, JPG, WEBP or GIF.")
      return
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Image too large. Maximum ${MAX_IMAGE_MB}MB`)
      return
    }
    setImageFile(file)
    // Build local preview URL
    const preview = URL.createObjectURL(file)
    setImagePreview(preview)

    const fd = new FormData()
    fd.append("file", file)
    const ok = await uploadFile(file, fd)
    if (!ok) {
      setImageFile(null)
      setImagePreview(undefined)
      URL.revokeObjectURL(preview)
    }
  }, [uploadFile])

  const handleClear = () => {
    setExtracted(null)
    setExtractError(null)
    setPdfFile(null)
    setUrlInput("")
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(undefined)
  }

  const handleExtractUrl = async () => {
    if (!urlInput.trim()) return
    setIsExtracting(true)
    setExtractError(null)
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Extraction failed")
      setExtracted(data as ExtractResult)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not extract content"
      setExtractError(msg)
      toast.error(msg)
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div>
      <Tabs defaultValue="url">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="url" className="gap-1.5 text-xs">
            <Link className="w-3.5 h-3.5" />
            URL
          </TabsTrigger>
          <TabsTrigger value="pdf" className="gap-1.5 text-xs">
            <FileText className="w-3.5 h-3.5" />
            PDF
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-1.5 text-xs">
            <ImageIcon className="w-3.5 h-3.5" />
            Image
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-0">
          <Input
            type="url"
            placeholder="https://exemple.com/article..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExtractUrl()}
            disabled={isExtracting}
            className="text-sm"
          />
          {urlInput.trim() && !extracted && !isExtracting && (
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#2D5BE3]" />
              Lien prêt — clique sur Générer les posts
            </p>
          )}
        </TabsContent>

        <TabsContent value="pdf" className="mt-0">
          <DropZone
            onFile={handlePdfFile}
            accept=".pdf"
            isExtracting={isExtracting}
            label="Drop PDF here or click to browse"
            hint={`Maximum ${MAX_PDF_MB}MB — text PDFs only`}
            fileName={pdfFile?.name}
            fileSize={pdfFile?.size}
            icon={FileText}
          />
        </TabsContent>

        <TabsContent value="image" className="mt-0">
          <DropZone
            onFile={handleImageFile}
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            isExtracting={isExtracting}
            label="Drop a screenshot or photo here"
            hint={`PNG, JPG, WEBP, GIF — max ${MAX_IMAGE_MB}MB`}
            fileName={imageFile?.name}
            fileSize={imageFile?.size}
            preview={imagePreview}
            icon={ImageIcon}
          />
          {!imageFile && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Screenshots of posts, slides, infographics, or any visual content
            </p>
          )}
        </TabsContent>
      </Tabs>

      {extractError && !isExtracting && (
        <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{extractError}</span>
        </div>
      )}

      {isExtracting && <SkeletonResult />}
      {!isExtracting && extracted && (
        <ExtractionResult
          result={extracted}
          imagePreview={imagePreview}
          onClear={handleClear}
        />
      )}
    </div>
  )
}
