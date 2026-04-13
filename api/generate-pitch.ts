import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

const supabaseUrl      = process.env.VITE_SUPABASE_URL!
const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anthropicKey     = process.env.ANTHROPIC_API_KEY!
const shareToken       = process.env.SHARE_TOKEN ?? ''

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
    sourceName: string
  } | null
  ownerName?: string
}

function formatTasteProfile(profile: RequestBody['tasteProfile'], name: string): string {
  if (!profile) return `No reading history — write a generally compelling pitch.`

  const genres  = profile.topGenres.slice(0, 3).map(g => `${g.genre} (${g.percentage}%)`).join(', ')
  const authors = profile.topAuthors.slice(0, 2).map(a => a.author).join(' and ')

  return `${name} has read ${profile.totalBooksRead} books from ${profile.sourceName}. ` +
    `Top genres: ${genres}. ` +
    (authors ? `Tends to love: ${authors}.` : '')
}

async function verifyAuth(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false

  // Owner via Supabase JWT
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })
    const { data: { user }, error } = await supabase.auth.getUser(token)
    return !error && user !== null
  }

  // Suggest form via share token
  if (authHeader.startsWith('ShareToken ')) {
    const provided = authHeader.slice(11)
    return shareToken.length > 0 && provided === shareToken
  }

  return false
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const authed = await verifyAuth(req.headers.get('Authorization'))
  if (!authed) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: RequestBody
  try {
    body = await req.json() as RequestBody
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const { book, tasteProfile, ownerName } = body
  const name         = ownerName?.trim() || 'this reader'
  const tasteContext = formatTasteProfile(tasteProfile, name)
  const friendContext = book.friendNote ? `\nA friend noted: "${book.friendNote}"` : ''

  const userMessage = `Reader background (use as silent context only — do not narrate it back): ${name} — ${tasteContext}

Book: "${book.title}" by ${book.author}.${friendContext}

Write a 2–3 sentence pitch. Lead with the book. End with SCORE: X (1–10). No other text after the score line.`

  const client = new Anthropic({ apiKey: anthropicKey })

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system:
      `You are a well-read friend making a personal book recommendation — opinionated, a little dry, warm but not gushing. Write 2–3 sentences in third person (use "she/her" or the reader's name; never "you" or "your"). Lead with what makes the book itself compelling — its atmosphere, tensions, the thing that makes it distinctive. Use your knowledge of the reader's taste as silent background, not something to narrate out loud. Don't write about what genres she likes; write about the book in a way that makes it obvious why she'll like it. The reader's name should appear naturally — mid-pitch or at the end — not at the opening of every sentence. Keep the language specific and concrete; avoid vague filler words and generic "literary recommendation" phrasing. End with SCORE: X on its own line.`,
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
