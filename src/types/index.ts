export type Network = "linkedin" | "instagram" | "twitter" | "threads" | "facebook"
export type Tone = "professional" | "inspiring" | "humorous" | "educational" | "provocative" | "storytelling"
export type Format = "classic" | "carousel" | "thread" | "bullets" | "narrative"
export type Language = "fr" | "en"

export interface ExtractResult {
  title: string
  summary: string
  body: string
  sourceUrl?: string
  wordCount: number
}

export interface CarouselSlide {
  slide: number
  title: string
  body: string
  visual_hint: string
}

export interface CarouselPost {
  type: "carousel"
  slides: CarouselSlide[]
  caption: string
  hashtags: string[]
}

export interface ClassicPost {
  type: "classic" | "thread" | "bullets" | "narrative"
  content: string
  hashtags?: string[]
}

export type GeneratedPost = CarouselPost | ClassicPost

export interface Proposal {
  id: string
  network: Network
  tone: Tone
  format: Format
  post: GeneratedPost
  charCount: number
  angle: string
}

export interface GenerateRequest {
  content: string
  sourceUrl?: string
  network: Network
  tone: Tone
  format: Format
  count: number
  language: Language
}

export interface GenerateResponse {
  proposals: Proposal[]
}

export interface ExtractRequest {
  url?: string
  // PDF sent as FormData
}
