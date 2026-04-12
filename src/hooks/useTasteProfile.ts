import { useState, useCallback } from 'react'
import { getTasteProfile, saveTasteProfile } from '@/lib/storage'
import type { TasteProfile } from '@/lib/types'

export function useTasteProfile() {
  const [tasteProfile, setTasteProfileState] = useState<TasteProfile | null>(
    () => getTasteProfile()
  )

  const setTasteProfile = useCallback((profile: TasteProfile | null) => {
    saveTasteProfile(profile)
    setTasteProfileState(profile)
  }, [])

  return { tasteProfile, setTasteProfile }
}
