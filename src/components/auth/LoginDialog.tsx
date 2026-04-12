import { useState } from 'react'
import { Mail, X, Sparkles } from 'lucide-react'

interface LoginDialogProps {
  onDismiss: () => void
  onSendLink: (email: string) => Promise<{ error: string | null }>
}

export function LoginDialog({ onDismiss, onSendLink }: LoginDialogProps) {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const result = await onSendLink(email.trim())
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/30 animate-fade-in" onClick={onDismiss} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="paper-card w-full max-w-xs p-6 animate-slide-up relative"
          style={{ transform: 'rotate(-0.5deg)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="tape" style={{ top: -9, left: '50%', transform: 'translateX(-50%) rotate(1deg)' }} />

          <div className="flex items-start justify-between mb-1 mt-2">
            <div className="flex items-center gap-2">
              <Mail size={20} style={{ color: '#ff3db4', filter: 'drop-shadow(0 0 4px rgba(255,61,180,0.5))' }} />
              <h2 className="font-type text-xl text-ink">Owner access</h2>
            </div>
            <button onClick={onDismiss} className="p-1 text-ink-faded hover:text-ink">
              <X size={18} />
            </button>
          </div>

          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(57,255,20,0.15)', boxShadow: '0 0 12px rgba(57,255,20,0.3)' }}
              >
                <Sparkles size={20} style={{ color: '#39ff14' }} />
              </span>
              <p className="font-hand text-base text-ink text-center">
                Check your email for a magic link.
              </p>
              <p className="font-hand text-sm text-ink-faded text-center">
                Click it to sign in as owner — no password needed.
              </p>
            </div>
          ) : (
            <>
              <p className="font-hand text-base text-ink-faded mb-4 mt-2">
                Enter your email to receive a magic sign-in link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="paper-input w-full"
                />

                {error && (
                  <p className="font-hand text-sm text-center animate-fade-in" style={{ color: '#ff3db4' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!email.trim() || loading}
                  className="w-full py-2.5 font-hand text-lg text-ink border-2 border-hi-pink/60 rounded-sm bg-hi-pink/10 hover:bg-hi-pink/20 transition-all disabled:opacity-40"
                  style={{ boxShadow: email.trim() ? '0 0 8px rgba(255,61,180,0.2)' : 'none' }}
                >
                  {loading ? 'Sending…' : 'Send magic link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
