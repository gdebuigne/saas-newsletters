import { Navbar } from "@/components/Navbar"
import { InputPanel } from "@/components/InputPanel"
import { SettingsPanel } from "@/components/SettingsPanel"
import { ProposalsGrid } from "@/components/ProposalsGrid"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-[#F5F4F0]/50">
          <div className="sticky top-14 p-5 space-y-5 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Content source
              </h2>
              <InputPanel />
            </div>
            <Separator />
            <SettingsPanel />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-5 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
                Your posts
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Generate, edit, and copy optimized social media posts from any content.
              </p>
            </div>
            <ProposalsGrid />
          </div>
        </main>
      </div>
    </div>
  )
}
