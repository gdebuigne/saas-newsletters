# PostCraft — Content-to-Social Posts

Turn any article, blog post, or PDF into optimized social media posts for LinkedIn, Instagram, Twitter/X, Threads, and Facebook — powered by Claude AI.

## Features

- **URL extraction** — paste any article link, we scrape title + content automatically
- **PDF upload** — drag & drop support, up to 10MB
- **5 social networks** — LinkedIn, Instagram, Twitter/X, Threads, Facebook
- **6 tones of voice** — professional, inspiring, humorous, educational, provocative, storytelling
- **5 formats** — classic post, carousel (Instagram), thread, bullet points, narrative
- **3–5 proposals** per generation, each with a different angle
- **Instagram carousels** — slide-by-slide preview with visual hints
- **One-click copy** — instant clipboard with visual feedback
- **Inline editing** — edit any post directly before copying
- **Per-card regeneration** — re-roll a single post without regenerating everything

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local .env.local.example  # rename to track the template
```

Edit `.env.local` with your keys:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your API key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note**: `next/font` downloads Google Fonts at build time. The first `npm run build` requires internet access. `npm run dev` works with or without it.

## Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

Add `ANTHROPIC_API_KEY` in your Vercel project's Environment Variables (Settings → Environment Variables).

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + next/font
│   ├── page.tsx                # Landing page
│   ├── dashboard/page.tsx      # Main app
│   └── api/
│       ├── extract/route.ts    # URL/PDF extraction
│       └── generate/route.ts   # Claude post generation
├── components/
│   ├── Navbar.tsx
│   ├── InputPanel.tsx          # URL + PDF tabs
│   ├── SettingsPanel.tsx       # Network / tone / format / count
│   ├── ProposalsGrid.tsx       # Results grid
│   ├── PostCard.tsx            # Post card with copy/edit/regen
│   └── CarouselPreview.tsx     # Instagram carousel viewer
├── lib/
│   ├── claude.ts               # Anthropic SDK wrapper
│   ├── extractor.ts            # Cheerio URL scraper + pdf-parse
│   ├── prompts.ts              # Prompt templates per network/tone/format
│   └── store.ts                # Zustand global state
└── types/index.ts
```

## Tech stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** + **shadcn/ui**
- **Anthropic SDK** (`claude-sonnet-4-20250514`)
- **Cheerio** for URL scraping
- **pdf-parse** for PDF text extraction
- **Zustand** for state management
- **Sonner** for toast notifications
