"use client"

import { create } from "zustand"
import type { ExtractResult, Network, Tone, Format, Proposal, Language } from "@/types"

interface AppState {
  // Extracted content
  extracted: ExtractResult | null
  isExtracting: boolean
  extractError: string | null

  // Settings
  network: Network
  tone: Tone
  format: Format
  count: number
  language: Language

  // URL input (shared so GenerateButton can extract-then-generate)
  urlInput: string

  // Generated proposals
  proposals: Proposal[]
  isGenerating: boolean
  generateError: string | null

  // Actions
  setExtracted: (result: ExtractResult | null) => void
  setIsExtracting: (v: boolean) => void
  setExtractError: (e: string | null) => void
  setNetwork: (n: Network) => void
  setTone: (t: Tone) => void
  setFormat: (f: Format) => void
  setCount: (c: number) => void
  setLanguage: (l: Language) => void
  setUrlInput: (s: string) => void
  setProposals: (p: Proposal[]) => void
  updateProposal: (id: string, updated: Proposal) => void
  removeProposal: (id: string) => void
  setIsGenerating: (v: boolean) => void
  setGenerateError: (e: string | null) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  extracted: null,
  isExtracting: false,
  extractError: null,
  network: "linkedin",
  tone: "professional",
  format: "classic",
  count: 3,
  language: "fr",
  urlInput: "",
  proposals: [],
  isGenerating: false,
  generateError: null,

  setExtracted: (result) => set({ extracted: result, extractError: null }),
  setIsExtracting: (v) => set({ isExtracting: v }),
  setExtractError: (e) => set({ extractError: e, isExtracting: false }),
  setNetwork: (n) => set({ network: n }),
  setTone: (t) => set({ tone: t }),
  setFormat: (f) => set({ format: f }),
  setCount: (c) => set({ count: c }),
  setLanguage: (l) => set({ language: l }),
  setUrlInput: (s) => set({ urlInput: s }),
  setProposals: (p) => set({ proposals: p }),
  updateProposal: (id, updated) =>
    set((s) => ({ proposals: s.proposals.map((p) => (p.id === id ? updated : p)) })),
  removeProposal: (id) =>
    set((s) => ({ proposals: s.proposals.filter((p) => p.id !== id) })),
  setIsGenerating: (v) => set({ isGenerating: v }),
  setGenerateError: (e) => set({ generateError: e, isGenerating: false }),
  reset: () =>
    set({
      extracted: null,
      proposals: [],
      extractError: null,
      generateError: null,
    }),
}))
