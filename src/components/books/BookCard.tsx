import { useState } from 'react'
import { MoreHorizontal, Trash2, RefreshCw } from 'lucide-react'
import type { BookRecommendation } from '@/lib/types'
import { bookPalette, cardRotation, formatDate } from '@/lib/utils'
import { TasteScoreBadge } from './BookStatusBadge'
import { AIPitchBlock } from './AIPitchBlock'

interface BookCardProps {
  book: BookRecommendation
  streamingText?: string
  isGenerating: boolean
  hasApiKey: boolean
  hasTasteProfile: boolean
  onGeneratePitch: () => void
  onDelete: () => void
}

export function BookCard({
  book,
  streamingText,
  isGenerating,
  hasApiKey,
  hasTasteProfile,
  onGeneratePitch,
  onDelete,
}: BookCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const palette = bookPalette(book.id)
  const rotation = cardRotation(book.id)

  return (
    <div
      className={`paper-card relative p-4 pt-5 animate-slide-up ${rotation} hover:rotate-0 transition-transform duration-200`}
      style={{ borderLeft: `4px solid ${palette.labelColor}` }}
    >
      {/* Title + menu */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h2 className="font-type text-2xl leading-tight text-ink" style={{ wordBreak: 'break-word' }}>
          <span className={palette.hlClass}>{book.title}</span>
        </h2>

        {hasApiKey && (
          <div className="relative shrink-0 mt-0.5">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1 rounded hover:bg-paper-dark transition-colors text-ink-faded hover:text-ink"
            >
              <MoreHorizontal size={16} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-7 z-20 paper-card py-1 min-w-32 shadow-paper-lg animate-fade-in">
                  <button
                    onClick={() => { onGeneratePitch(); setMenuOpen(false) }}
                    className="w-full text-left px-3 py-1.5 font-hand text-base text-ink-blue hover:bg-paper-dark transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={12} />
                    Regenerate pitch
                  </button>
                  <button
                    onClick={() => { onDelete(); setMenuOpen(false) }}
                    className="w-full text-left px-3 py-1.5 font-hand text-base text-accent-red hover:bg-paper-dark transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Author */}
      <p className="font-hand text-lg text-ink-faded mb-2">by {book.author}</p>

      {/* Recommender + score inline */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <p className="font-hand text-sm text-ink-faded">
          from <strong className="text-ink-brown">{book.recommender.split(' ')[0]}</strong>
        </p>
        {book.tasteScore !== undefined && !isGenerating && (
          <TasteScoreBadge score={book.tasteScore} />
        )}
      </div>

      {/* Friend note — owner only */}
      {hasApiKey && book.friendNote && (
        <p className="font-hand text-sm text-ink-faded/70 italic mb-3 leading-snug">
          "{book.friendNote}"
        </p>
      )}

      {/* AI pitch — main content */}
      <AIPitchBlock
        pitch={book.aiPitch}
        streamingText={streamingText}
        isGenerating={isGenerating}
        hasApiKey={hasApiKey}
        hasTasteProfile={hasTasteProfile}
        onGenerate={onGeneratePitch}
      />

      {/* Friend note intentionally not shown — stored for AI context only */}

      {/* Date added */}
      <p className="mt-3 text-xs font-hand text-ink-faded/60 text-right">
        added {formatDate(book.dateAdded)}
      </p>
    </div>
  )
}
