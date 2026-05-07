import type { Network, Tone, Format, Language } from "@/types"

const NETWORK_CONSTRAINTS: Record<Network, string> = {
  linkedin: `
PLATFORM: LinkedIn
- Max 1300 characters for best reach (can go up to 3000 but avoid it)
- First 2-3 lines are crucial (visible before "see more") — must hook immediately
- Use line breaks generously for readability
- 3-5 hashtags at the end (professional, relevant)
- Strong call-to-action in the last line (question, invitation to comment)
- No more than 1-2 emojis unless tone demands more
- Professional storytelling and thought leadership perform well`,

  instagram: `
PLATFORM: Instagram
- Max 2200 characters
- First line must be a hook (visible before truncation)
- Use emojis naturally throughout (3-8 per post)
- 5-15 hashtags (mix of niche + broad), often placed at end or in comments
- Conversational, visual, aspirational tone works best
- Short paragraphs, lots of whitespace`,

  twitter: `
PLATFORM: Twitter/X
- STRICT 280 characters per tweet
- If format is "thread": generate 5-8 numbered tweets (1/7, 2/7, etc.), each under 280 chars
- Be punchy, direct, opinionated — no fluff
- 1-2 hashtags max if any
- Hooks with a surprising statement, question, or bold claim`,

  threads: `
PLATFORM: Threads
- Similar to Twitter but more conversational (up to 500 chars per post)
- If format is "thread": 4-6 connected posts
- Casual, authentic, less polished than LinkedIn
- Questions and opinions drive engagement
- 0-3 hashtags`,

  facebook: `
PLATFORM: Facebook
- No strict character limit — medium length (200-800 chars) works best
- Storytelling and personal anecdotes perform well
- Questions at the end boost comments
- 2-3 emojis max
- 1-3 hashtags or none
- Warm, community-oriented tone`,
}

const TONE_INSTRUCTIONS: Record<Tone, string> = {
  professional: "Write with authority and expertise. Use precise language, cite insights, build credibility. Avoid slang or humor.",
  inspiring: "Write with energy and optimism. Use vivid language, positive framing, and motivational endings. Make the reader feel empowered.",
  humorous: "Be witty, use wordplay, light self-deprecation, or unexpected twists. Keep it smart — not silly. One good laugh beats three weak jokes.",
  educational: "Teach something clearly. Use simple explanations, examples, and step-by-step reasoning. Leave the reader smarter than before.",
  provocative: "Challenge assumptions, take a strong stance, use contrarian angles. Start with something that makes people stop scrolling. Be bold but not offensive.",
  storytelling: "Open with a scene or moment (not a fact). Build narrative tension. Let insights emerge from the story, not precede it.",
}

const FORMAT_INSTRUCTIONS: Record<Format, string> = {
  classic: "Write a single cohesive post with a clear beginning, middle, and end. One main idea, well-developed.",
  carousel: `Generate a carousel with 5-8 slides. Return JSON format ONLY (no surrounding text):
{
  "type": "carousel",
  "slides": [
    { "slide": 1, "title": "Hook title (max 8 words)", "body": "Slide content (40-80 words)", "visual_hint": "Brief visual description for designer" },
    ...
  ],
  "caption": "Instagram caption to go with the carousel (100-200 chars + emojis)",
  "hashtags": ["hashtag1", "hashtag2", ...]
}`,
  thread: "Write a numbered thread. Each tweet/post must stand alone and flow naturally to the next. Number them (1/N, 2/N, etc.).",
  bullets: "Use numbered lists (1. 2. 3.) or emoji-prefixed lines for structure. Each point must be crisp and valuable. Open with a strong hook line before the list. Do NOT use dashes or markdown bullets.",
  narrative: "Tell it as a story. Use a personal 'I' voice even if fictional. Create a narrative arc: situation → complication → insight → resolution.",
}

export function buildSystemPrompt(network: Network, tone: Tone, format: Format, count: number, language: Language): string {
  const langLabel = language === "fr" ? "French" : "English"
  return `You are an expert social media copywriter with deep knowledge of what performs on each platform.

Your task: Generate EXACTLY ${count} DISTINCT social media posts for ${network.toUpperCase()}.

LANGUAGE: Write ALL post content in ${langLabel}. Every word of every post must be in ${langLabel}. Do not mix languages.

${NETWORK_CONSTRAINTS[network]}

TONE: ${TONE_INSTRUCTIONS[tone]}

FORMAT: ${FORMAT_INSTRUCTIONS[format]}

FORMATTING RULES (STRICTLY ENFORCED):
- NO markdown: no **bold**, no *italic*, no __underline__, no ~~strikethrough~~
- NO bullet dashes: never start a line with "- " or "• " unless format explicitly uses bullets
- NO em dashes (—) as decoration: use plain punctuation (. , : ) instead
- Write exactly as text appears on a real social media post — plain Unicode text only
- Line breaks are fine and encouraged for rhythm, but no markdown symbols whatsoever

CRITICAL RULES:
1. Generate EXACTLY ${count} proposals, each with a DIFFERENT angle or hook — not just slight variations
2. Each proposal must respect the platform constraints strictly
3. Make each post feel native to ${network} — don't just reformat the same content
4. Vary the entry angle: data-driven, personal story, question, bold claim, contrarian take, etc.
5. Quality over quantity — every word must earn its place

${format === "carousel"
    ? `OUTPUT FORMAT: Return a JSON array of ${count} objects. Each object MUST have:
{
  "angle": "one-line description of this post's unique angle",
  "post": { ...carousel JSON as specified above... }
}
Return ONLY the JSON array, no other text.`
    : `OUTPUT FORMAT: Return a JSON array of ${count} objects. Each object MUST have:
{
  "angle": "one-line description of this post's unique angle",
  "post": {
    "type": "${format}",
    "content": "the full post text",
    "hashtags": ["tag1", "tag2"] // optional, only if platform uses hashtags
  }
}
Return ONLY the JSON array, no other text.`
  }`
}

export function buildUserPrompt(content: string, sourceUrl?: string): string {
  return `Here is the source content to transform into social media posts:

${sourceUrl ? `SOURCE URL: ${sourceUrl}\n` : ""}

CONTENT:
${content.slice(0, 8000)}

Transform this into compelling social media posts following the system instructions exactly.
Focus on the most impactful insights, surprising facts, or actionable takeaways.
Do NOT summarize boringly — find the angles that make people stop scrolling.`
}
