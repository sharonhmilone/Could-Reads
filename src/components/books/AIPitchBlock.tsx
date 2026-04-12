import { Sparkles, Loader2 } from 'lucide-react'

interface AIPitchBlockProps {
  pitch?: string
  streamingText?: string
  isGenerating: boolean
  hasApiKey: boolean
  onGenerate: () => void
}

export function AIPitchBlock({
  pitch,
  streamingText,
  isGenerating,
  hasApiKey,
  onGenerate,
}: AIPitchBlockProps) {
  const displayText = isGenerating ? streamingText : pitch

  if (!displayText && !isGenerating) {
    return (
      <button
        onClick={onGenerate}
        disabled={!hasApiKey}
        className="flex items-center gap-1.5 text-sm font-hand text-ink-faded hover:text-ink-rust transition-colors group disabled:opacity-40 disabled:cursor-not-allowed"
        title={hasApiKey ? 'Generate why-read pitch' : 'Add an API key in Settings first'}
      >
        <Sparkles size={13} className="group-hover:text-hi-pink transition-colors" />
        <span className="underline decoration-dotted underline-offset-2">
          {hasApiKey ? 'why should I read this?' : 'add API key to generate pitch'}
        </span>
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
      {!isGenerating && pitch && (
        <button
          onClick={onGenerate}
          disabled={!hasApiKey}
          className="mt-1 text-xs font-hand text-ink-faded/60 hover:text-ink-faded underline decoration-dotted underline-offset-2 transition-colors"
        >
          regenerate
        </button>
      )}
    </div>
  )
}
