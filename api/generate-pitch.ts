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
    seriesRead: Array<{ series: string; count: number }>
    sourceName: string
  } | null
  ownerName?: string
}

function formatTasteProfile(profile: RequestBody['tasteProfile']): string {
  if (!profile) return 'No reading history available.'
  const genres = profile.topGenres.slice(0, 4).map(g => `${g.genre} (${g.percentage}%)`).join(', ')
  const commitsSeries = profile.seriesRead.length > 3
  return `Reads: ${genres}.${commitsSeries ? ' Commits to series.' : ''}`
}

async function verifyAuth(authHeader: string | null): Promise<'owner' | 'share' | null> {
  if (!authHeader) return null

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })
    const { data: { user }, error } = await supabase.auth.getUser(token)
    return (!error && user !== null) ? 'owner' : null
  }

  if (authHeader.startsWith('ShareToken ')) {
    const provided = authHeader.slice(11)
    return (shareToken.length > 0 && provided === shareToken) ? 'share' : null
  }

  return null
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const authType = await verifyAuth(req.headers.get('Authorization'))
  if (!authType) {
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

  const userMessage = `Reader: ${name}. ${tasteContext}${book.friendNote ? ` Friend's note: "${book.friendNote}"` : ''}

Book: "${book.title}" by ${book.author}.

Write the pitch. Then on a new line: SCORE: X (1–10 fit with reader taste). No other text after the score.`

  const client = new Anthropic({ apiKey: anthropicKey })

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    system:
      `You are a well-read, slightly sardonic friend texting someone ABOUT a reader and a book — third party, not addressing the reader directly. 2–3 sentences max. Be specific about what makes this book itself interesting. The reader's name or a taste observation ("she's gonna eat this up", "it's a series too", "right in her wheelhouse") should appear somewhere but not necessarily first. Vary how you open — lead with the book's premise, a specific detail, a wry observation, the reader's reaction, or the reader's name, in roughly equal rotation. Never start with "it's got". Never directly address the reader as "you/your" — generic "you" is fine. No filler, no formula.`,
    messages: [{ role: 'user', content: userMessage }],
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      let fullText = ''
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(event.delta.text))
          fullText += event.delta.text
        }
      }

      // For suggest-form submissions: save the pitch so the library shows
      // the same text the submitter saw, rather than generating a new one later.
      if (authType === 'share') {
        const scoreMatch = fullText.match(/\nSCORE:\s*(\d+)\s*$/)
        const tasteScore = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]!, 10))) : 5
        const pitch = fullText.replace(/\nSCORE:\s*\d+\s*$/, '').trim()
        const supa = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
        await supa.from('books').update({
          ai_pitch: pitch,
          taste_score: tasteScore,
          ai_pitch_generated_at: new Date().toISOString(),
        }).eq('id', book.id)
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
