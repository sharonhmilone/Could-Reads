// --- Enums ---

export type BookStatus = 'want-to-read' | 'reading' | 'done' | 'skipped'

export type RecommendationSource =
  | 'linkedin'
  | 'twitter'
  | 'in-person'
  | 'podcast'
  | 'newsletter'
  | 'other'

// --- Core Book Recommendation ---

export interface BookRecommendation {
  id: string
  title: string
  author: string
  recommender: string
  source: RecommendationSource
  sourceNote?: string
  friendNote?: string
  dateAdded: string // ISO 8601
  status: BookStatus
  // AI generation
  aiPitch?: string
  aiPitchGeneratedAt?: string
}

// --- Generic CSV Import ---

export interface CsvColumnMap {
  title: string | null
  author: string | null
  rating: string | null
  genre: string | null
  dateRead: string | null
  shelf: string | null
}

export interface BookHistoryRow {
  title: string
  author: string
  rating: number | null   // 0-5 or null
  genre: string | null
  dateRead: string | null
  shelf: string | null
  rawRow: Record<string, string>
}

// --- Taste Profile ---

export interface TasteProfile {
  totalBooksImported: number
  totalBooksRead: number
  averageRating: number
  topGenres: Array<{ genre: string; count: number; percentage: number }>
  topAuthors: Array<{ author: string; count: number; avgRating: number }>
  ratingDistribution: Record<string, number>
  highlyRatedBooks: BookHistoryRow[]
  importedAt: string
  sourceName: string // "Goodreads", "StoryGraph", or "custom"
}

// --- App State ---

export interface AppState {
  books: BookRecommendation[]
  tasteProfile: TasteProfile | null
  apiKey: string
}

// --- UI State ---

export type ViewName = 'library' | 'import' | 'taste-profile' | 'settings'

export interface FilterState {
  status: BookStatus | 'all'
  source: RecommendationSource | 'all'
  recommender: string | 'all'
}

export type SortField = 'dateAdded' | 'title' | 'author' | 'recommender'
export type SortDirection = 'asc' | 'desc'
