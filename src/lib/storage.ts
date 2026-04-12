import type { AppState, BookRecommendation, TasteProfile } from './types'

const STORAGE_KEY = 'could-reads-v1'

const defaultState: AppState = {
  ownerPin: '',
  books: [
    {
      id: 'seed-katabasis-rfkuang',
      title: 'Katabasis',
      author: 'R.F. Kuang',
      recommender: 'Kt',
      dateAdded: '2026-04-12T00:00:00.000Z',
    },
  ],
  tasteProfile: null,
  apiKey: '',
  ownerName: '',
  shareToken: '',
}

// Module-level cache — avoids repeated JSON.parse for reads in the same session
let _cache: AppState | null = null

export function loadState(): AppState {
  if (_cache) return _cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) { _cache = { ...defaultState }; return _cache }
    const parsed = JSON.parse(raw) as Partial<AppState>
    _cache = {
      books: parsed.books ?? [],
      tasteProfile: parsed.tasteProfile ?? null,
      apiKey: parsed.apiKey ?? '',
      ownerName: parsed.ownerName ?? '',
      shareToken: parsed.shareToken ?? '',
      ownerPin: parsed.ownerPin ?? '',
    }
    return _cache
  } catch {
    _cache = { ...defaultState }
    return _cache
  }
}

export function saveState(state: AppState): void {
  _cache = state
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage quota exceeded — silently fail
  }
}

function updateState<K extends keyof AppState>(key: K, value: AppState[K]): void {
  saveState({ ...loadState(), [key]: value })
}

export const getBooks = (): BookRecommendation[]       => loadState().books
export const saveBooks = (books: BookRecommendation[]) => updateState('books', books)

export const getTasteProfile = (): TasteProfile | null => loadState().tasteProfile
export const saveTasteProfile = (p: TasteProfile | null) => updateState('tasteProfile', p)

export const getOwnerName = (): string       => loadState().ownerName ?? ''
export const saveOwnerName = (name: string)  => updateState('ownerName', name)

export function getApiKey(): string {
  const key = loadState().apiKey
  if (key) return key
  return (import.meta as { env?: Record<string, string> }).env?.VITE_ANTHROPIC_API_KEY ?? ''
}
export const saveApiKey = (key: string) => updateState('apiKey', key)

export const getOwnerPin  = (): string      => loadState().ownerPin ?? ''
export const saveOwnerPin = (pin: string)   => updateState('ownerPin', pin)

// Share token — generated once and stored; included in the suggest URL to gate access
export function getShareToken(): string {
  const existing = loadState().shareToken
  if (existing) return existing
  const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  updateState('shareToken', token)
  return token
}
