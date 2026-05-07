"use client"

import { useState, useRef, useCallback } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Link, Upload, FileText, AlertCircle, CheckCircle2, X, Loader2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { ExtractResult } from "@/types"

const MAX_PDF_MB = 10

function WordCountBadge({ count }: { count: number }) {
  const color = count < 100 ? "text-amber-600 bg-amber-50 border-amber-200" : "text-green-700 bg-green-50 border-green-200"
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium", color)}>
      {count < 100 && <AlertCircle className="w-3 h-3" />}
      {count >= 100 && <CheckCircle2 className="w-3 h-3" />}
      {count} words
    </span>
  )
}

function ExtractionResult({ result, onClear }: { result: ExtractResult; onClear: () => void }) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4 space-y-2">
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

export function InputPanel() {
  const [urlInput, setUrlInput] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { extracted, isExtracting, extractError, setExtracted, setIsExtracting, setExtractError } = useAppStore()

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

  const handleExtractPdf = useCallback(async (file: File) => {
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${MAX_PDF_MB}MB`)
      return
    }
    setPdfFile(file)
    setIsExtracting(true)
    setExtractError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/extract", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "PDF parsing failed")
      setExtracted(data as ExtractResult)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not parse PDF"
      setExtractError(msg)
      toast.error(msg)
      setPdfFile(null)
    } finally {
      setIsExtracting(false)
    }
  }, [setExtracted, setIsExtracting, setExtractError])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleExtractPdf(file)
  }, [handleExtractPdf])

  const handleClear = () => {
    setExtracted(null)
    setExtractError(null)
    setPdfFile(null)
    setUrlInput("")
  }

  return (
    <div>
      <Tabs defaultValue="url">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="url" className="gap-2">
            <Link className="w-3.5 h-3.5" />
            URL
          </TabsTrigger>
          <TabsTrigger value="pdf" className="gap-2">
            <FileText className="w-3.5 h-3.5" />
            PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-0">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/article..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExtractUrl()}
              disabled={isExtracting}
              className="flex-1 text-sm"
            />
            <Button
              onClick={handleExtractUrl}
              disabled={isExtracting || !urlInput.trim()}
              size="sm"
              className="shrink-0"
            >
              {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyse"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="pdf" className="mt-0">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
              isDragging
                ? "border-[#2D5BE3] bg-[#EEF2FD]"
                : "border-border hover:border-[#2D5BE3]/50 hover:bg-muted/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleExtractPdf(f) }}
            />
            {pdfFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-[#2D5BE3]" />
                <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{pdfFile.name}</span>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {(pdfFile.size / 1024 / 1024).toFixed(1)} MB
                </Badge>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium text-foreground">Drop PDF here or click to browse</p>
                <p className="text-xs text-muted-foreground">Maximum {MAX_PDF_MB}MB — text PDFs only</p>
              </div>
            )}
            {isExtracting && (
              <div className="absolute inset-0 rounded-xl bg-background/70 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#2D5BE3]" />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {extractError && !isExtracting && (
        <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{extractError}</span>
        </div>
      )}

      {isExtracting && <SkeletonResult />}
      {!isExtracting && extracted && <ExtractionResult result={extracted} onClear={handleClear} />}
    </div>
  )
}
