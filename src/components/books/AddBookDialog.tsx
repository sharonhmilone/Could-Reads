import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import type { BookRecommendation, RecommendationSource } from '@/lib/types'

interface AddBookDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (book: Omit<BookRecommendation, 'id' | 'dateAdded' | 'status'>) => void
}

const sources: { value: RecommendationSource; label: string; emoji: string }[] = [
  { value: 'linkedin',    label: 'LinkedIn',    emoji: '💼' },
  { value: 'twitter',     label: 'Twitter/X',   emoji: '🐦' },
  { value: 'in-person',   label: 'In person',   emoji: '🗣️' },
  { value: 'podcast',     label: 'Podcast',     emoji: '🎙️' },
  { value: 'newsletter',  label: 'Newsletter',  emoji: '📬' },
  { value: 'other',       label: 'Other',       emoji: '📌' },
]

export function AddBookDialog({ open, onClose, onAdd }: AddBookDialogProps) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [recommender, setRecommender] = useState('')
  const [source, setSource] = useState<RecommendationSource>('linkedin')
  const [friendNote, setFriendNote] = useState('')

  useEffect(() => {
    if (open) {
      setTitle('')
      setAuthor('')
      setRecommender('')
      setSource('linkedin')
      setFriendNote('')
    }
  }, [open])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !author.trim() || !recommender.trim()) return
    onAdd({
      title: title.trim(),
      author: author.trim(),
      recommender: recommender.trim(),
      source,
      friendNote: friendNote.trim() || undefined,
    })
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink/30 animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="paper-card w-full max-w-lg p-6 animate-slide-up relative"
          style={{ transform: 'rotate(-0.5deg)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tape decoration */}
          <div
            className="tape"
            style={{ top: -9, left: '50%', transform: 'translateX(-50%) rotate(-1deg)' }}
          />

          <div className="flex items-start justify-between mb-6 mt-2">
            <h2 className="font-type text-2xl text-ink">
              Pin a <span className="hl-yellow">new book</span>
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-ink-faded hover:text-ink transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-hand text-sm text-ink-faded mb-1 uppercase tracking-wide">
                Book title *
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The book title..."
                className="paper-input w-full"
                required
              />
            </div>

            <div>
              <label className="block font-hand text-sm text-ink-faded mb-1 uppercase tracking-wide">
                Author *
              </label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Who wrote it..."
                className="paper-input w-full"
                required
              />
            </div>

            <div>
              <label className="block font-hand text-sm text-ink-faded mb-1 uppercase tracking-wide">
                Recommended by *
              </label>
              <input
                value={recommender}
                onChange={(e) => setRecommender(e.target.value)}
                placeholder="Which friend..."
                className="paper-input w-full"
                required
              />
            </div>

            <div>
              <label className="block font-hand text-sm text-ink-faded mb-2 uppercase tracking-wide">
                Source
              </label>
              <div className="flex flex-wrap gap-2">
                {sources.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSource(s.value)}
                    className={`tag-chip font-hand text-base transition-all ${
                      source === s.value
                        ? 'bg-hi-pink/20 border-hi-pink/50 shadow-glow-pink text-ink'
                        : 'text-ink-brown hover:bg-paper-dark'
                    }`}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-hand text-sm text-ink-faded mb-1 uppercase tracking-wide">
                Their note / reason <span className="normal-case">(optional)</span>
              </label>
              <textarea
                value={friendNote}
                onChange={(e) => setFriendNote(e.target.value)}
                placeholder="What did they say about it..."
                rows={3}
                className="paper-input w-full resize-none lined"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 font-hand text-lg text-ink-faded border border-ink/15 rounded-sm hover:bg-paper-dark transition-colors"
              >
                cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 font-hand text-lg text-ink border-2 border-hi-pink/60 rounded-sm bg-hi-pink/10 hover:bg-hi-pink/20 transition-all flex items-center justify-center gap-2"
                style={{ boxShadow: '0 0 8px rgba(255,61,180,0.2)' }}
              >
                <Plus size={16} />
                Pin it!
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
