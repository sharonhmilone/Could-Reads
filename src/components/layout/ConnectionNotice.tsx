import { RefreshCw, Unplug } from 'lucide-react'

interface ConnectionNoticeProps {
  message: string
  onRetry: () => void
}

// Shown when the book list can't be loaded from Supabase. Without it the app
// falls back to the empty-shelf state, which looks like "no recommendations yet"
// instead of "the database isn't answering".
export function ConnectionNotice({ message, onRetry }: ConnectionNoticeProps) {
  return (
    <div
      className="paper-card relative p-6 my-6 flex flex-col items-center gap-4 text-center"
      style={{ transform: 'rotate(-0.4deg)' }}
    >
      <div className="tape" style={{ top: -9, left: '50%', transform: 'translateX(-50%) rotate(1.5deg)' }} />

      <Unplug size={34} className="text-hi-orange" strokeWidth={1.5} />

      <div className="space-y-1.5">
        <p className="font-type text-base text-ink tracking-wide">Shelf unavailable</p>
        <p className="font-hand text-lg text-ink-faded leading-relaxed max-w-sm">
          <span className="hl-orange">{message}</span>
        </p>
        <p className="font-hand text-sm text-ink-faded/70 max-w-sm">
          Nothing has been lost — the books are still there once the connection is back.
        </p>
      </div>

      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-3 py-2 font-hand text-base text-ink border border-hi-cyan/40 rounded-sm bg-hi-cyan/10 hover:bg-hi-cyan/20 transition-all"
        style={{ boxShadow: '0 0 6px rgba(0,229,255,0.1)' }}
      >
        <RefreshCw size={15} />
        <span>Try again</span>
      </button>
    </div>
  )
}
