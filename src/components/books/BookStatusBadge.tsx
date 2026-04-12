import { tasteScoreDisplay } from '@/lib/utils'

interface TasteScoreBadgeProps {
  score: number // 1–10
}

export function TasteScoreBadge({ score }: TasteScoreBadgeProps) {
  const { label, color, glowColor } = tasteScoreDisplay(score)
  return (
    <span
      className="stamp font-type text-xs tracking-widest uppercase"
      style={{
        borderColor: color,
        color,
        background: `${glowColor.replace('0.5', '0.08').replace('0.4', '0.08')}`,
        boxShadow: `0 0 6px ${glowColor}`,
      }}
    >
      {label}
    </span>
  )
}
