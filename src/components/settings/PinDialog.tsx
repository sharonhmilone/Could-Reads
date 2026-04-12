import { useState } from 'react'
import { Lock } from 'lucide-react'

interface PinDialogProps {
  onUnlock: () => void
  onDismiss: () => void
  storedPin: string
}

export function PinDialog({ onUnlock, onDismiss, storedPin }: PinDialogProps) {
  const [value, setValue]   = useState('')
  const [wrong, setWrong]   = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (value === storedPin) {
      onUnlock()
    } else {
      setWrong(true)
      setValue('')
      setTimeout(() => setWrong(false), 1800)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/30 animate-fade-in" onClick={onDismiss} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="paper-card w-full max-w-xs p-6 animate-slide-up"
          style={{ transform: 'rotate(-0.5deg)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="tape" style={{ top: -9, left: '50%', transform: 'translateX(-50%) rotate(1deg)' }} />

          <div className="flex flex-col items-center gap-4 mt-2">
            <Lock
              size={28}
              style={{ color: '#ff3db4', filter: 'drop-shadow(0 0 6px rgba(255,61,180,0.5))' }}
            />
            <h2 className="font-type text-2xl text-ink">Owner access</h2>
            <p className="font-hand text-base text-ink-faded text-center">
              Enter your PIN to unlock settings
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-3">
              <input
                autoFocus
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="PIN…"
                className="paper-input w-full text-center text-xl tracking-widest"
              />

              {wrong && (
                <p className="font-hand text-base text-center animate-fade-in" style={{ color: '#ff3db4' }}>
                  wrong PIN
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 font-hand text-lg text-ink border-2 border-hi-pink/60 rounded-sm bg-hi-pink/10 hover:bg-hi-pink/20 transition-all"
                style={{ boxShadow: '0 0 8px rgba(255,61,180,0.2)' }}
              >
                Unlock
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
