import { BookOpen } from 'lucide-react'
import type { BookRecommendation, BookStatus, TasteProfile } from '@/lib/types'
import { BookCard } from './BookCard'

interface BookGridProps {
  books: BookRecommendation[]
  tasteProfile: TasteProfile | null
  streamingTexts: Map<string, string>
  loadingIds: Set<string>
  hasApiKey: boolean
  onGeneratePitch: (book: BookRecommendation) => void
  onStatusChange: (id: string, status: BookStatus) => void
  onDelete: (id: string) => void
}

export function BookGrid({
  books,
  tasteProfile,
  streamingTexts,
  loadingIds,
  hasApiKey,
  onGeneratePitch,
  onStatusChange,
  onDelete,
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative">
          <BookOpen size={56} className="text-ink-faded/40" strokeWidth={1} />
          <div
            className="absolute -top-1 -right-2 text-2xl"
            style={{ transform: 'rotate(15deg)' }}
          >
            📌
          </div>
        </div>
        <p className="font-type text-xl text-ink-faded text-center">
          no recommendations yet
        </p>
        <p className="font-hand text-base text-ink-faded/60 text-center max-w-xs">
          hit the button below to add a book a friend recommended
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
          onStatusChange={(status) => onStatusChange(book.id, status)}
          onDelete={() => onDelete(book.id)}
        />
      ))}
    </div>
  )
}
