/** Merge class names */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Stable integer hash from a string */
export function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Pick an item from an array using a deterministic seed */
export function pickBySeed<T>(arr: T[], seed: string): T {
  return arr[hashString(seed) % arr.length]
}

// Shared neon palette arrays — used in book cards and taste profile view
export const NEON_COLORS  = ['#ffe500', '#ff3db4', '#00e5ff', '#39ff14', '#ff6d00', '#c400ff'] as const
export const NEON_DIMS    = ['#c4a800', '#cc0090', '#0090aa', '#2a8a10', '#c04000', '#8800bb'] as const
export const HL_CLASSES   = ['hl-yellow', 'hl-pink', 'hl-cyan', 'hl-green', 'hl-orange', 'hl-purple'] as const

export type HlClass = typeof HL_CLASSES[number]

/** Returns a slight card rotation class based on a seed string */
export function cardRotation(seed: string): string {
  return pickBySeed(['-rotate-2', '-rotate-1', '-rotate-1', 'rotate-1', 'rotate-2', '-rotate-1', 'rotate-1', ''], seed)
}

export interface BookPalette {
  hlClass: HlClass
  labelColor: string
}

/** Per-book neon highlighter palette, seeded from book id */
export function bookPalette(seed: string): BookPalette {
  const idx = hashString(seed) % NEON_COLORS.length
  return { hlClass: HL_CLASSES[idx], labelColor: NEON_DIMS[idx] }
}

/** Convert a full-opacity neon hex to a low-opacity rgba background */
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** Taste score → display label + neon colors */
export function tasteScoreDisplay(score: number): {
  label: string
  color: string    // readable ink color for text/border
  neon: string     // full-opacity neon for glow
  hlClass: HlClass
} {
  if (score >= 8) return { label: 'strong match', color: '#2a8a10', neon: '#39ff14', hlClass: 'hl-green'  }
  if (score >= 6) return { label: 'good match',   color: '#0090aa', neon: '#00e5ff', hlClass: 'hl-cyan'   }
  if (score >= 4) return { label: 'maybe',         color: '#c4a800', neon: '#ffe500', hlClass: 'hl-yellow' }
  return              { label: 'stretch',          color: '#c04000', neon: '#ff6d00', hlClass: 'hl-orange' }
}

/** Format an ISO date string */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}
