import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { BookRecommendation } from './types'

const url  = (import.meta as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL
const key  = (import.meta as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null = (url && key)
  ? createClient(url, key)
  : null

export const isSupabaseConfigured = () => supabase !== null

// ── Row shape in Postgres (snake_case) ──────────────────────────────────────

interface DbBook {
  id: string
  title: string
  author: string
  recommender: string
  friend_note: string | null
  date_added: string
  ai_pitch: string | null
  taste_score: number | null
  ai_pitch_generated_at: string | null
}

function fromDb(row: DbBook): BookRecommendation {
  return {
    id:                   row.id,
    title:                row.title,
    author:               row.author,
    recommender:          row.recommender,
    friendNote:           row.friend_note ?? undefined,
    dateAdded:            row.date_added,
    aiPitch:              row.ai_pitch ?? undefined,
    tasteScore:           row.taste_score ?? undefined,
    aiPitchGeneratedAt:   row.ai_pitch_generated_at ?? undefined,
  }
}

function toDb(book: BookRecommendation): DbBook {
  return {
    id:                    book.id,
    title:                 book.title,
    author:                book.author,
    recommender:           book.recommender,
    friend_note:           book.friendNote ?? null,
    date_added:            book.dateAdded,
    ai_pitch:              book.aiPitch ?? null,
    taste_score:           book.tasteScore ?? null,
    ai_pitch_generated_at: book.aiPitchGeneratedAt ?? null,
  }
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

const PUBLIC_COLS = 'id, title, author, recommender, date_added, ai_pitch, taste_score, ai_pitch_generated_at'
const OWNER_COLS  = PUBLIC_COLS + ', friend_note'

export async function sbFetchBooks(): Promise<BookRecommendation[]> {
  if (!supabase) return []
  const { data: { session } } = await supabase.auth.getSession()
  const cols = session ? OWNER_COLS : PUBLIC_COLS
  const { data, error } = await supabase
    .from('books')
    .select(cols)
    .order('date_added', { ascending: false })
  if (error) throw error
  return (data as DbBook[]).map(fromDb)
}

export async function sbInsertBook(book: BookRecommendation): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('books').insert(toDb(book))
  if (error) throw error
}

export async function sbUpdateBook(id: string, updates: Partial<BookRecommendation>): Promise<void> {
  if (!supabase) return
  const partial: Partial<DbBook> = {}
  if (updates.aiPitch            !== undefined) partial.ai_pitch              = updates.aiPitch
  if (updates.tasteScore         !== undefined) partial.taste_score           = updates.tasteScore
  if (updates.aiPitchGeneratedAt !== undefined) partial.ai_pitch_generated_at = updates.aiPitchGeneratedAt
  const { error } = await supabase.from('books').update(partial).eq('id', id)
  if (error) throw error
}

export async function sbDeleteBook(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('books').delete().eq('id', id)
  if (error) throw error
}

// ── Realtime ─────────────────────────────────────────────────────────────────

export function subscribeToBooks(onChange: (books: BookRecommendation[]) => void) {
  if (!supabase) return () => {}

  const channel = supabase
    .channel('books-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, async () => {
      // Re-fetch on any change rather than trying to merge individual events
      const books = await sbFetchBooks()
      onChange(books)
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}
