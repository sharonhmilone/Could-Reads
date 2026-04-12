import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import type { ViewName } from '@/lib/types'

interface AppShellProps {
  currentView: ViewName
  onNavigate: (view: ViewName) => void
  hasApiKey: boolean
  hasTasteProfile: boolean
  children: React.ReactNode
}

export function AppShell({
  currentView,
  onNavigate,
  hasApiKey,
  hasTasteProfile,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentView={currentView}
          onNavigate={onNavigate}
          hasApiKey={hasApiKey}
          hasTasteProfile={hasTasteProfile}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-ink/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 bg-paper ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          currentView={currentView}
          onNavigate={(v) => { onNavigate(v); setSidebarOpen(false) }}
          hasApiKey={hasApiKey}
          hasTasteProfile={hasTasteProfile}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-ink/10 bg-paper-dark/30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded hover:bg-paper-dark transition-colors"
          >
            <Menu size={20} className="text-ink-brown" />
          </button>
        </div>

        <div className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
