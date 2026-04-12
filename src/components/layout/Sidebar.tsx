import { BookOpen, Upload, User, Settings } from 'lucide-react'
import type { ViewName } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SidebarProps {
  currentView: ViewName
  onNavigate: (view: ViewName) => void
  hasApiKey: boolean
  hasTasteProfile: boolean
}

const navItems: { view: ViewName; label: string; Icon: typeof BookOpen; always?: boolean }[] = [
  { view: 'library',       label: 'My Stack',    Icon: BookOpen,  always: true },
  { view: 'import',        label: 'Import Taste', Icon: Upload,    always: true },
  { view: 'taste-profile', label: 'My Taste',     Icon: User },
  { view: 'settings',      label: 'Settings',     Icon: Settings,  always: true },
]

export function Sidebar({ currentView, onNavigate, hasApiKey, hasTasteProfile }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 flex flex-col min-h-screen border-r border-ink/10 bg-paper-dark/30 py-6 relative overflow-hidden">
      {/* Coffee ring decoration */}
      <div
        className="coffee-ring pointer-events-none"
        style={{ bottom: 40, right: -30, width: 100, height: 100, opacity: 0.4 }}
      />
      <div
        className="coffee-ring pointer-events-none"
        style={{ top: 80, left: -25, width: 70, height: 70, opacity: 0.3 }}
      />

      {/* Logo */}
      <div className="px-5 mb-8">
        <div className="flex items-baseline gap-1">
          <span className="font-type text-2xl text-ink leading-none">Could</span>
          <span
            className="font-type text-2xl leading-none hl-pink"
            style={{ textShadow: '0 0 8px rgba(255,61,180,0.4)' }}
          >
            Reads
          </span>
        </div>
        <p className="font-hand text-sm text-ink-faded mt-0.5 rotate-1 inline-block">
          books friends sent me
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-2">
        {navItems.map(({ view, label, Icon, always }) => {
          if (!always && view === 'taste-profile' && !hasTasteProfile) return null
          const isActive = currentView === view
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={cn('nav-item text-left', isActive && 'active')}
            >
              <Icon size={18} className="shrink-0 opacity-70" />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* API key status */}
      <div className="mt-auto px-5">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: hasApiKey ? '#39ff14' : '#ff3db4',
              boxShadow: hasApiKey
                ? '0 0 6px rgba(57,255,20,0.7)'
                : '0 0 6px rgba(255,61,180,0.7)',
            }}
          />
          <span className="font-hand text-sm text-ink-faded">
            {hasApiKey ? 'AI ready' : 'no API key'}
          </span>
        </div>
      </div>
    </aside>
  )
}
