import { BookOpen, Upload, User, Settings, LogOut } from 'lucide-react'
import type { ViewName } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SidebarProps {
  currentView: ViewName
  onNavigate: (view: ViewName) => void
  hasTasteProfile: boolean
  isOwner: boolean
  authLoading: boolean
  onSignOut: () => void
}

const ownerNavItems: { view: ViewName; label: string; Icon: typeof BookOpen }[] = [
  { view: 'import',        label: 'Import Taste', Icon: Upload  },
  { view: 'taste-profile', label: 'My Taste',     Icon: User    },
  { view: 'settings',      label: 'Settings',     Icon: Settings },
]

export function Sidebar({ currentView, onNavigate, hasTasteProfile, isOwner, authLoading, onSignOut }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 flex flex-col min-h-screen border-r border-ink/10 bg-paper-dark/30 py-6 relative overflow-hidden">
      <div className="coffee-ring pointer-events-none" style={{ bottom: 40, right: -30, width: 100, height: 100, opacity: 0.4 }} />
      <div className="coffee-ring pointer-events-none" style={{ top: 80, left: -25, width: 70, height: 70, opacity: 0.3 }} />

      {/* Logo */}
      <div className="px-5 mb-8">
        <div className="flex items-baseline gap-1">
          <span className="font-type text-2xl text-ink leading-none">Could</span>
          <span className="font-type text-2xl leading-none hl-pink" style={{ textShadow: '0 0 8px rgba(255,61,180,0.4)' }}>
            Reads
          </span>
        </div>
        <p className="font-hand text-sm text-ink-faded mt-0.5 rotate-1 inline-block">
          books friends sent me
        </p>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {/* My Stack — always visible */}
        <button
          onClick={() => onNavigate('library')}
          className={cn('nav-item text-left', currentView === 'library' && 'active')}
        >
          <BookOpen size={18} className="shrink-0 opacity-70" />
          <span>{isOwner ? 'My Stack' : 'Book Stack'}</span>
        </button>

        {/* Owner-only nav */}
        {isOwner && ownerNavItems.map(({ view, label, Icon }) => {
          if (view === 'taste-profile' && !hasTasteProfile) return null
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={cn('nav-item text-left', currentView === view && 'active')}
            >
              <Icon size={18} className="shrink-0 opacity-70" />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto px-5 flex flex-col gap-2">
        {isOwner && (
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 font-hand text-sm text-ink-faded/50 hover:text-ink-faded transition-colors text-left"
          >
            <LogOut size={13} />
            sign out
          </button>
        )}
        {!isOwner && !authLoading && (
          <button
            onClick={() => onNavigate('settings')}
            className="font-hand text-sm text-ink-faded/50 hover:text-ink-faded transition-colors text-left underline underline-offset-2 decoration-dotted"
          >
            owner access
          </button>
        )}
      </div>
    </aside>
  )
}
