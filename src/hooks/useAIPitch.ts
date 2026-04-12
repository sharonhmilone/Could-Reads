import { useState, useCallback, useRef, useEffect } from 'react'
import { generateWhyReadPitch } from '@/lib/claude'
import type { BookRecommendation, TasteProfile } from '@/lib/types'

export function useAIPitch(
  onPitchComplete: (bookId: string, pitch: string, tasteScore: number) => void
) {
  // Use ref for the loading set so generatePitch doesn't get a new reference every time
  // loadingIds state is a mirror for UI re-renders only
  const loadingRef = useRef<Set<string>>(new Set())
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [streamingTexts, setStreamingTexts] = useState<Map<string, string>>(new Map())

  const accumulators = useRef<Map<string, string>>(new Map())
  const rafIds = useRef<Map<string, number>>(new Map())

  // Cancel all pending RAF callbacks on unmount
  useEffect(() => {
    return () => {
      rafIds.current.forEach((id) => cancelAnimationFrame(id))
      rafIds.current.clear()
    }
  }, [])

  const generatePitch = useCallback(
    async (
      book: BookRecommendation,
      tasteProfile: TasteProfile | null
    ) => {
      if (loadingRef.current.has(book.id)) return

      loadingRef.current.add(book.id)
      setLoadingIds(new Set(loadingRef.current))
      accumulators.current.set(book.id, '')

      try {
        const result = await generateWhyReadPitch({
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
        loadingRef.current.delete(book.id)
        setLoadingIds(new Set(loadingRef.current))
        accumulators.current.delete(book.id)
        // Clean up streaming text entry now that generation is done
        setStreamingTexts((prev) => {
          const next = new Map(prev)
          next.delete(book.id)
          return next
        })
      }
    },
    [onPitchComplete]
  )

  return { generatePitch, loadingIds, streamingTexts }
}
