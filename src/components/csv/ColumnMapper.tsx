import type { CsvColumnMap } from '@/lib/types'

interface ColumnMapperProps {
  headers: string[]
  columnMap: CsvColumnMap
  onChange: (map: CsvColumnMap) => void
  rowCount: number
}

const FIELDS: {
  key: keyof CsvColumnMap
  label: string
  required: boolean
  hint: string
}[] = [
  { key: 'title',    label: 'Book Title',    required: true,  hint: 'The name of the book' },
  { key: 'author',   label: 'Author',        required: false, hint: 'Who wrote it' },
  { key: 'genre',    label: 'Genre/Category',required: false, hint: 'The genre or category — key signal for matching' },
  { key: 'series',   label: 'Series',        required: false, hint: 'Series name — shows what you commit to' },
  { key: 'shelf',    label: 'Read Status',   required: false, hint: '"read", "to-read", etc. — used to filter to what you\'ve actually read' },
  { key: 'dateRead', label: 'Date Read',     required: false, hint: 'When you finished it (optional)' },
]

export function ColumnMapper({ headers, columnMap, onChange, rowCount }: ColumnMapperProps) {
  function update(key: keyof CsvColumnMap, value: string) {
    onChange({ ...columnMap, [key]: value === '' ? null : value })
  }

  return (
    <div className="paper-card p-5 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="font-type text-xl text-ink">Map your columns</h3>
        <span className="tag-chip text-ink-faded font-hand text-sm">
          {rowCount} books detected
        </span>
      </div>

      <p className="font-hand text-base text-ink-faded">
        No ratings needed — the fact that you read something is the signal.
        Genre and series are the most useful columns.
      </p>

      <div className="flex flex-wrap gap-1.5 pb-1">
        {headers.map((h) => (
          <span key={h} className="tag-chip text-sm text-ink-brown font-hand">{h}</span>
        ))}
      </div>

      <div className="space-y-3 pt-1">
        {FIELDS.map(({ key, label, required, hint }) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-32 shrink-0">
              <span className="font-hand text-base text-ink">
                {label}
                {required && (
                  <span className="ml-1 text-hi-pink" style={{ textShadow: '0 0 4px rgba(255,61,180,0.5)' }}>
                    *
                  </span>
                )}
              </span>
              <p className="font-hand text-xs text-ink-faded leading-tight">{hint}</p>
            </div>
            <select
              value={columnMap[key] ?? ''}
              onChange={(e) => update(key, e.target.value)}
              className="flex-1 paper-input bg-paper-light cursor-pointer"
            >
              <option value="">— not mapped —</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
