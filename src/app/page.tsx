import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Zap, Link2, Sparkles, Copy, ArrowRight, FileText, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const STEPS = [
  {
    icon: Link2,
    title: "Paste a URL or upload a PDF",
    desc: "Share any article, blog post, newsletter, or document. We extract the key content automatically.",
  },
  {
    icon: Settings2,
    title: "Configure your settings",
    desc: "Choose your platform, tone, format, and how many proposals you want. Six tones, five networks.",
  },
  {
    icon: Sparkles,
    title: "Get posts in seconds",
    desc: "Claude AI generates distinct, platform-native proposals — each with a unique angle.",
  },
]

const TESTIMONIALS = [
  {
    quote: "I used to spend 2 hours repurposing content. Now it takes 5 minutes. The LinkedIn posts especially are spot-on.",
    name: "Sophie M.",
    role: "Content Strategist",
  },
  {
    quote: "The carousel feature for Instagram is incredible. Saves my team hours every week.",
    name: "Thomas R.",
    role: "Social Media Manager",
  },
  {
    quote: "Finally a tool that understands each platform has its own language. The Twitter threads are actually good.",
    name: "Léa D.",
    role: "Founder, B2B SaaS",
  },
]

const NETWORKS = [
  { name: "LinkedIn", color: "text-[#0A66C2]", bg: "bg-[#E8F0FA]" },
  { name: "Instagram", color: "text-[#E1306C]", bg: "bg-[#FCE8EF]" },
  { name: "Twitter/X", color: "text-[#1DA1F2]", bg: "bg-[#E8F5FD]" },
  { name: "Threads", color: "text-foreground", bg: "bg-muted" },
  { name: "Facebook", color: "text-[#1877F2]", bg: "bg-[#E8F0FE]" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 lg:py-28">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF2FD] border border-[#2D5BE3]/20 text-xs font-medium text-[#2D5BE3] mb-8">
          <Zap className="w-3 h-3" />
          Powered by Claude AI
        </div>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight max-w-3xl leading-[1.05]">
          Turn any content into{" "}
          <span className="text-[#2D5BE3]">social posts</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
          Paste a URL or upload a PDF. Get 3–5 platform-native post proposals for LinkedIn, Instagram, Twitter, Threads, and Facebook — in seconds.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 h-12 px-6 text-sm font-semibold">
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="h-12 px-6 text-sm font-medium">
              See demo
            </Button>
          </Link>
        </div>

        {/* Network pills */}
        <div className="mt-12 flex flex-wrap gap-2 justify-center">
          {NETWORKS.map((n) => (
            <span
              key={n.name}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border border-current/20 ${n.bg} ${n.color}`}
            >
              {n.name}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F5F4F0] border-y border-border py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Three steps. That&apos;s it.
            </h2>
            <p className="mt-3 text-muted-foreground">No learning curve, no templates to fill — just results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FD] flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-[#2D5BE3]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Step {i + 1}</p>
                  <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Everything you need
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Link2, title: "URL extraction", desc: "Paste any article URL — we scrape title, summary and body automatically." },
              { icon: FileText, title: "PDF support", desc: "Upload documents, reports or newsletters as PDFs. Drag & drop ready." },
              { icon: Sparkles, title: "6 tones of voice", desc: "Professional, inspiring, humorous, educational, provocative, storytelling." },
              { icon: Copy, title: "One-click copy", desc: "Copy any post to clipboard instantly. Edit inline before posting." },
            ].map((f, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-xl border border-border hover:border-[#2D5BE3]/30 hover:bg-[#EEF2FD]/20 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-[#EEF2FD] flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-[#2D5BE3]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F5F4F0] border-y border-border py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground tracking-tight">
              Loved by content creators
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Ready to save hours every week?
          </h2>
          <p className="text-muted-foreground mb-8">Start turning your content into posts right now — no signup required.</p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 h-12 px-8 text-sm font-semibold">
              Open the dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="text-sm font-semibold font-display text-foreground">PostCraft</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 PostCraft — Content-to-social, effortlessly.</p>
        </div>
      </footer>
    </div>
  )
}
