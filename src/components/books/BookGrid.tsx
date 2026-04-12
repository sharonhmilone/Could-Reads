import { BookOpen } from 'lucide-react'
import type { BookRecommendation, TasteProfile } from '@/lib/types'
import { BookCard } from './BookCard'

interface BookGridProps {
  books: BookRecommendation[]
  tasteProfile: TasteProfile | null
  streamingTexts: Map<string, string>
  loadingIds: Set<string>
  hasApiKey: boolean
  onGeneratePitch: (book: BookRecommendation) => void
  onDelete: (id: string) => void
}

export function BookGrid({
  books,
  tasteProfile,
  streamingTexts,
  loadingIds,
  hasApiKey,
  onGeneratePitch,
  onDelete,
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <div>
          <h2 className="font-type text-5xl text-ink leading-tight">
            Could{' '}
            <span className="hl-pink" style={{ textShadow: '0 0 14px rgba(255,61,180,0.3)' }}>
              Reads
            </span>
          </h2>
          <p className="font-hand text-base text-ink-faded mt-1 rotate-1 inline-block">
            books friends send me
          </p>
        </div>

        <div className="relative my-2">
          <BookOpen size={52} className="text-ink-faded/30" strokeWidth={1} />
          <div className="absolute -top-1 -right-2 text-xl" style={{ transform: 'rotate(15deg)' }}>
            📌
          </div>
        </div>

        <p className="font-hand text-lg text-ink-faded leading-relaxed max-w-xs">
          recommend a book I could read —<br />
          and see a <span className="hl-yellow">summary of whether I'd love it</span> or hate it
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          streamingText={streamingTexts.get(book.id)}
          isGenerating={loadingIds.has(book.id)}
          hasApiKey={hasApiKey}
          hasTasteProfile={tasteProfile !== null}
          onGeneratePitch={() => onGeneratePitch(book)}
          onDelete={() => onDelete(book.id)}
        />
      ))}
    </div>
  )
}
