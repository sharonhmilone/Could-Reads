import { useState } from 'react'
import { MoreHorizontal, Trash2, RefreshCw } from 'lucide-react'
import type { BookRecommendation, BookStatus } from '@/lib/types'
import { bookPalette, cardRotation, formatDate, sourceInfo } from '@/lib/utils'
import { BookStatusBadge } from './BookStatusBadge'
import { AIPitchBlock } from './AIPitchBlock'

interface BookCardProps {
  book: BookRecommendation
  streamingText?: string
  isGenerating: boolean
  hasApiKey: boolean
  hasTasteProfile: boolean
  onGeneratePitch: () => void
  onStatusChange: (status: BookStatus) => void
  onDelete: () => void
}

const statusOptions: { value: BookStatus; label: string }[] = [
  { value: 'want-to-read', label: 'Want to Read' },
  { value: 'reading',      label: 'Reading' },
  { value: 'done',         label: 'Done' },
  { value: 'skipped',      label: 'Skipped' },
]

export function BookCard({
  book,
  streamingText,
  isGenerating,
  hasApiKey,
  hasTasteProfile,
  onGeneratePitch,
  onStatusChange,
  onDelete,
}: BookCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const palette = bookPalette(book.id)
  const rotation = cardRotation(book.id)
  const src = sourceInfo(book.source)

  return (
    <div
      className={`paper-card relative p-4 pt-5 animate-slide-up ${rotation} hover:rotate-0 transition-transform duration-200`}
      style={{ borderLeft: `4px solid ${palette.labelColor}` }}
    >
      {/* Top row: title + menu */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h2
          className="font-type text-2xl leading-tight text-ink"
          style={{ wordBreak: 'break-word' }}
        >
          <span className={palette.hlClass}>{book.title}</span>
        </h2>

        {/* Menu button */}
        <div className="relative shrink-0 mt-0.5">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1 rounded hover:bg-paper-dark transition-colors text-ink-faded hover:text-ink"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-7 z-20 paper-card py-1 min-w-36 shadow-paper-lg animate-fade-in">
                <div className="px-3 py-1 text-xs font-hand text-ink-faded uppercase tracking-wider">
                  Status
                </div>
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { onStatusChange(opt.value); setMenuOpen(false) }}
                    className={`w-full text-left px-3 py-1.5 font-hand text-base hover:bg-paper-dark transition-colors ${
                      book.status === opt.value ? 'text-ink font-bold' : 'text-ink-brown'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <div className="border-t border-ink/10 mt-1 pt-1">
                  <button
                    onClick={() => { onGeneratePitch(); setMenuOpen(false) }}
                    disabled={!hasApiKey}
                    className="w-full text-left px-3 py-1.5 font-hand text-base text-ink-blue hover:bg-paper-dark transition-colors flex items-center gap-2 disabled:opacity-40"
                  >
                    <RefreshCw size={12} />
                    Regenerate pitch
                  </button>
                  <button
                    onClick={() => { onDelete(); setMenuOpen(false) }}
                    className="w-full text-left px-3 py-1.5 font-hand text-base text-accent-red hover:bg-paper-dark transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Author */}
      <p className="font-hand text-lg text-ink-faded mb-2">by {book.author}</p>

      {/* Status + recommender row */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <BookStatusBadge status={book.status} />
        <span className="font-hand text-sm text-ink-faded">
          {src.emoji} {book.recommender} via {src.label}
        </span>
      </div>

      {/* Friend's note */}
      {book.friendNote && (
        <blockquote className="border-l-2 border-ink/20 pl-3 mb-3 italic font-hand text-base text-ink-brown">
          "{book.friendNote}"
        </blockquote>
      )}

      {/* AI pitch */}
      <AIPitchBlock
        pitch={book.aiPitch}
        streamingText={streamingText}
        isGenerating={isGenerating}
        hasApiKey={hasApiKey}
        onGenerate={onGeneratePitch}
      />

      {/* Date added */}
      <p className="mt-3 text-xs font-hand text-ink-faded/60 text-right rotate-0.5">
        added {formatDate(book.dateAdded)}
      </p>
    </div>
  )
}
