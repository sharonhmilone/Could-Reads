import Anthropic from '@anthropic-ai/sdk'
import type { BookRecommendation, TasteProfile } from './types'
import { formatTasteProfileForAI } from './csv'

function makeClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

export interface GeneratePitchParams {
  apiKey: string
  book: BookRecommendation
  tasteProfile: TasteProfile | null
  onChunk: (text: string) => void
}

export async function generateWhyReadPitch(params: GeneratePitchParams): Promise<string> {
  const { apiKey, book, tasteProfile, onChunk } = params
  const client = makeClient(apiKey)

  const tasteContext = tasteProfile
    ? formatTasteProfileForAI(tasteProfile)
    : 'No reading history available — write a generally compelling pitch.'

  const friendContext = book.friendNote
    ? `\nTheir friend noted: "${book.friendNote}"`
    : ''

  const userMessage = `Reading history: ${tasteContext}

The reader has been recommended: "${book.title}" by ${book.author}.${friendContext}

Write a 2-3 sentence personal pitch for why THIS specific reader should read this book. Be specific, reference their taste where relevant. Don't use filler phrases like "you'll love" or "perfect for you". Be direct and interesting.`

  let accumulated = ''

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system:
      'You are a literary matchmaker. You write brief, personal, compelling pitches for why a specific reader should read a specific book. Two to three sentences. Direct, warm, no fluff.',
    messages: [{ role: 'user', content: userMessage }],
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      accumulated += event.delta.text
      onChunk(event.delta.text)
    }
  }

  return accumulated
}
