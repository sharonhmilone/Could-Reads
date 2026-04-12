import Papa from 'papaparse'
import type { BookHistoryRow, CsvColumnMap, TasteProfile } from './types'

export interface ParsedCsv {
  headers: string[]
  rows: Record<string, string>[]
  rowCount: number
}

/** Parse raw CSV text into headers + row objects */
export function parseCsvText(text: string): ParsedCsv {
  // Strip BOM if present
  const cleaned = text.replace(/^\uFEFF/, '')

  const result = Papa.parse<Record<string, string>>(cleaned, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  })

  return {
    headers: result.meta.fields ?? [],
    rows: result.data,
    rowCount: result.data.length,
  }
}

/** Auto-detect likely column mappings based on header names */
export function autoDetectColumns(headers: string[]): CsvColumnMap {
  const lower = headers.map((h) => h.toLowerCase())

  function find(patterns: string[]): string | null {
    for (const pat of patterns) {
      const idx = lower.findIndex((h) => h.includes(pat))
      if (idx !== -1) return headers[idx]
    }
    return null
  }

  return {
    title: find(['title']),
    author: find(['author']),
    rating: find(['my rating', 'my_rating', 'rating', 'stars']),
    genre: find(['genre', 'shelf', 'bookshelves', 'category', 'tag']),
    dateRead: find(['date read', 'date_read', 'read at', 'finished', 'completed']),
    shelf: find(['exclusive shelf', 'exclusive_shelf', 'shelf', 'status', 'read status']),
  }
}

/** Apply column map to raw rows to produce BookHistoryRow[] */
export function applyColumnMap(
  rows: Record<string, string>[],
  map: CsvColumnMap
): BookHistoryRow[] {
  return rows
    .filter((row) => {
      if (!map.title) return false
      return (row[map.title] ?? '').trim().length > 0
    })
    .map((row) => {
      const ratingRaw = map.rating ? (row[map.rating] ?? '').trim() : ''
      const ratingNum = ratingRaw ? parseFloat(ratingRaw) : null
      return {
        title: (map.title ? row[map.title] ?? '' : '').trim(),
        author: (map.author ? row[map.author] ?? '' : '').trim(),
        rating: ratingNum !== null && !isNaN(ratingNum) ? ratingNum : null,
        genre: map.genre ? (row[map.genre] ?? '').trim() || null : null,
        dateRead: map.dateRead ? (row[map.dateRead] ?? '').trim() || null : null,
        shelf: map.shelf ? (row[map.shelf] ?? '').trim() || null : null,
        rawRow: row,
      }
    })
}

const INTERNAL_SHELVES = new Set(['read', 'to-read', 'to_read', 'currently-reading', 'currently_reading', ''])

/** Build a TasteProfile from mapped rows */
export function buildTasteProfile(
  rows: BookHistoryRow[],
  sourceName: string
): TasteProfile {
  const readRows = rows.filter((r) => {
    if (r.shelf) {
      const s = r.shelf.toLowerCase().replace(/ /g, '-')
      return s === 'read'
    }
    // If no shelf column, treat all rows as read
    return true
  })

  const totalBooksImported = rows.length
  const totalBooksRead = readRows.length

  // Rating distribution
  const ratingDistribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  let ratingSum = 0
  let ratingCount = 0
  for (const r of readRows) {
    if (r.rating !== null && r.rating > 0) {
      const key = String(Math.round(r.rating))
      if (key in ratingDistribution) {
        ratingDistribution[key] = (ratingDistribution[key] ?? 0) + 1
      }
      ratingSum += r.rating
      ratingCount++
    }
  }
  const averageRating = ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0

  // Genre/shelf counting
  const genreCounts: Record<string, number> = {}
  for (const r of readRows) {
    if (!r.genre) continue
    // Genres can be comma-separated
    const genres = r.genre.split(/[,;|]/).map((g) => g.trim().toLowerCase()).filter((g) => g && !INTERNAL_SHELVES.has(g))
    for (const g of genres) {
      genreCounts[g] = (genreCounts[g] ?? 0) + 1
    }
  }
  const totalGenreCount = Object.values(genreCounts).reduce((a, b) => a + b, 0) || 1
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: Math.round((count / totalGenreCount) * 100),
    }))

  // Author stats
  const authorMap: Record<string, { count: number; ratingSum: number; ratingCount: number }> = {}
  for (const r of readRows) {
    if (!r.author) continue
    const a = r.author.trim()
    if (!authorMap[a]) authorMap[a] = { count: 0, ratingSum: 0, ratingCount: 0 }
    authorMap[a]!.count++
    if (r.rating !== null && r.rating > 0) {
      authorMap[a]!.ratingSum += r.rating
      authorMap[a]!.ratingCount++
    }
  }
  const topAuthors = Object.entries(authorMap)
    .map(([author, stats]) => ({
      author,
      count: stats.count,
      avgRating: stats.ratingCount > 0 ? Math.round((stats.ratingSum / stats.ratingCount) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating)
    .slice(0, 15)

  // Highly rated books for AI context
  const highlyRatedBooks = readRows
    .filter((r) => r.rating !== null && r.rating >= 4)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 25)

  return {
    totalBooksImported,
    totalBooksRead,
    averageRating,
    topGenres,
    topAuthors,
    ratingDistribution,
    highlyRatedBooks,
    importedAt: new Date().toISOString(),
    sourceName,
  }
}

/** Summarize taste profile into a compact prose string for the AI prompt */
export function formatTasteProfileForAI(profile: TasteProfile): string {
  const genres = profile.topGenres.slice(0, 5).map((g) => g.genre).join(', ')
  const authors = profile.topAuthors.slice(0, 5).map((a) => a.author).join(', ')
  const topBooks = profile.highlyRatedBooks
    .slice(0, 8)
    .map((b) => `"${b.title}" by ${b.author}`)
    .join(', ')

  const parts: string[] = []
  if (profile.totalBooksRead > 0) parts.push(`has read ${profile.totalBooksRead} books`)
  if (profile.averageRating > 0) parts.push(`rates books ${profile.averageRating}/5 on average`)
  if (genres) parts.push(`enjoys ${genres}`)
  if (authors) parts.push(`has read several books by ${authors}`)
  if (topBooks) parts.push(`highly rated books include ${topBooks}`)

  return `The reader ${parts.join(', ')}.`
}
