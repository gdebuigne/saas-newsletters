"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center group-hover:bg-[#2D5BE3] transition-colors duration-200">
            <Zap className="w-4 h-4 text-background" />
          </div>
          <span className="font-display font-semibold text-base tracking-tight text-foreground">
            PostCraft
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
              pathname === "/dashboard"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
}
