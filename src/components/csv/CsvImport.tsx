import { useState, useRef } from 'react'
import { Upload, ClipboardPaste, CheckCircle2, AlertCircle } from 'lucide-react'
import type { CsvColumnMap, TasteProfile } from '@/lib/types'
import {
  parseCsvText,
  autoDetectColumns,
  applyColumnMap,
  buildTasteProfile,
} from '@/lib/csv'
import { ColumnMapper } from './ColumnMapper'

interface CsvImportProps {
  onProfileBuilt: (profile: TasteProfile) => void
  existingProfile: TasteProfile | null
}

type Step = 'upload' | 'map' | 'done'

export function CsvImport({ onProfileBuilt, existingProfile }: CsvImportProps) {
  const [step, setStep] = useState<Step>('upload')
  const [mode, setMode] = useState<'file' | 'paste'>('file')
  const [pasteText, setPasteText] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [columnMap, setColumnMap] = useState<CsvColumnMap>({
    title: null, author: null, rating: null, genre: null, dateRead: null, shelf: null,
  })
  const [sourceName, setSourceName] = useState('My reading history')
  const [error, setError] = useState<string | null>(null)
  const [builtProfile, setBuiltProfile] = useState<TasteProfile | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  function processText(text: string) {
    setError(null)
    try {
      const parsed = parseCsvText(text)
      if (parsed.headers.length === 0 || parsed.rowCount === 0) {
        setError('Could not parse this CSV — make sure the first row is headers.')
        return
      }
      setHeaders(parsed.headers)
      setRawRows(parsed.rows)
      setColumnMap(autoDetectColumns(parsed.headers))
      setStep('map')
    } catch (err) {
      setError(`Parse error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a .csv file')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => processText(e.target?.result as string)
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleBuild() {
    if (!columnMap.title) {
      setError('You must map the Title column before continuing.')
      return
    }
    setError(null)
    const rows = applyColumnMap(rawRows, columnMap)
    const profile = buildTasteProfile(rows, sourceName)
    setBuiltProfile(profile)
    onProfileBuilt(profile)
    setStep('done')
  }

  if (step === 'done' && builtProfile) {
    return (
      <div className="paper-card p-6 animate-slide-up space-y-4" style={{ transform: 'rotate(0.5deg)' }}>
        <div className="flex items-center gap-3">
          <CheckCircle2
            size={28}
            style={{ color: '#39ff14', filter: 'drop-shadow(0 0 6px rgba(57,255,20,0.5))' }}
          />
          <h3 className="font-type text-2xl text-ink">
            <span className="hl-green">Taste profile built!</span>
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'books imported', value: builtProfile.totalBooksImported },
            { label: 'books read',     value: builtProfile.totalBooksRead },
            { label: 'avg rating',     value: builtProfile.averageRating > 0 ? `${builtProfile.averageRating}★` : '—' },
            { label: 'top genre',      value: builtProfile.topGenres[0]?.genre ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="paper-card p-3 text-center" style={{ transform: 'rotate(-1deg)' }}>
              <div
                className="font-type text-2xl text-ink"
                style={{ color: '#ff3db4', textShadow: '0 0 8px rgba(255,61,180,0.4)' }}
              >
                {value}
              </div>
              <div className="font-hand text-sm text-ink-faded">{label}</div>
            </div>
          ))}
        </div>
        <p className="font-hand text-base text-ink-faded">
          Head to <strong>My Taste</strong> to see the full breakdown, or start generating pitches in your library.
        </p>
        <button
          onClick={() => setStep('upload')}
          className="font-hand text-base text-ink-faded underline decoration-dotted underline-offset-2"
        >
          re-import a different file
        </button>
      </div>
    )
  }

  if (step === 'map') {
    return (
      <div className="space-y-5 animate-slide-up">
        <div className="paper-card p-4">
          <label className="block font-hand text-sm text-ink-faded mb-1 uppercase tracking-wide">
            What is this CSV from?
          </label>
          <input
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            className="paper-input w-full max-w-xs"
            placeholder="Goodreads, StoryGraph, my spreadsheet..."
          />
        </div>

        <ColumnMapper
          headers={headers}
          columnMap={columnMap}
          onChange={setColumnMap}
          rowCount={rawRows.length}
        />

        {error && (
          <div className="flex items-center gap-2 text-accent-red font-hand text-base">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStep('upload')}
            className="px-4 py-2.5 font-hand text-lg text-ink-faded border border-ink/15 rounded-sm hover:bg-paper-dark transition-colors"
          >
            back
          </button>
          <button
            onClick={handleBuild}
            className="px-6 py-2.5 font-hand text-lg text-ink border-2 rounded-sm bg-hi-green/10 transition-all"
            style={{
              borderColor: '#39ff14',
              boxShadow: '0 0 8px rgba(57,255,20,0.2)',
            }}
          >
            Build my taste profile →
          </button>
        </div>
      </div>
    )
  }

  // Step: upload
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-type text-3xl text-ink mb-1">
          Import your <span className="hl-cyan">reading history</span>
        </h2>
        <p className="font-hand text-lg text-ink-faded">
          Upload a CSV from Goodreads, StoryGraph, LibraryThing, or your own spreadsheet.
          I'll build a taste profile so the AI can make personal pitches.
        </p>
      </div>

      {existingProfile && (
        <div className="paper-card p-3 flex items-center gap-3">
          <span
            className="font-hand text-sm"
            style={{ color: '#39ff14', textShadow: '0 0 4px rgba(57,255,20,0.4)' }}
          >
            ✓ existing profile from {existingProfile.sourceName}
          </span>
          <span className="font-hand text-sm text-ink-faded">
            ({existingProfile.totalBooksRead} books read)
          </span>
          <span className="font-hand text-xs text-ink-faded/60 ml-auto">
            importing a new file will replace it
          </span>
        </div>
      )}

      {/* Mode tabs */}
      <div className="flex gap-1 border-b border-ink/10">
        {(['file', 'paste'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 font-hand text-lg transition-colors ${
              mode === m
                ? 'text-ink border-b-2 border-hi-pink -mb-px'
                : 'text-ink-faded hover:text-ink'
            }`}
          >
            {m === 'file' ? (
              <span className="flex items-center gap-2">
                <Upload size={15} /> Upload file
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ClipboardPaste size={15} /> Paste CSV
              </span>
            )}
          </button>
        ))}
      </div>

      {mode === 'file' ? (
        <div
          ref={dropRef}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`paper-card p-12 text-center cursor-pointer transition-all ${
            dragging ? 'bg-hi-cyan/10 border-hi-cyan/40' : 'hover:bg-paper-dark'
          }`}
          style={dragging ? { boxShadow: '0 0 16px rgba(0,229,255,0.2)' } : {}}
        >
          <Upload size={36} className="mx-auto mb-3 text-ink-faded/50" strokeWidth={1.5} />
          <p className="font-hand text-xl text-ink-faded">
            drop your .csv here, or click to browse
          </p>
          <p className="font-hand text-sm text-ink-faded/50 mt-1">
            Goodreads export · StoryGraph · LibraryThing · any spreadsheet
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your CSV content here..."
            rows={10}
            className="w-full paper-card p-4 font-mono text-sm text-ink-brown resize-y focus:outline-none lined"
          />
          <button
            onClick={() => processText(pasteText)}
            disabled={!pasteText.trim()}
            className="px-5 py-2.5 font-hand text-lg border-2 border-hi-cyan/60 rounded-sm bg-hi-cyan/10 text-ink transition-all disabled:opacity-40"
            style={{ boxShadow: '0 0 6px rgba(0,229,255,0.15)' }}
          >
            Parse it →
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-accent-red font-hand text-base">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="paper-card p-4 space-y-2">
        <p className="font-type text-base text-ink">How to export from Goodreads:</p>
        <ol className="font-hand text-base text-ink-faded list-decimal list-inside space-y-0.5">
          <li>Go to goodreads.com → My Books → Import and Export</li>
          <li>Click "Export Library" — you'll get a .csv in your downloads</li>
          <li>Drop it here</li>
        </ol>
        <p className="font-hand text-sm text-ink-faded/70">
          StoryGraph: Settings → Export your data. LibraryThing: Tools → Export data.
        </p>
      </div>
    </div>
  )
}
