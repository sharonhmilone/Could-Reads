import { useState, useCallback, useRef } from 'react'
import { generateWhyReadPitch } from '@/lib/claude'
import type { BookRecommendation, TasteProfile } from '@/lib/types'

export function useAIPitch(
  onPitchComplete: (bookId: string, pitch: string, tasteScore: number) => void
) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [streamingTexts, setStreamingTexts] = useState<Map<string, string>>(new Map())
  const accumulators = useRef<Map<string, string>>(new Map())
  const rafIds = useRef<Map<string, number>>(new Map())

  const generatePitch = useCallback(
    async (
      book: BookRecommendation,
      apiKey: string,
      tasteProfile: TasteProfile | null
    ) => {
      if (loadingIds.has(book.id)) return

      setLoadingIds((prev) => new Set([...prev, book.id]))
      accumulators.current.set(book.id, '')

      try {
        const result = await generateWhyReadPitch({
          apiKey,
          book,
          tasteProfile,
          onChunk: (chunk) => {
            const current = (accumulators.current.get(book.id) ?? '') + chunk
            accumulators.current.set(book.id, current)

            if (rafIds.current.has(book.id)) return
            const id = window.requestAnimationFrame(() => {
              rafIds.current.delete(book.id)
              setStreamingTexts((prev) => {
                const next = new Map(prev)
                next.set(book.id, accumulators.current.get(book.id) ?? '')
                return next
              })
            })
            rafIds.current.set(book.id, id)
          },
        })

        onPitchComplete(book.id, result.pitch, result.tasteScore)
      } catch (err) {
        console.error('AI pitch generation failed:', err)
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev)
          next.delete(book.id)
          return next
        })
        accumulators.current.delete(book.id)
      }
    },
    [loadingIds, onPitchComplete]
  )

  return { generatePitch, loadingIds, streamingTexts }
}
