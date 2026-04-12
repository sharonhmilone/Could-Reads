import type { AppState, BookRecommendation, TasteProfile } from './types'

const STORAGE_KEY = 'could-reads-v1'

const seedTasteProfile: TasteProfile = {
  totalBooksRead: 64,
  topGenres: [
    { genre: 'Fantasy',          count: 25, percentage: 39 },
    { genre: 'Fantasy Romance',  count: 10, percentage: 16 },
    { genre: 'Historical Fiction', count: 10, percentage: 16 },
    { genre: 'Science Fiction',  count: 10, percentage: 16 },
    { genre: 'Young Adult',      count: 3,  percentage: 5  },
    { genre: 'Literary Fiction', count: 2,  percentage: 3  },
    { genre: 'Horror',           count: 1,  percentage: 2  },
  ],
  topAuthors: [
    { author: 'Naomi Novik',        count: 10 },
    { author: 'Diana Gabaldon',     count: 10 },
    { author: 'Sarah J. Maas',      count: 8  },
    { author: 'Martha Wells',       count: 7  },
    { author: 'Octavia E. Butler',  count: 4  },
    { author: 'Fonda Lee',          count: 3  },
    { author: 'Nora Roberts',       count: 3  },
    { author: 'Becky Chambers',     count: 2  },
    { author: 'John Green',         count: 2  },
    { author: 'L. Penelope',        count: 2  },
    { author: 'Tricia O\'Malley',   count: 2  },
    { author: 'Neal Stephenson',    count: 2  },
  ],
  seriesRead: [
    { series: 'Outlander',            count: 10 },
    { series: 'Temeraire',            count: 9  },
    { series: 'Books of the Raksura', count: 6  },
    { series: 'ACOTAR Series',        count: 5  },
    { series: 'Patternist Series',    count: 4  },
    { series: 'The Green Bone Saga',  count: 3  },
    { series: 'Crescent City',        count: 3  },
    { series: 'Dragon Heart Legacy',  count: 3  },
    { series: 'Earthsinger Chronicles', count: 2 },
    { series: 'Monk & Robot',         count: 2  },
    { series: 'Isle of Destiny',      count: 2  },
  ],
  sampleBooks: [
    { title: 'Jade City',                       author: 'Fonda Lee',         genre: 'Fantasy',           series: 'The Green Bone Saga', dateRead: null, shelf: null },
    { title: 'Project Hail Mary',               author: 'Andy Weir',         genre: 'Science Fiction',   series: 'Standalone',          dateRead: null, shelf: null },
    { title: 'Outlander',                       author: 'Diana Gabaldon',    genre: 'Historical Fiction',series: 'Outlander',           dateRead: null, shelf: null },
    { title: 'A Court of Thorns and Roses',     author: 'Sarah J. Maas',     genre: 'Fantasy Romance',   series: 'ACOTAR Series',       dateRead: null, shelf: null },
    { title: 'The Perks of Being a Wallflower', author: 'Stephen Chbosky',   genre: 'Young Adult',       series: 'Standalone',          dateRead: null, shelf: null },
    { title: 'Gutter Child',                    author: 'Jael Richardson',   genre: 'Literary Fiction',  series: 'Standalone',          dateRead: null, shelf: null },
    { title: 'Wild Seed',                       author: 'Octavia E. Butler', genre: 'Science Fiction',   series: 'Patternist Series',   dateRead: null, shelf: null },
    { title: 'His Majesty\'s Dragon',           author: 'Naomi Novik',       genre: 'Fantasy',           series: 'Temeraire',           dateRead: null, shelf: null },
    { title: 'A Psalm for the Wild-Built',      author: 'Becky Chambers',    genre: 'Science Fiction',   series: 'Monk & Robot',        dateRead: null, shelf: null },
    { title: 'Lone Women',                      author: 'Victor LaValle',    genre: 'Horror',            series: 'Standalone',          dateRead: null, shelf: null },
    { title: 'The Cloud Roads',                 author: 'Martha Wells',      genre: 'Fantasy',           series: 'Books of the Raksura',dateRead: null, shelf: null },
    { title: 'Uprooted',                        author: 'Naomi Novik',       genre: 'Fantasy',           series: 'Standalone',          dateRead: null, shelf: null },
  ],
  importedAt: '2026-04-12T00:00:00.000Z',
  sourceName: 'reading history',
}

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
  tasteProfile: seedTasteProfile,
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
