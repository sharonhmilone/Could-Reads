import type { BookStatus, FilterState, RecommendationSource, SortDirection, SortField } from '@/lib/types'
import type { BookRecommendation } from '@/lib/types'

interface FilterBarProps {
  books: BookRecommendation[]
  filter: FilterState
  sortField: SortField
  sortDir: SortDirection
  onFilterChange: (f: Partial<FilterState>) => void
  onSortChange: (field: SortField, dir: SortDirection) => void
}

const STATUS_OPTIONS: { value: BookStatus | 'all'; label: string }[] = [
  { value: 'all',          label: 'All' },
  { value: 'want-to-read', label: 'Want to Read' },
  { value: 'reading',      label: 'Reading' },
  { value: 'done',         label: 'Done' },
  { value: 'skipped',      label: 'Skipped' },
]

const SOURCE_OPTIONS: { value: RecommendationSource | 'all'; label: string }[] = [
  { value: 'all',        label: 'All sources' },
  { value: 'linkedin',   label: '💼 LinkedIn' },
  { value: 'twitter',    label: '🐦 Twitter' },
  { value: 'in-person',  label: '🗣️ In person' },
  { value: 'podcast',    label: '🎙️ Podcast' },
  { value: 'newsletter', label: '📬 Newsletter' },
  { value: 'other',      label: '📌 Other' },
]

const SORT_OPTIONS: { field: SortField; dir: SortDirection; label: string }[] = [
  { field: 'dateAdded', dir: 'desc', label: 'Newest first' },
  { field: 'dateAdded', dir: 'asc',  label: 'Oldest first' },
  { field: 'title',     dir: 'asc',  label: 'A–Z title' },
  { field: 'author',    dir: 'asc',  label: 'A–Z author' },
]

export function FilterBar({ books, filter, sortField, sortDir, onFilterChange, onSortChange }: FilterBarProps) {
  // Unique recommenders from books
  const recommenders = [...new Set(books.map((b) => b.recommender))].sort()

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Status pills */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map(({ value, label }) => {
          const active = filter.status === value
          return (
            <button
              key={value}
              onClick={() => onFilterChange({ status: value })}
              className={`tag-chip font-hand text-base transition-all ${
                active
                  ? 'bg-hi-pink/20 border-hi-pink/50 text-ink shadow-glow-pink'
                  : 'text-ink-faded hover:bg-paper-dark hover:text-ink'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="w-px h-5 bg-ink/15 hidden sm:block" />

      {/* Source filter */}
      <select
        value={filter.source}
        onChange={(e) => onFilterChange({ source: e.target.value as FilterState['source'] })}
        className="paper-input text-base cursor-pointer"
      >
        {SOURCE_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Recommender filter */}
      {recommenders.length > 1 && (
        <select
          value={filter.recommender}
          onChange={(e) => onFilterChange({ recommender: e.target.value })}
          className="paper-input text-base cursor-pointer"
        >
          <option value="all">All friends</option>
          {recommenders.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      )}

      <div className="w-px h-5 bg-ink/15 hidden sm:block" />

      {/* Sort */}
      <select
        value={`${sortField}:${sortDir}`}
        onChange={(e) => {
          const [field, dir] = e.target.value.split(':') as [SortField, SortDirection]
          onSortChange(field, dir)
        }}
        className="paper-input text-base cursor-pointer"
      >
        {SORT_OPTIONS.map(({ field, dir, label }) => (
          <option key={`${field}:${dir}`} value={`${field}:${dir}`}>{label}</option>
        ))}
      </select>
    </div>
  )
}
