import Papa from 'papaparse'
import type { BookHistoryRow, CsvColumnMap, TasteProfile } from './types'

export interface ParsedCsv {
  headers: string[]
  rows: Record<string, string>[]
  rowCount: number
}

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

export function applyColumnMap(
  rows: Record<string, string>[],
  map: CsvColumnMap
): BookHistoryRow[] {
  return rows
    .filter((row) => map.title && (row[map.title] ?? '').trim().length > 0)
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

/** Counts occurrences of values extracted from rows, returns sorted top-N entries */
function topN<T extends string>(
  rows: BookHistoryRow[],
  extract: (r: BookHistoryRow) => T | null | undefined,
  limit: number
): Array<{ value: T; count: number }> {
  const counts = new Map<T, number>()
  for (const r of rows) {
    const val = extract(r)
    if (!val) continue
    counts.set(val, (counts.get(val) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }))
}

/** Pick up to `limit` books spread across genres for a representative AI context sample */
function selectSampleBooks(rows: BookHistoryRow[], limit: number): BookHistoryRow[] {
  if (rows.length <= limit) return rows
  const sample: BookHistoryRow[] = []
  const seenGenres = new Set<string>()
  // First pass: one book per genre for variety
  for (const r of rows) {
    if (sample.length >= limit) break
    const genre = r.genre ?? '__none__'
    if (!seenGenres.has(genre)) { seenGenres.add(genre); sample.push(r) }
  }
  // Second pass: fill remaining slots in original order, skipping already picked
  const picked = new Set(sample)
  for (const r of rows) {
    if (sample.length >= limit) break
    if (!picked.has(r)) sample.push(r)
  }
  return sample
}

export function buildTasteProfile(rows: BookHistoryRow[], sourceName: string): TasteProfile {
  const hasShelf = rows.some((r) => r.shelf !== null)
  const readRows = hasShelf
    ? rows.filter((r) => {
        if (!r.shelf) return false
        return !SKIP_SHELVES.has(r.shelf.toLowerCase().replace(/\s+/g, '-'))
      })
    : rows

  // Genre counts — a single genre cell can be comma-separated
  const genreCounts = new Map<string, number>()
  for (const r of readRows) {
    if (!r.genre) continue
    for (const g of r.genre.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)) {
      genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1)
    }
  }
  const totalGenreCount = [...genreCounts.values()].reduce((a, b) => a + b, 0) || 1
  const topGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([genre, count]) => ({ genre, count, percentage: Math.round((count / totalGenreCount) * 100) }))

  const topAuthors = topN(readRows, (r) => r.author || null, 15).map(({ value, count }) => ({
    author: value,
    count,
  }))

  const seriesEntries = topN(
    readRows,
    (r) => (r.series && r.series.toLowerCase() !== 'standalone' ? r.series : null),
    20
  )
  const seriesRead = seriesEntries
    .filter(({ count }) => count >= 2)
    .slice(0, 12)
    .map(({ value, count }) => ({ series: value, count }))

  // Strip rawRow before storing — it's only needed during import
  const sampleBooks = selectSampleBooks(readRows, 30).map(
    ({ rawRow: _raw, ...rest }) => rest
  )

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

export function formatTasteProfileForAI(profile: TasteProfile): string {
  const genres  = profile.topGenres.slice(0, 6).map((g) => g.genre).join(', ')
  const authors = profile.topAuthors.slice(0, 6).map((a) => a.author).join(', ')
  const series  = profile.seriesRead.slice(0, 5).map((s) => `${s.series} (${s.count} books)`).join(', ')
  const titles  = profile.sampleBooks.slice(0, 8).map((b) => `"${b.title}"`).join(', ')

  const parts: string[] = [`has read ${profile.totalBooksRead} books`]
  if (genres)  parts.push(`primarily reads ${genres}`)
  if (authors) parts.push(`returns to authors like ${authors}`)
  if (series)  parts.push(`has committed to series including ${series}`)
  if (titles)  parts.push(`their reading includes ${titles}`)

  return `The reader ${parts.join('; ')}.`
}
