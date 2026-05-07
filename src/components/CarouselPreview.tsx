"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react"
import type { CarouselPost } from "@/types"
import { cn } from "@/lib/utils"

interface CarouselPreviewProps {
  post: CarouselPost
}

export function CarouselPreview({ post }: CarouselPreviewProps) {
  const [current, setCurrent] = useState(0)
  const total = post.slides.length

  const prev = () => setCurrent((c) => Math.max(0, c - 1))
  const next = () => setCurrent((c) => Math.min(total - 1, c + 1))

  const slide = post.slides[current]

  return (
    <div className="space-y-3">
      {/* Slide viewer */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#1A1917] to-[#2D5BE3] aspect-square max-h-64 flex flex-col justify-between p-5">
        {/* Slide indicator */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60 font-mono">{current + 1} / {total}</span>
          <div className="flex gap-1">
            {post.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  i === current ? "bg-white w-4" : "bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        </div>

        {/* Slide content */}
        <div className="flex-1 flex flex-col justify-center py-2">
          <h3 className="text-white font-display font-bold text-lg leading-tight mb-2 line-clamp-2">
            {slide.title}
          </h3>
          <p className="text-white/80 text-xs leading-relaxed line-clamp-4">
            {slide.body}
          </p>
        </div>

        {/* Visual hint */}
        {slide.visual_hint && (
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <ImageIcon className="w-3 h-3" />
            <span className="italic">{slide.visual_hint}</span>
          </div>
        )}

        {/* Nav buttons */}
        <button
          onClick={prev}
          disabled={current === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-0 transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={next}
          disabled={current === total - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-0 transition-all duration-200"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Caption */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Caption</p>
        <p className="text-sm text-foreground font-mono leading-relaxed">{post.caption}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.hashtags.map((tag) => (
            <span key={tag} className="text-xs text-[#2D5BE3] font-medium">
              #{tag.replace(/^#/, "")}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
