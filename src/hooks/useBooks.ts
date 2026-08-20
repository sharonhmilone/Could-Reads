import { useState, useCallback, useEffect } from 'react'
import { getBooks, saveBooks } from '@/lib/storage'
import {
  isSupabaseConfigured,
  describeSupabaseError,
  sbFetchBooks,
  sbInsertBook,
  sbUpdateBook,
  sbDeleteBook,
  subscribeToBooks,
} from '@/lib/supabase'
import type { BookRecommendation } from '@/lib/types'

export function useBooks() {
  const useSupabase = isSupabaseConfigured()

  const [books, setBooks] = useState<BookRecommendation[]>(() =>
    useSupabase ? [] : getBooks()
  )
  const [loading, setLoading] = useState(useSupabase)
  const [error, setError]     = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  // When Supabase is configured: fetch on mount + subscribe to realtime changes
  useEffect(() => {
    if (!useSupabase) return
    let cancelled = false

    setLoading(true)
    sbFetchBooks()
      .then((data) => {
        if (cancelled) return
        setBooks(data); setError(null); setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        // Surface the failure instead of rendering an empty shelf, which reads
        // as "no one has recommended anything" rather than "the database is down"
        setError(describeSupabaseError(err)); setLoading(false)
      })

    const unsubscribe = subscribeToBooks((next) => {
      setBooks(next); setError(null)
    })
    return () => { cancelled = true; unsubscribe() }
  }, [useSupabase, reloadKey])

  const retry = useCallback(() => setReloadKey((k) => k + 1), [])

  const addBook = useCallback(
    async (book: Omit<BookRecommendation, 'id' | 'dateAdded'>) => {
      const newBook: BookRecommendation = {
        ...book,
        id: crypto.randomUUID(),
        dateAdded: new Date().toISOString(),
      }
      if (useSupabase) {
        try {
          await sbInsertBook(newBook)
        } catch (err) {
          setError(describeSupabaseError(err))
          throw err
        }
        // Realtime subscription will update state; optimistically update too
        setBooks((prev) => [newBook, ...prev])
      } else {
        const next = [newBook, ...books]
        saveBooks(next)
        setBooks(next)
      }
      return newBook
    },
    [books, useSupabase]
  )

  const updateBook = useCallback(
    async (id: string, updates: Partial<BookRecommendation>) => {
      if (useSupabase) {
        try {
          await sbUpdateBook(id, updates)
        } catch (err) {
          setError(describeSupabaseError(err))
          throw err
        }
      }
      const next = books.map((b) => (b.id === id ? { ...b, ...updates } : b))
      if (!useSupabase) saveBooks(next)
      setBooks(next)
    },
    [books, useSupabase]
  )

  const deleteBook = useCallback(
    async (id: string) => {
      if (useSupabase) {
        try {
          await sbDeleteBook(id)
        } catch (err) {
          setError(describeSupabaseError(err))
          throw err
        }
      }
      const next = books.filter((b) => b.id !== id)
      if (!useSupabase) saveBooks(next)
      setBooks(next)
    },
    [books, useSupabase]
  )

  return { books, loading, error, retry, addBook, updateBook, deleteBook }
}
