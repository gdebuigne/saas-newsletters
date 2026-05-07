"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Copy, Check, Edit2, RefreshCw, Loader2, LayoutGrid, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CarouselPreview } from "./CarouselPreview"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Proposal, ClassicPost } from "@/types"

const NETWORK_STYLES: Record<string, { label: string; className: string }> = {
  linkedin: { label: "LinkedIn", className: "text-[#0A66C2] bg-[#E8F0FA] border-[#0A66C2]/20" },
  instagram: { label: "Instagram", className: "text-[#E1306C] bg-[#FCE8EF] border-[#E1306C]/20" },
  twitter: { label: "Twitter/X", className: "text-[#1DA1F2] bg-[#E8F5FD] border-[#1DA1F2]/20" },
  threads: { label: "Threads", className: "text-foreground bg-muted border-border" },
  facebook: { label: "Facebook", className: "text-[#1877F2] bg-[#E8F0FE] border-[#1877F2]/20" },
}

const TONE_LABELS: Record<string, string> = {
  professional: "Pro",
  inspiring: "Inspo",
  humorous: "Fun",
  educational: "Edu",
  provocative: "Bold",
  storytelling: "Story",
}

const FORMAT_LABELS: Record<string, string> = {
  classic: "Classic",
  carousel: "Carousel",
  thread: "Thread",
  bullets: "Bullets",
  narrative: "Narrative",
}

const CHAR_LIMITS: Record<string, number> = {
  linkedin: 1300,
  instagram: 2200,
  twitter: 280,
  threads: 500,
  facebook: 2000,
}

function formatPostContent(text: string): React.ReactNode {
  const parts = text.split(/(#[\wÀ-ɏ]+)/g)
  return parts.map((part, i) =>
    part.startsWith("#") ? (
      <span key={i} className="text-[#2D5BE3] font-medium">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

interface PostCardProps {
  proposal: Proposal
  index: number
}

export function PostCard({ proposal, index }: PostCardProps) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const { updateProposal, extracted, tone, network, format } = useAppStore()

  const netStyle = NETWORK_STYLES[proposal.network]
  const charLimit = CHAR_LIMITS[proposal.network]
  const isCarousel = proposal.post.type === "carousel"
  const post = proposal.post as ClassicPost

  const getFullText = () => {
    if (isCarousel) {
      const cp = proposal.post as import("@/types").CarouselPost
      return [
        cp.slides.map((s) => `Slide ${s.slide}: ${s.title}\n${s.body}`).join("\n\n"),
        `Caption: ${cp.caption}`,
        cp.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" "),
      ].join("\n\n")
    }
    return post.content
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullText())
      setCopied(true)
      toast.success("Copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }

  const handleEditStart = () => {
    setEditContent(isCarousel ? getFullText() : post.content)
    setIsEditing(true)
  }

  const handleEditSave = () => {
    if (!isCarousel) {
      const updated: Proposal = {
        ...proposal,
        post: { ...post, content: editContent } as ClassicPost,
        charCount: editContent.length,
      }
      updateProposal(proposal.id, updated)
    }
    setIsEditing(false)
  }

  const handleRegenerate = async () => {
    if (!extracted) return
    setIsRegenerating(true)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `${extracted.title}\n\n${extracted.summary}\n\n${extracted.body}`,
          sourceUrl: extracted.sourceUrl,
          network: proposal.network,
          tone,
          format,
          count: 1,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.proposals?.[0]) {
        updateProposal(proposal.id, { ...data.proposals[0], id: proposal.id })
        toast.success("Post regenerated!")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Regeneration failed")
    } finally {
      setIsRegenerating(false)
    }
  }

  const contentText = isCarousel ? "" : post.content
  const isLong = contentText.length > 300
  const displayText = isLong && !expanded ? contentText.slice(0, 300) + "…" : contentText
  const overLimit = proposal.charCount > charLimit

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]",
        "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)]",
        overLimit ? "border-amber-200" : "border-border"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", netStyle.className)}>
            {netStyle.label}
          </span>
          <Badge variant="secondary" className="text-xs font-normal">
            {TONE_LABELS[proposal.tone]}
          </Badge>
          {isCarousel && (
            <Badge variant="secondary" className="text-xs font-normal gap-1">
              <LayoutGrid className="w-3 h-3" />
              {FORMAT_LABELS[proposal.format]}
            </Badge>
          )}
        </div>
        <span className={cn(
          "text-xs font-mono tabular-nums",
          overLimit ? "text-amber-600 font-semibold" : "text-muted-foreground"
        )}>
          {proposal.charCount}/{charLimit}
        </span>
      </div>

      {/* Angle */}
      {proposal.angle && (
        <div className="px-4 pt-3">
          <p className="text-xs text-muted-foreground italic">"{proposal.angle}"</p>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3">
        {isCarousel ? (
          <CarouselPreview post={proposal.post as import("@/types").CarouselPost} />
        ) : isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[160px] text-sm font-mono leading-relaxed resize-none border-[#2D5BE3]/40 focus-visible:ring-[#2D5BE3]/30"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleEditSave}>Save</Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm leading-relaxed post-content whitespace-pre-wrap font-mono text-foreground">
              {formatPostContent(displayText)}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 flex items-center gap-1 text-xs text-[#2D5BE3] hover:underline"
              >
                {expanded ? "Show less" : "Show more"}
                <ChevronDown className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")} />
              </button>
            )}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                {post.hashtags.map((tag) => (
                  <span key={tag} className="text-xs text-[#2D5BE3] font-medium">
                    #{tag.replace(/^#/, "")}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex items-center gap-1.5 px-4 pb-4 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1 gap-1.5 h-8 text-xs font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          {!isCarousel && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditStart}
              className="flex-1 gap-1.5 h-8 text-xs font-medium"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex-1 gap-1.5 h-8 text-xs font-medium"
          >
            {isRegenerating
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />
            }
            Regen
          </Button>
        </div>
      )}

      {/* Proposal number */}
      <div className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shadow-sm">
        {index + 1}
      </div>
    </div>
  )
}
