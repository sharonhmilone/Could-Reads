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

  const userMessage = `Reader: ${name}
Reading taste: ${tasteContext}

Book: "${book.title}" by ${book.author}.${friendContext}

Write a 2–3 sentence pitch for why ${name} would enjoy this book. Refer to ${name} by name at least once but don't open every sentence with it — vary the phrasing. Focus on genre feel, atmosphere, and themes; don't list specific books or authors from their history. Then on a new line: SCORE: X (1–10 fit with their reading patterns). No other text after the score line.`

  const client = new Anthropic({ apiKey: anthropicKey })

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system:
      `You are a sardonic literary matchmaker — witty, a little cheeky, genuinely opinionated about books. Write 2–3 sentence pitches in third person about the reader (use "she/her" or their name — never "you" or "your"). Vary your opening: sometimes lead with the book ("This one has..."), sometimes with a genre observation, sometimes with a wry take — don't open with the reader's name every time. The name should land naturally mid-pitch or at the end, not robotically at the start. Keep it conversational, like a well-read friend recommending something. Never use the word "gravitate". End with SCORE: X on its own line.`,
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
