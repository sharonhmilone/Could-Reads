import type { AppState, BookRecommendation, TasteProfile } from './types'

const STORAGE_KEY = 'could-reads-v1'

const defaultState: AppState = {
  books: [],
  tasteProfile: null,
  apiKey: '',
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultState }
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      books: parsed.books ?? [],
      tasteProfile: parsed.tasteProfile ?? null,
      apiKey: parsed.apiKey ?? '',
    }
  } catch {
    return { ...defaultState }
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage quota exceeded — silently fail
  }
}

export function getBooks(): BookRecommendation[] {
  return loadState().books
}

export function saveBooks(books: BookRecommendation[]): void {
  const state = loadState()
  saveState({ ...state, books })
}

export function getTasteProfile(): TasteProfile | null {
  return loadState().tasteProfile
}

export function saveTasteProfile(profile: TasteProfile | null): void {
  const state = loadState()
  saveState({ ...state, tasteProfile: profile })
}

export function getApiKey(): string {
  // Prefer localStorage, fall back to env var for local dev convenience
  const state = loadState()
  if (state.apiKey) return state.apiKey
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (typeof import.meta !== 'undefined' && (import.meta as any).env
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? ((import.meta as any).env.VITE_ANTHROPIC_API_KEY ?? '')
    : '')
}

export function saveApiKey(key: string): void {
  const state = loadState()
  saveState({ ...state, apiKey: key })
}
