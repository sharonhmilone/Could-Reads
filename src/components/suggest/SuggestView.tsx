import { useState, useEffect } from 'react'
import { Plus, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import type { BookRecommendation } from '@/lib/types'
import { getTasteProfile } from '@/lib/storage'
import { sbFetchBooks } from '@/lib/supabase'

interface SuggestViewProps {
  ownerName: string
  token: string
  onAdd: (book: Omit<BookRecommendation, 'id' | 'dateAdded'>) => Promise<BookRecommendation>
}

export function SuggestView({ ownerName, token, onAdd }: SuggestViewProps) {
  if (!token) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="paper-card p-8 text-center max-w-sm space-y-3" style={{ transform: 'rotate(-0.5deg)' }}>
          <div className="tape" style={{ top: -9, left: '50%', transform: 'translateX(-50%) rotate(1deg)' }} />
          <h2 className="font-type text-2xl text-ink">
            Could <span className="hl-pink">Reads</span>
          </h2>
          <p className="font-hand text-lg text-ink-faded">
            You need a personal invite link to suggest books here.
          </p>
          <p className="font-hand text-sm text-ink-faded/60">
            Ask the list owner to share their link with you.
          </p>
        </div>
      </div>
    )
  }

  const [title, setTitle]       = useState('')
  const [author, setAuthor]     = useState('')
  const [yourName, setYourName] = useState('')
  const [note, setNote]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [addedTitle, setAddedTitle] = useState('')
  const [pitch, setPitch]           = useState('')
  const [generatingPitch, setGeneratingPitch] = useState(false)
  const [stackBooks, setStackBooks] = useState<BookRecommendation[]>([])

  useEffect(() => {
    sbFetchBooks().then(setStackBooks).catch(() => {})
  }, [])

  async function generatePitch(book: BookRecommendation) {
    setGeneratingPitch(true)
    try {
      const res = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ShareToken ${token}`,
        },
        body: JSON.stringify({
          book,
          tasteProfile: getTasteProfile(),
          ownerName: ownerName || undefined,
        }),
      })
      if (!res.ok || !res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let scoreLineStarted = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        if (!scoreLineStarted) {
          const tail = accumulated.slice(-20)
          if (/\nSCORE:?\s*\d*$/.test(tail)) {
            scoreLineStarted = true
          } else {
            setPitch(accumulated)
          }
        }
      }
      setPitch(accumulated.replace(/\nSCORE:\s*\d+\s*$/, '').trim())
    } catch {
      // Pitch generation is best-effort — silently skip on error
    } finally {
      setGeneratingPitch(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !author.trim() || !yourName.trim()) return
    setSubmitting(true)
    try {
      const book = await onAdd({
        title: title.trim(),
        author: author.trim(),
        recommender: yourName.trim(),
        friendNote: note.trim() || undefined,
      })
      setAddedTitle(title.trim())
      setSubmitted(true)
      generatePitch(book)
    } finally {
      setSubmitting(false)
    }
  }

  function handleSuggestAnother() {
    setTitle('')
    setAuthor('')
    setYourName('')
    setNote('')
    setSubmitted(false)
    setAddedTitle('')
    setPitch('')
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-type text-4xl text-ink">
            Could <span className="hl-pink">Reads</span>
          </h1>
          {ownerName && (
            <p className="font-hand text-xl text-ink-brown mt-1 rotate-1 inline-block">
              {ownerName}'s reading stack
            </p>
          )}
          <p className="font-hand text-lg text-ink-faded mt-2">
            suggest a book I could read
          </p>
        </div>

        {submitted ? (
          <>
          <div
            className="paper-card p-8 text-center space-y-4 animate-slide-up"
            style={{ transform: 'rotate(-0.5deg)' }}
          >
            <div className="tape" style={{ top: -9, left: '50%', transform: 'translateX(-50%) rotate(1deg)' }} />
            <CheckCircle2
              size={44}
              className="mx-auto"
              style={{ color: '#39ff14', filter: 'drop-shadow(0 0 10px rgba(57,255,20,0.55))' }}
            />
            <h2 className="font-type text-2xl text-ink">Pinned!</h2>
            <p className="font-hand text-lg text-ink-faded">
              <span className="hl-yellow">{addedTitle}</span> has been added to the stack.
            </p>

            {/* AI pitch */}
            <div className="text-left mt-2">
              {generatingPitch && !pitch && (
                <div className="flex items-center gap-2 text-ink-faded font-hand text-sm">
                  <Loader2 size={13} className="animate-spin text-hi-pink" />
                  <span>Seeing if {ownerName || 'they'}'d love it…</span>
                </div>
              )}
              {(pitch || (generatingPitch && pitch)) && (
                <div className="flex items-start gap-2 mt-1">
                  {generatingPitch
                    ? <Loader2 size={13} className="mt-1 shrink-0 text-hi-pink animate-spin" />
                    : <Sparkles size={13} className="mt-1 shrink-0 text-hi-pink opacity-60" />
                  }
                  <p className="font-hand text-base text-ink-brown leading-snug text-left">
                    {pitch}
                    {generatingPitch && (
                      <span className="inline-block w-0.5 h-4 bg-hi-pink ml-0.5 animate-blink align-text-bottom" />
                    )}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleSuggestAnother}
              className="font-hand text-base text-ink-faded underline underline-offset-2 hover:text-ink transition-colors"
            >
              suggest another →
            </button>
          </div>

          {/* Rest of the stack */}
          {stackBooks.length > 0 && (
            <div className="mt-8 space-y-2">
              <p className="font-hand text-sm text-ink-faded uppercase tracking-wide px-1">
                the full stack
              </p>
              {stackBooks.map((b) => (
                <div
                  key={b.id}
                  className="paper-card px-4 py-3 space-y-1"
                  style={{ borderLeft: '3px solid #c4b49a' }}
                >
                  <p className="font-type text-lg leading-tight text-ink">{b.title}</p>
                  <p className="font-hand text-sm text-ink-faded">by {b.author}</p>
                  {b.aiPitch && (
                    <p className="font-hand text-sm text-ink-brown leading-snug pt-0.5">
                      {b.aiPitch}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          </>
        ) : (
          <div
            className="paper-card p-6 animate-fade-in"
            style={{ transform: 'rotate(-0.5deg)' }}
          >
            <div className="tape" style={{ top: -9, left: '50%', transform: 'translateX(-50%) rotate(-1deg)' }} />

            <h2 className="font-type text-2xl text-ink mt-2 mb-6">
              Pin a <span className="hl-yellow">book</span>
            </h2>

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
                  Your name *
                </label>
                <input
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  placeholder="Who's suggesting..."
                  className="paper-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block font-hand text-sm text-ink-faded mb-1 uppercase tracking-wide">
                  Why would {ownerName || 'they'} love it <span className="normal-case">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What made you think of them..."
                  rows={3}
                  className="paper-input w-full resize-none lined"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 font-hand text-xl text-ink border-2 border-hi-pink/60 rounded-sm bg-hi-pink/10 hover:bg-hi-pink/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 0 10px rgba(255,61,180,0.2)' }}
              >
                <Plus size={18} />
                {submitting ? 'Pinning…' : 'Pin it!'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
