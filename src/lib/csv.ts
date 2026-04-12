import Papa from 'papaparse'
import type { BookHistoryRow, CsvColumnMap, TasteProfile } from './types'

export interface ParsedCsv {
  headers: string[]
  rows: Record<string, string>[]
  rowCount: number
}

/** Parse raw CSV text into headers + row objects */
export function parseCsvText(text: string): ParsedCsv {
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
    title:    find(['title']),
    author:   find(['author']),
    genre:    find(['genre', 'category', 'bookshelves', 'shelf', 'tag']),
    series:   find(['series']),
    dateRead: find(['date read', 'date_read', 'read at', 'finished', 'completed']),
    shelf:    find(['exclusive shelf', 'exclusive_shelf', 'read status', 'status']),
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
    .map((row) => ({
      title:    (map.title  ? row[map.title]  ?? '' : '').trim(),
      author:   (map.author ? row[map.author] ?? '' : '').trim(),
      genre:    map.genre   ? (row[map.genre]   ?? '').trim() || null : null,
      series:   map.series  ? (row[map.series]  ?? '').trim() || null : null,
      dateRead: map.dateRead ? (row[map.dateRead] ?? '').trim() || null : null,
      shelf:    map.shelf    ? (row[map.shelf]    ?? '').trim() || null : null,
      rawRow:   row,
    }))
}

const SKIP_SHELVES = new Set(['to-read', 'to_read', 'currently-reading', 'currently_reading', ''])

/** Build a TasteProfile from mapped rows — presence = signal, no ratings needed */
export function buildTasteProfile(rows: BookHistoryRow[], sourceName: string): TasteProfile {
  // If there's a shelf column, only count books marked as read
  const hasShelf = rows.some((r) => r.shelf !== null)
  const readRows = hasShelf
    ? rows.filter((r) => {
        if (!r.shelf) return false
        const s = r.shelf.toLowerCase().replace(/\s+/g, '-')
        return !SKIP_SHELVES.has(s)
      })
    : rows  // no shelf column → treat all rows as read

  // Genre counts
  const genreCounts: Record<string, number> = {}
  for (const r of readRows) {
    if (!r.genre) continue
    const genres = r.genre.split(/[,;|]/).map((g) => g.trim()).filter(Boolean)
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

  // Author counts
  const authorCounts: Record<string, number> = {}
  for (const r of readRows) {
    if (!r.author) continue
    authorCounts[r.author] = (authorCounts[r.author] ?? 0) + 1
  }
  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([author, count]) => ({ author, count }))

  // Series counts — series with 2+ books = real commitment signal
  const seriesCounts: Record<string, number> = {}
  for (const r of readRows) {
    if (!r.series) continue
    const s = r.series.trim()
    if (s.toLowerCase() === 'standalone') continue
    seriesCounts[s] = (seriesCounts[s] ?? 0) + 1
  }
  const seriesRead = Object.entries(seriesCounts)
    .filter(([, count]) => count >= 2)   // only series they stuck with
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([series, count]) => ({ series, count }))

  // Sample books for AI context — pick a spread across genres
  const sampleBooks = readRows.slice(0, 30)

  return {
    totalBooksRead: readRows.length,
    topGenres,
    topAuthors,
    seriesRead,
    sampleBooks,
    importedAt: new Date().toISOString(),
    sourceName,
  }
}

/** Format taste profile as compact prose for the AI prompt — no ratings, just patterns */
export function formatTasteProfileForAI(profile: TasteProfile): string {
  const genres = profile.topGenres.slice(0, 6).map((g) => g.genre).join(', ')
  const authors = profile.topAuthors.slice(0, 6).map((a) => a.author).join(', ')
  const series = profile.seriesRead.slice(0, 5).map((s) => `${s.series} (${s.count} books)`).join(', ')
  const titles = profile.sampleBooks.slice(0, 8).map((b) => `"${b.title}"`).join(', ')

  const parts: string[] = [`has read ${profile.totalBooksRead} books`]
  if (genres) parts.push(`primarily reads ${genres}`)
  if (authors) parts.push(`returns to authors like ${authors}`)
  if (series) parts.push(`has committed to series including ${series}`)
  if (titles) parts.push(`their reading includes ${titles}`)

  return `The reader ${parts.join('; ')}.`
}
