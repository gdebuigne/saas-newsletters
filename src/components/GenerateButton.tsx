"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, AlertCircle } from "lucide-react"
import { useAppStore } from "@/lib/store"
import type { ExtractResult, Proposal } from "@/types"

export function GenerateButton() {
  const {
    extracted, urlInput, network, tone, format, count, language,
    isExtracting, isGenerating,
    setExtracted, setIsExtracting, setExtractError,
    setProposals, setIsGenerating, setGenerateError,
  } = useAppStore()

  const extractUrl = async (url: string): Promise<ExtractResult | null> => {
    setIsExtracting(true)
    setExtractError(null)
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Extraction failed")
      setExtracted(data as ExtractResult)
      return data as ExtractResult
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not extract content"
      setExtractError(msg)
      toast.error(msg)
      return null
    } finally {
      setIsExtracting(false)
    }
  }

  const handleGenerate = async () => {
    let source = extracted

    // Auto-extract if URL is pasted but not yet extracted
    if (!source && urlInput.trim()) {
      source = await extractUrl(urlInput.trim())
      if (!source) return
    }

    if (!source) {
      toast.error("Colle un lien, uploade un PDF ou une image ci-dessus.")
      return
    }

    setIsGenerating(true)
    setGenerateError(null)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `${source.title}\n\n${source.summary}\n\n${source.body}`,
          sourceUrl: source.sourceUrl,
          network,
          tone,
          format,
          count,
          language,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setProposals((data as { proposals: Proposal[] }).proposals)
      toast.success(`${(data as { proposals: Proposal[] }).proposals.length} posts générés !`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed"
      setGenerateError(msg)
      toast.error(msg)
    } finally {
      setIsGenerating(false)
    }
  }

  const isBusy = isExtracting || isGenerating
  const hasInput = !!extracted || !!urlInput.trim()

  const buttonLabel = () => {
    if (isExtracting) return "Analyse du lien…"
    if (isGenerating) return "Génération…"
    return "Générer les posts"
  }

  return (
    <div className="space-y-2">
      {!hasInput && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Colle un lien ou uploade un fichier ci-dessus
        </p>
      )}
      <Button
        onClick={handleGenerate}
        disabled={isBusy || !hasInput}
        className="w-full gap-2 h-11 text-sm font-semibold"
      >
        {isBusy
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Sparkles className="w-4 h-4" />
        }
        {buttonLabel()}
      </Button>
    </div>
  )
}
