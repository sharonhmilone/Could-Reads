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

function formatTasteProfile(profile: RequestBody['tasteProfile']): string {
  if (!profile) return 'No reading history available.'
  const genres = profile.topGenres.slice(0, 3).map(g => g.genre).join(', ')
  return `Reads mostly: ${genres}.`
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
  const name         = ownerName?.trim() || 'she'
  const tasteContext = formatTasteProfile(tasteProfile)
  const friendContext = book.friendNote ? ` A friend said: "${book.friendNote}"` : ''

  const userMessage = `Reader taste (for scoring only — do not mention in pitch): ${tasteContext}

Book: "${book.title}" by ${book.author}.${friendContext}

Write a 2–3 sentence pitch about this book. Then on a new line: SCORE: X (1–10 fit with reader taste). No other text after the score.`

  const client = new Anthropic({ apiKey: anthropicKey })

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system:
      `You are a well-read friend recommending a book. Write 2–3 casual, specific sentences about what makes this book itself good — the vibe, the tension, what's fun or surprising about it. Use "she" or ${JSON.stringify(name)} (never "you" or "your"). Drop the name in naturally if at all — don't open with it, don't force it. Never start with the book title or the author name. No genre labels, no author comparisons, no filler phrases. Sound like a person, not a review.`,
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
