import { useState, useCallback, useMemo, useEffect } from 'react'
import { Plus, Share2, LogOut } from 'lucide-react'

import { AppShell } from '@/components/layout/AppShell'
import { BookGrid } from '@/components/books/BookGrid'
import { AddBookDialog } from '@/components/books/AddBookDialog'
import { FilterBar } from '@/components/filters/FilterBar'
import { CsvImport } from '@/components/csv/CsvImport'
import { TasteProfileView } from '@/components/profile/TasteProfileView'
import { SuggestView } from '@/components/suggest/SuggestView'
import { LoginDialog } from '@/components/auth/LoginDialog'

import { useBooks } from '@/hooks/useBooks'
import { useTasteProfile } from '@/hooks/useTasteProfile'
import { useAuth } from '@/hooks/useAuth'
import { useAIPitch } from '@/hooks/useAIPitch'

import { getOwnerName, saveOwnerName, getShareToken } from '@/lib/storage'
import type { BookRecommendation, SortDirection, SortField, ViewName } from '@/lib/types'

const OWNER_VIEWS: ViewName[] = ['settings', 'import', 'taste-profile']

export default function App() {
  const { books, addBook, updateBook, deleteBook } = useBooks()
  const { tasteProfile, setTasteProfile } = useTasteProfile()
  const { user, loading: authLoading, isOwner, signInWithEmail, signOut } = useAuth()

  const handlePitchComplete = useCallback(
    (bookId: string, pitch: string, tasteScore: number) => {
      // Preserve existing taste score on regeneration — only update it for new books
      const existing = books.find(b => b.id === bookId)
      updateBook(bookId, {
        aiPitch: pitch,
        tasteScore: existing?.tasteScore ?? tasteScore,
        aiPitchGeneratedAt: new Date().toISOString(),
      })
    },
    [updateBook, books]
  )

  const { generatePitch, loadingIds, streamingTexts } = useAIPitch(handlePitchComplete)

  // Auto-generate pitches for any books missing one when owner is logged in
  useEffect(() => {
    if (!isOwner || authLoading) return
    books
      .filter(b => !b.aiPitch)
      .forEach(b => generatePitch(b, tasteProfile))
  }, [isOwner, authLoading, books]) // eslint-disable-line react-hooks/exhaustive-deps

  // URL state — computed once at mount
  const [isSuggestView]  = useState(() => new URLSearchParams(window.location.search).has('suggest'))
  const [suggestFor]     = useState(() => new URLSearchParams(window.location.search).get('for') ?? '')
  const [suggestToken]   = useState(() => new URLSearchParams(window.location.search).get('t') ?? '')

  const [ownerName, setOwnerNameState]   = useState(() => getOwnerName())

  const [currentView, setCurrentView] = useState<ViewName>('library')
  const [addOpen, setAddOpen]         = useState(false)
  const [loginOpen, setLoginOpen]     = useState(false)
  const [pendingView, setPendingView] = useState<ViewName | null>(null)
  const [sortField, setSortField]     = useState<SortField>('dateAdded')
  const [sortDir, setSortDir]         = useState<SortDirection>('desc')
  const [linkCopied, setLinkCopied]   = useState(false)

  // Public suggest view — render without sidebar/shell
  if (isSuggestView) {
    return <SuggestView ownerName={suggestFor} token={suggestToken} onAdd={addBook} />
  }

  function handleNavigate(view: ViewName) {
    if (OWNER_VIEWS.includes(view) && !isOwner) {
      setPendingView(view)
      setLoginOpen(true)
      return
    }
    setCurrentView(view)
  }

  async function handleSendLink(email: string) {
    return await signInWithEmail(email)
    // Dialog shows "check your email" — auth completes when the magic link is clicked,
    // which redirects back and fires onAuthStateChange to set isOwner = true
  }

  function handleSortChange(field: SortField, dir: SortDirection) {
    setSortField(field); setSortDir(dir)
  }

  function handleGeneratePitch(book: BookRecommendation) {
    if (!isOwner) return
    generatePitch(book, tasteProfile)
  }

  function handleOwnerNameSave(name: string) {
    setOwnerNameState(name); saveOwnerName(name)
  }

  function handleCopyShareLink() {
    const base   = `${window.location.origin}/api/suggest-preview`
    const params = new URLSearchParams({ t: getShareToken() })
    if (ownerName) params.set('for', ownerName)
    navigator.clipboard.writeText(`${base}?${params}`).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  const sortedBooks = useMemo(() => [...books].sort((a, b) => {
    let cmp = 0
    if (sortField === 'tasteScore')       cmp = (a.tasteScore ?? 0) - (b.tasteScore ?? 0)
    else if (sortField === 'dateAdded')   cmp = a.dateAdded.localeCompare(b.dateAdded)
    else if (sortField === 'title')       cmp = a.title.localeCompare(b.title)
    else if (sortField === 'author')      cmp = a.author.localeCompare(b.author)
    else if (sortField === 'recommender') cmp = a.recommender.localeCompare(b.recommender)
    return sortDir === 'asc' ? cmp : -cmp
  }), [books, sortField, sortDir])

  return (
    <AppShell
      currentView={currentView}
      onNavigate={handleNavigate}
      hasTasteProfile={tasteProfile !== null}
      isOwner={isOwner}
      authLoading={authLoading}
      onSignOut={signOut}
    >
      {/* ── Library ──────────────────────────────── */}
      {currentView === 'library' && (
        <div>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div
                className="font-type text-7xl leading-none"
                style={{ color: '#ff3db4', textShadow: '0 0 16px rgba(255,61,180,0.3)' }}
              >
                {books.length}
              </div>
              <p className="font-hand text-lg text-ink-faded">
                book{books.length !== 1 ? 's' : ''} from friends
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyShareLink}
                title="Copy public suggest link"
                className="flex items-center gap-1.5 px-3 py-2.5 font-hand text-base text-ink border border-hi-cyan/40 rounded-sm bg-hi-cyan/10 hover:bg-hi-cyan/20 transition-all"
                style={{ boxShadow: '0 0 6px rgba(0,229,255,0.1)' }}
              >
                <Share2 size={15} />
                <span>{linkCopied ? 'Copied!' : 'Share'}</span>
              </button>
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 font-hand text-lg text-ink border-2 border-hi-pink/60 rounded-sm bg-hi-pink/10 hover:bg-hi-pink/20 transition-all"
                style={{ boxShadow: '0 0 10px rgba(255,61,180,0.2)' }}
              >
                <Plus size={18} />
                <span>Add book</span>
              </button>
            </div>
          </div>

          {books.length > 0 && (
            <FilterBar sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange} />
          )}

          <BookGrid
            books={sortedBooks}
            tasteProfile={tasteProfile}
            streamingTexts={streamingTexts}
            loadingIds={loadingIds}
            hasApiKey={isOwner}
            onGeneratePitch={handleGeneratePitch}
            onDelete={deleteBook}
          />
        </div>
      )}

      {/* ── Import ───────────────────────────────── */}
      {currentView === 'import' && (
        <CsvImport
          onProfileBuilt={(profile) => { setTasteProfile(profile); setCurrentView('taste-profile') }}
          existingProfile={tasteProfile}
        />
      )}

      {/* ── Taste profile ────────────────────────── */}
      {currentView === 'taste-profile' && tasteProfile && (
        <TasteProfileView profile={tasteProfile} />
      )}

      {/* ── Settings ─────────────────────────────── */}
      {currentView === 'settings' && (
        <div className="space-y-6">
          <h1 className="font-type text-4xl text-ink">
            <span className="hl-yellow">Settings</span>
          </h1>

          {/* Owner name */}
          <div className="paper-card p-5 space-y-3">
            <h3 className="font-type text-xl text-ink">Your name</h3>
            <p className="font-hand text-base text-ink-faded">
              Shown on the public suggest link so friends know whose list they're adding to.
            </p>
            <input
              value={ownerName}
              onChange={(e) => handleOwnerNameSave(e.target.value)}
              placeholder="Your name…"
              className="paper-input w-full"
            />
          </div>

          {/* Share link */}
          <div className="paper-card p-5 space-y-3">
            <h3 className="font-type text-xl text-ink">Share link</h3>
            <p className="font-hand text-base text-ink-faded">
              Anyone with this link can suggest a book. No account needed.
            </p>
            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-2 px-4 py-2.5 font-hand text-lg text-ink border-2 border-hi-cyan/50 rounded-sm bg-hi-cyan/10 hover:bg-hi-cyan/20 transition-all"
              style={{ boxShadow: '0 0 6px rgba(0,229,255,0.15)' }}
            >
              <Share2 size={16} />
              {linkCopied ? 'Link copied!' : 'Copy suggest link'}
            </button>
          </div>

          {tasteProfile && (
            <div className="paper-card p-5 space-y-3">
              <h3 className="font-type text-xl text-ink">Taste profile</h3>
              <p className="font-hand text-base text-ink-faded">
                Built from <strong>{tasteProfile.totalBooksRead}</strong> read books in{' '}
                <strong>{tasteProfile.sourceName}</strong>.
              </p>
              <button
                onClick={() => {
                  if (confirm('Delete taste profile? This removes AI scoring context.')) {
                    setTasteProfile(null)
                  }
                }}
                className="px-4 py-2 font-hand text-base text-accent-red border border-accent-red/30 rounded-sm hover:bg-accent-red/5 transition-colors"
              >
                Delete taste profile
              </button>
            </div>
          )}

          {/* Sign out */}
          {user && (
            <div className="paper-card p-5 space-y-3">
              <h3 className="font-type text-xl text-ink">Account</h3>
              <p className="font-hand text-base text-ink-faded">
                Signed in as <strong>{user.email}</strong>
              </p>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 font-hand text-base text-ink-faded border border-ink/20 rounded-sm hover:bg-paper-dark transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      )}

      <AddBookDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={addBook} />

      {loginOpen && (
        <LoginDialog
          onDismiss={() => { setLoginOpen(false); setPendingView(null) }}
          onSendLink={handleSendLink}
        />
      )}
    </AppShell>
  )
}
