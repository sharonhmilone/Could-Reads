import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

const supabaseUrl      = process.env.VITE_SUPABASE_URL!
const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anthropicKey     = process.env.ANTHROPIC_API_KEY!

interface RequestBody {
  book: {
    id: string
    title: string
    author: string
    friendNote?: string
  }
  tasteProfile: {
    totalBooksRead: number
    topGenres: Array<{ genre: string; count: number; percentage: number }>
    topAuthors: Array<{ author: string; count: number }>
    seriesRead: Array<{ series: string; count: number }>
    sampleBooks: Array<{ title: string; author: string; genre: string | null; series: string | null }>
    sourceName: string
  } | null
}

function formatTasteProfile(profile: RequestBody['tasteProfile']): string {
  if (!profile) return 'No reading history provided — write a generally compelling pitch and score 5.'

  const genres  = profile.topGenres.slice(0, 5).map(g => `${g.genre} (${g.percentage}%)`).join(', ')
  const authors = profile.topAuthors.slice(0, 6).map(a => a.author).join(', ')
  const series  = profile.seriesRead.slice(0, 5).map(s => s.series).join(', ')
  const samples = profile.sampleBooks.slice(0, 6).map(b => `"${b.title}" by ${b.author}`).join('; ')

  return `${profile.totalBooksRead} books read from ${profile.sourceName}. ` +
    `Top genres: ${genres}. ` +
    `Favourite authors: ${authors}. ` +
    `Series committed to: ${series}. ` +
    `Sample titles: ${samples}.`
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Verify Supabase auth JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }
  const token = authHeader.slice(7)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: RequestBody
  try {
    body = await req.json() as RequestBody
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const { book, tasteProfile } = body
  const tasteContext   = formatTasteProfile(tasteProfile)
  const friendContext  = book.friendNote ? `\nTheir friend noted: "${book.friendNote}"` : ''

  const userMessage = `Reading history: ${tasteContext}

Recommended book: "${book.title}" by ${book.author}.${friendContext}

Write a 2–3 sentence personal pitch for why this reader should read this book, drawing on their genre preferences and authors they've enjoyed. Then on a new line output exactly: SCORE: X (where X is 1–10 measuring how well this book fits their established reading patterns — 10 means it sits squarely in genres and styles they already love, 1 means it's quite different from anything they've read. Do not factor in ratings — they don't rate books, if they read it they liked it). No other text after the score line.`

  const client = new Anthropic({ apiKey: anthropicKey })

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 220,
    system:
      'You are a literary matchmaker. You understand a reader purely from what they have chosen to read — genre patterns, authors they return to, series they commit to. Write brief personal pitches (2–3 sentences) then output SCORE: X on its own line. Base the score entirely on genre/style/author fit, not ratings.',
    messages: [{ role: 'user', content: userMessage }],
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
