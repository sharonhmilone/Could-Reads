import { tasteScoreDisplay, withAlpha } from '@/lib/utils'

interface TasteScoreBadgeProps {
  score: number // 1–10
}

export function TasteScoreBadge({ score }: TasteScoreBadgeProps) {
  const { label, color, neon } = tasteScoreDisplay(score)
  return (
    <span
      className="stamp font-type text-xs tracking-widest uppercase"
      style={{
        borderColor: color,
        color,
        background: withAlpha(neon, 0.08),
        boxShadow: `0 0 6px ${withAlpha(neon, 0.4)}`,
      }}
    >
      {label}
    </span>
  )
}
