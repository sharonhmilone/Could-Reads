import { Sparkles, Loader2 } from 'lucide-react'

interface AIPitchBlockProps {
  pitch?: string
  streamingText?: string
  isGenerating: boolean
  hasApiKey: boolean
  hasTasteProfile: boolean
  onGenerate: () => void
}

export function AIPitchBlock({
  pitch,
  streamingText,
  isGenerating,
  hasApiKey,
  hasTasteProfile,
  onGenerate,
}: AIPitchBlockProps) {
  // Show existing pitch text while streaming starts (no blank flash at generation start)
  const displayText = (isGenerating && streamingText) ? streamingText : pitch

  if (!displayText && !isGenerating) {
    // Visitors see nothing — only owner can generate
    if (!hasApiKey) return null

    const hint = !hasTasteProfile
      ? 'import reading history for a personal pitch'
      : 'why should I read this?'

    return (
      <button
        onClick={onGenerate}
        className="flex items-center gap-1.5 text-sm font-hand text-ink-faded hover:text-ink-rust transition-colors group"
        title={hint}
      >
        <Sparkles size={13} className="group-hover:text-hi-pink transition-colors" />
        <span className="underline decoration-dotted underline-offset-2">{hint}</span>
      </button>
    )
  }

  return (
    <div className="mt-2">
      <div className="flex items-start gap-1.5">
        {isGenerating ? (
          <Loader2 size={12} className="mt-1 shrink-0 text-hi-pink animate-spin" />
        ) : (
          <Sparkles size={12} className="mt-1 shrink-0 text-hi-pink opacity-60" />
        )}
        <p className="font-hand text-base text-ink-brown leading-snug">
          {displayText}
          {isGenerating && (
            <span className="inline-block w-0.5 h-4 bg-hi-pink ml-0.5 animate-blink align-text-bottom" />
          )}
        </p>
      </div>
      {!isGenerating && pitch && hasApiKey && (
        <button
          onClick={onGenerate}
          className="mt-1 text-xs font-hand text-ink-faded/60 hover:text-ink-faded underline decoration-dotted underline-offset-2 transition-colors"
        >
          regenerate
        </button>
      )}
    </div>
  )
}
