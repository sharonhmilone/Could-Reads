import { useState } from 'react'
import { Eye, EyeOff, X, KeyRound } from 'lucide-react'

interface ApiKeyDialogProps {
  open: boolean
  onClose: () => void
  currentKey: string
  onSave: (key: string) => void
}

export function ApiKeyDialog({ open, onClose, currentKey, onSave }: ApiKeyDialogProps) {
  const [value, setValue] = useState(currentKey)
  const [visible, setVisible] = useState(false)

  if (!open) return null

  function handleSave() {
    onSave(value.trim())
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/30 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="paper-card w-full max-w-md p-6 animate-slide-up relative"
          style={{ transform: 'rotate(0.5deg)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="tape" style={{ top: -9, left: 32 }} />

          <div className="flex items-start justify-between mb-5 mt-2">
            <div className="flex items-center gap-2">
              <KeyRound size={20} className="text-hi-pink" style={{ filter: 'drop-shadow(0 0 4px rgba(255,61,180,0.5))' }} />
              <h2 className="font-type text-xl text-ink">
                <span className="hl-pink">Anthropic API key</span>
              </h2>
            </div>
            <button onClick={onClose} className="p-1 text-ink-faded hover:text-ink">
              <X size={18} />
            </button>
          </div>

          <p className="font-hand text-base text-ink-faded mb-4">
            Needed to generate "why read this" pitches. Your key is stored only in your browser and never sent anywhere except Anthropic's API.
          </p>

          <div className="flex items-center gap-2 mb-5">
            <input
              type={visible ? 'text' : 'password'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="paper-input flex-1 font-mono text-base"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="p-2 text-ink-faded hover:text-ink transition-colors"
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <p className="font-hand text-sm text-ink-faded/70 mb-5">
            Get a key at console.anthropic.com → API Keys. The app uses claude-haiku-4-5 which is very inexpensive.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 font-hand text-lg text-ink-faded border border-ink/15 rounded-sm hover:bg-paper-dark transition-colors"
            >
              cancel
            </button>
            {currentKey && (
              <button
                onClick={() => { onSave(''); onClose() }}
                className="px-4 py-2.5 font-hand text-base text-accent-red border border-accent-red/30 rounded-sm hover:bg-accent-red/5 transition-colors"
              >
                clear
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!value.trim()}
              className="flex-1 py-2.5 font-hand text-lg text-ink border-2 border-hi-pink/60 rounded-sm bg-hi-pink/10 hover:bg-hi-pink/20 transition-all disabled:opacity-40"
              style={{ boxShadow: value.trim() ? '0 0 8px rgba(255,61,180,0.2)' : 'none' }}
            >
              Save key
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
