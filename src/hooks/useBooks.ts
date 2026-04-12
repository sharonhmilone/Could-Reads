import { useState, useCallback } from 'react'
import { getBooks, saveBooks } from '@/lib/storage'
import type { BookRecommendation } from '@/lib/types'

export function useBooks() {
  const [books, setBooks] = useState<BookRecommendation[]>(() => getBooks())

  const persist = useCallback((next: BookRecommendation[]) => {
    saveBooks(next)
    setBooks(next)
  }, [])

  const addBook = useCallback(
    (book: Omit<BookRecommendation, 'id' | 'dateAdded'>) => {
      const newBook: BookRecommendation = {
        ...book,
        id: crypto.randomUUID(),
        dateAdded: new Date().toISOString(),
      }
      persist([newBook, ...books])
      return newBook
    },
    [books, persist]
  )

  const updateBook = useCallback(
    (id: string, updates: Partial<BookRecommendation>) => {
      persist(books.map((b) => (b.id === id ? { ...b, ...updates } : b)))
    },
    [books, persist]
  )

  const deleteBook = useCallback(
    (id: string) => {
      persist(books.filter((b) => b.id !== id))
    },
    [books, persist]
  )

  return { books, addBook, updateBook, deleteBook }
}
