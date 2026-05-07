"use client"

import { Separator } from "@/components/ui/separator"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Network, Tone, Format } from "@/types"

const NETWORKS: { id: Network; label: string; color: string; bg: string; icon: string }[] = [
  { id: "linkedin", label: "LinkedIn", color: "text-[#0A66C2]", bg: "bg-[#E8F0FA] border-[#0A66C2]/30", icon: "in" },
  { id: "instagram", label: "Instagram", color: "text-[#E1306C]", bg: "bg-[#FCE8EF] border-[#E1306C]/30", icon: "ig" },
  { id: "twitter", label: "Twitter/X", color: "text-[#1DA1F2]", bg: "bg-[#E8F5FD] border-[#1DA1F2]/30", icon: "𝕏" },
  { id: "threads", label: "Threads", color: "text-foreground", bg: "bg-muted border-border", icon: "@" },
  { id: "facebook", label: "Facebook", color: "text-[#1877F2]", bg: "bg-[#E8F0FE] border-[#1877F2]/30", icon: "f" },
]

const TONES: { id: Tone; label: string; desc: string }[] = [
  { id: "professional", label: "Professional", desc: "Authority & expertise" },
  { id: "inspiring", label: "Inspiring", desc: "Energy & optimism" },
  { id: "humorous", label: "Humorous", desc: "Witty & playful" },
  { id: "educational", label: "Educational", desc: "Clear & instructive" },
  { id: "provocative", label: "Provocative", desc: "Bold & contrarian" },
  { id: "storytelling", label: "Storytelling", desc: "Narrative & personal" },
]

const FORMATS_BY_NETWORK: Record<Network, { id: Format; label: string }[]> = {
  linkedin: [
    { id: "classic", label: "Classic post" },
    { id: "bullets", label: "Bullet points" },
    { id: "narrative", label: "Storytelling" },
  ],
  instagram: [
    { id: "classic", label: "Classic post" },
    { id: "carousel", label: "Carousel" },
  ],
  twitter: [
    { id: "classic", label: "Single tweet" },
    { id: "thread", label: "Thread" },
  ],
  threads: [
    { id: "classic", label: "Single post" },
    { id: "thread", label: "Thread" },
  ],
  facebook: [
    { id: "classic", label: "Classic post" },
    { id: "narrative", label: "Storytelling" },
    { id: "bullets", label: "List post" },
  ],
}

export function SettingsPanel() {
  const { network, tone, format, count, setNetwork, setTone, setFormat, setCount } = useAppStore()

  const availableFormats = FORMATS_BY_NETWORK[network]
  const validFormat = availableFormats.some((f) => f.id === format) ? format : availableFormats[0].id

  const handleNetworkChange = (n: Network) => {
    setNetwork(n)
    const formats = FORMATS_BY_NETWORK[n]
    if (!formats.some((f) => f.id === format)) setFormat(formats[0].id)
  }

  return (
    <div className="space-y-6">
      {/* Network */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
          Platform
        </label>
        <div className="grid grid-cols-1 gap-2">
          {NETWORKS.map((n) => (
            <button
              key={n.id}
              onClick={() => handleNetworkChange(n.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 text-left",
                network === n.id
                  ? `${n.bg} ${n.color} border-current/40 shadow-sm`
                  : "border-border hover:border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className={cn("w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                network === n.id ? `${n.bg} ${n.color}` : "bg-muted text-muted-foreground"
              )}>
                {n.icon}
              </span>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Format */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
          Format
        </label>
        <div className="flex flex-wrap gap-2">
          {availableFormats.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
                validFormat === f.id
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tone */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
          Tone
        </label>
        <div className="space-y-1.5">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all duration-200",
                tone === t.id
                  ? "bg-[#EEF2FD] border-[#2D5BE3]/40 text-[#2D5BE3]"
                  : "border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-sm font-medium">{t.label}</span>
              <span className={cn("text-xs", tone === t.id ? "text-[#2D5BE3]/70" : "text-muted-foreground/60")}>
                {t.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Count */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
          Proposals
        </label>
        <div className="flex gap-2">
          {[3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={cn(
                "flex-1 py-2 rounded-lg border text-sm font-semibold transition-all duration-200",
                count === n
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
