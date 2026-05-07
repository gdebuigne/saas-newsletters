"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, AlertCircle } from "lucide-react"
import { useAppStore } from "@/lib/store"
import type { Proposal } from "@/types"

export function GenerateButton() {
  const {
    extracted, network, tone, format, count,
    isGenerating, setProposals, setIsGenerating, setGenerateError,
  } = useAppStore()

  const handleGenerate = async () => {
    if (!extracted) {
      toast.error("Extract content first — paste a URL, upload a PDF or an image above.")
      return
    }

    setIsGenerating(true)
    setGenerateError(null)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `${extracted.title}\n\n${extracted.summary}\n\n${extracted.body}`,
          sourceUrl: extracted.sourceUrl,
          network,
          tone,
          format,
          count,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setProposals((data as { proposals: Proposal[] }).proposals)
      toast.success(`${(data as { proposals: Proposal[] }).proposals.length} posts generated!`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed"
      setGenerateError(msg)
      toast.error(msg)
    } finally {
      setIsGenerating(false)
    }
  }

  const ready = !!extracted && !isGenerating

  return (
    <div className="space-y-2">
      {!extracted && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Extract content above to unlock
        </p>
      )}
      <Button
        onClick={handleGenerate}
        disabled={!ready}
        className="w-full gap-2 h-11 text-sm font-semibold"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate posts
          </>
        )}
      </Button>
    </div>
  )
}
