import { useState, useCallback, useEffect } from 'react'
import { getBooks, saveBooks } from '@/lib/storage'
import {
  isSupabaseConfigured,
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

  // When Supabase is configured: fetch on mount + subscribe to realtime changes
  useEffect(() => {
    if (!useSupabase) return

    sbFetchBooks()
      .then((data) => { setBooks(data); setLoading(false) })
      .catch(() => setLoading(false))

    return subscribeToBooks(setBooks)
  }, [useSupabase])

  const addBook = useCallback(
    async (book: Omit<BookRecommendation, 'id' | 'dateAdded'>) => {
      const newBook: BookRecommendation = {
        ...book,
        id: crypto.randomUUID(),
        dateAdded: new Date().toISOString(),
      }
      if (useSupabase) {
        await sbInsertBook(newBook)
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
        await sbUpdateBook(id, updates)
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
        await sbDeleteBook(id)
      }
      const next = books.filter((b) => b.id !== id)
      if (!useSupabase) saveBooks(next)
      setBooks(next)
    },
    [books, useSupabase]
  )

  return { books, loading, addBook, updateBook, deleteBook }
}
