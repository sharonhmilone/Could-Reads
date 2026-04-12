import type { CsvColumnMap } from '@/lib/types'

interface ColumnMapperProps {
  headers: string[]
  columnMap: CsvColumnMap
  onChange: (map: CsvColumnMap) => void
  rowCount: number
}

const FIELDS: { key: keyof CsvColumnMap; label: string; required: boolean; hint: string }[] = [
  { key: 'title',    label: 'Book Title',  required: true,  hint: 'The name of the book' },
  { key: 'author',   label: 'Author',      required: false, hint: 'Who wrote it' },
  { key: 'rating',   label: 'My Rating',   required: false, hint: 'Your star rating (0-5)' },
  { key: 'genre',    label: 'Genre/Shelf', required: false, hint: 'Categories or shelves' },
  { key: 'dateRead', label: 'Date Read',   required: false, hint: 'When you finished it' },
  { key: 'shelf',    label: 'Read Status', required: false, hint: '"read", "to-read", etc.' },
]

export function ColumnMapper({ headers, columnMap, onChange, rowCount }: ColumnMapperProps) {
  function update(key: keyof CsvColumnMap, value: string) {
    onChange({ ...columnMap, [key]: value === '' ? null : value })
  }

  return (
    <div className="paper-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="font-type text-xl text-ink">Map columns</h3>
        <span className="tag-chip text-ink-faded font-hand text-sm">
          {rowCount} rows detected
        </span>
      </div>
      <p className="font-hand text-base text-ink-faded">
        Tell me which column in your CSV is which. I detected these headers:
      </p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {headers.map((h) => (
          <span key={h} className="tag-chip text-sm text-ink-brown font-hand">
            {h}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        {FIELDS.map(({ key, label, required, hint }) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-28 shrink-0">
              <span className="font-hand text-base text-ink">
                {label}
                {required && (
                  <span
                    className="ml-1 text-hi-pink"
                    style={{ textShadow: '0 0 4px rgba(255,61,180,0.5)' }}
                  >
                    *
                  </span>
                )}
              </span>
              <p className="font-hand text-xs text-ink-faded">{hint}</p>
            </div>
            <select
              value={columnMap[key] ?? ''}
              onChange={(e) => update(key, e.target.value)}
              className="flex-1 paper-input bg-paper-light cursor-pointer"
            >
              <option value="">— not mapped —</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
