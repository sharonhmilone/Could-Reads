import type { BookRecommendation, TasteProfile } from './types'
import { supabase } from './supabase'
import { getOwnerName } from './storage'

export interface GeneratePitchResult {
  pitch: string
  tasteScore: number // 1–10
}

export interface GeneratePitchParams {
  book: BookRecommendation
  tasteProfile: TasteProfile | null
  onChunk: (text: string) => void
}

async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export async function generateWhyReadPitch(
  params: GeneratePitchParams
): Promise<GeneratePitchResult> {
  const { book, tasteProfile, onChunk } = params

  const token = await getAccessToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch('/api/generate-pitch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ book, tasteProfile, ownerName: getOwnerName() || undefined }),
  })

  if (!res.ok) {
    throw new Error(`generate-pitch returned ${res.status}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let accumulated = ''
  let scoreLineStarted = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    accumulated += chunk

    if (!scoreLineStarted) {
      const tail = accumulated.slice(-20)
      if (/\nSCORE:?\s*\d*$/.test(tail)) {
        scoreLineStarted = true
      } else {
        onChunk(chunk)
      }
    }
  }

  const scoreMatch = accumulated.match(/\nSCORE:\s*(\d+)\s*$/)
  const tasteScore = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]!, 10))) : 5
  const pitch = accumulated.replace(/\nSCORE:\s*\d+\s*$/, '').trim()

  return { pitch, tasteScore }
}
