import { useState, useCallback } from 'react'
import { getApiKey, saveApiKey } from '@/lib/storage'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>(() => getApiKey())

  const setApiKey = useCallback((key: string) => {
    saveApiKey(key)
    setApiKeyState(key)
  }, [])

  return {
    apiKey,
    setApiKey,
    hasApiKey: apiKey.trim().length > 0,
  }
}
