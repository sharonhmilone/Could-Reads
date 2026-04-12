import type { BookRecommendation, SortDirection, SortField } from '@/lib/types'

interface FilterBarProps {
  books: BookRecommendation[]
  sortField: SortField
  sortDir: SortDirection
  onSortChange: (field: SortField, dir: SortDirection) => void
}

const SORT_OPTIONS: { field: SortField; dir: SortDirection; label: string }[] = [
  { field: 'tasteScore', dir: 'desc', label: 'Best match first' },
  { field: 'dateAdded',  dir: 'desc', label: 'Newest first' },
  { field: 'dateAdded',  dir: 'asc',  label: 'Oldest first' },
  { field: 'title',      dir: 'asc',  label: 'A–Z title' },
  { field: 'author',     dir: 'asc',  label: 'A–Z author' },
  { field: 'recommender',dir: 'asc',  label: 'By friend' },
]

export function FilterBar({ sortField, sortDir, onSortChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="font-hand text-base text-ink-faded">sort:</span>
      <select
        value={`${sortField}:${sortDir}`}
        onChange={(e) => {
          const [field, dir] = e.target.value.split(':') as [SortField, SortDirection]
          onSortChange(field, dir)
        }}
        className="paper-input text-base cursor-pointer"
      >
        {SORT_OPTIONS.map(({ field, dir, label }) => (
          <option key={`${field}:${dir}`} value={`${field}:${dir}`}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
