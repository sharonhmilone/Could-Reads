import Anthropic from '@anthropic-ai/sdk'
import type { BookRecommendation, TasteProfile } from './types'
import { formatTasteProfileForAI } from './csv'

function makeClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

export interface GeneratePitchResult {
  pitch: string
  tasteScore: number // 1–10
}

export interface GeneratePitchParams {
  apiKey: string
  book: BookRecommendation
  tasteProfile: TasteProfile | null
  onChunk: (text: string) => void
}

/**
 * Streams a personal pitch for the book, then parses a SCORE line at the end.
 * Claude outputs:
 *   <pitch text>
 *   SCORE: 8
 *
 * We strip the SCORE line from the displayed pitch text.
 */
export async function generateWhyReadPitch(
  params: GeneratePitchParams
): Promise<GeneratePitchResult> {
  const { apiKey, book, tasteProfile, onChunk } = params
  const client = makeClient(apiKey)

  const tasteContext = tasteProfile
    ? formatTasteProfileForAI(tasteProfile)
    : 'No reading history — write a generally compelling pitch and score 5.'

  const friendContext = book.friendNote
    ? `\nTheir friend noted: "${book.friendNote}"`
    : ''

  const userMessage = `Reading history: ${tasteContext}

Recommended book: "${book.title}" by ${book.author}.${friendContext}

Write a 2–3 sentence personal pitch for why this reader should read this book. Then on a new line output exactly: SCORE: X (where X is 1–10 for how well this matches their taste — 10 = perfect fit, 1 = very different from what they like). No other text after the score.`

  let accumulated = ''

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 220,
    system:
      'You are a literary matchmaker. Write brief, personal pitches (2–3 sentences) for why a specific reader should read a book, then output SCORE: X on its own line. Direct, warm, no filler.',
    messages: [{ role: 'user', content: userMessage }],
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      const chunk = event.delta.text
      accumulated += chunk

      // Only stream visible pitch text — don't stream the SCORE line
      // Detect when we hit the SCORE line and stop streaming to UI
      const scoreLine = accumulated.match(/\nSCORE:\s*\d+\s*$/)
      if (!scoreLine) {
        // Also avoid streaming a partial "\nSCORE" that's starting to appear
        const partialScore = accumulated.match(/\nSCORE:?\s*\d*$/)
        if (!partialScore) {
          onChunk(chunk)
        }
      }
    }
  }

  // Parse score from the end of accumulated text
  const scoreMatch = accumulated.match(/\nSCORE:\s*(\d+)\s*$/)
  const tasteScore = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]!, 10))) : 5

  // Strip the SCORE line from the pitch text
  const pitch = accumulated.replace(/\nSCORE:\s*\d+\s*$/, '').trim()

  return { pitch, tasteScore }
}
