import Anthropic from '@anthropic-ai/sdk'
import type { BookRecommendation, TasteProfile } from './types'
import { formatTasteProfileForAI } from './csv'

// Cache client per API key to avoid re-instantiating on every call
let _client: { key: string; instance: Anthropic } | null = null
function getClient(apiKey: string): Anthropic {
  if (_client?.key === apiKey) return _client.instance
  _client = { key: apiKey, instance: new Anthropic({ apiKey, dangerouslyAllowBrowser: true }) }
  return _client.instance
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

export async function generateWhyReadPitch(
  params: GeneratePitchParams
): Promise<GeneratePitchResult> {
  const { apiKey, book, tasteProfile, onChunk } = params
  const client = getClient(apiKey)

  const tasteContext = tasteProfile
    ? formatTasteProfileForAI(tasteProfile)
    : 'No reading history provided — write a generally compelling pitch and score 5.'

  const friendContext = book.friendNote
    ? `\nTheir friend noted: "${book.friendNote}"`
    : ''

  const userMessage = `Reading history: ${tasteContext}

Recommended book: "${book.title}" by ${book.author}.${friendContext}

Write a 2–3 sentence personal pitch for why this reader should read this book, drawing on their genre preferences and authors they've enjoyed. Then on a new line output exactly: SCORE: X (where X is 1–10 measuring how well this book fits their established reading patterns — 10 means it sits squarely in genres and styles they already love, 1 means it's quite different from anything they've read. Do not factor in ratings — they don't rate books, if they read it they liked it). No other text after the score line.`

  let accumulated = ''
  let scoreLineStarted = false

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 220,
    system:
      'You are a literary matchmaker. You understand a reader purely from what they have chosen to read — genre patterns, authors they return to, series they commit to. Write brief personal pitches (2–3 sentences) then output SCORE: X on its own line. Base the score entirely on genre/style/author fit, not ratings.',
    messages: [{ role: 'user', content: userMessage }],
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      const chunk = event.delta.text
      accumulated += chunk

      // Only start checking for SCORE once we see a newline — avoids regex on every early chunk.
      // Once the SCORE line has started, stop forwarding chunks to the UI entirely.
      if (!scoreLineStarted) {
        const tail = accumulated.slice(-20)
        if (/\nSCORE:?\s*\d*$/.test(tail)) {
          scoreLineStarted = true
        } else {
          onChunk(chunk)
        }
      }
    }
  }

  const scoreMatch = accumulated.match(/\nSCORE:\s*(\d+)\s*$/)
  const tasteScore = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]!, 10))) : 5
  const pitch = accumulated.replace(/\nSCORE:\s*\d+\s*$/, '').trim()

  return { pitch, tasteScore }
}
