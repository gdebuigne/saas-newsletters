"use client"

import { useAppStore } from "@/lib/store"
import { PostCard } from "./PostCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles } from "lucide-react"

function GeneratingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-border flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full skeleton-shimmer" />
              <Skeleton className="h-5 w-12 rounded-full skeleton-shimmer" />
            </div>
            <Skeleton className="h-4 w-16 skeleton-shimmer" />
          </div>
          <div className="px-4 py-4 space-y-2">
            <Skeleton className="h-3 w-3/4 skeleton-shimmer" />
            <Skeleton className="h-3 w-full skeleton-shimmer" />
            <Skeleton className="h-3 w-5/6 skeleton-shimmer" />
            <Skeleton className="h-3 w-4/5 skeleton-shimmer" />
            <Skeleton className="h-3 w-2/3 skeleton-shimmer" />
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <Skeleton className="h-8 flex-1 rounded-lg skeleton-shimmer" />
            <Skeleton className="h-8 flex-1 rounded-lg skeleton-shimmer" />
            <Skeleton className="h-8 flex-1 rounded-lg skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#EEF2FD] flex items-center justify-center mb-4">
        <Sparkles className="w-7 h-7 text-[#2D5BE3]" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">No posts yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Paste a URL or upload a PDF, configure your settings, then click "Generate posts" to get started.
      </p>
    </div>
  )
}

export function ProposalsGrid() {
  const { proposals, isGenerating, generateError } = useAppStore()

  if (isGenerating) return <GeneratingSkeleton />

  if (generateError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-sm font-medium text-red-600 mb-1">Generation failed</p>
        <p className="text-xs text-muted-foreground max-w-sm">{generateError}</p>
      </div>
    )
  }

  if (proposals.length === 0) return <EmptyState />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{proposals.length}</span> proposals generated
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {proposals.map((proposal, i) => (
          <PostCard key={proposal.id} proposal={proposal} index={i} />
        ))}
      </div>
    </div>
  )
}
