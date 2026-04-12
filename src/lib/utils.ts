/** Merge class names */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Stable 0-based integer hash from a string */
export function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Returns a slight card rotation class based on a seed string */
export function cardRotation(seed: string): string {
  const rotations = ['-rotate-2', '-rotate-1', '-rotate-1', 'rotate-1', 'rotate-2', '-rotate-1', 'rotate-1', '']
  return rotations[hashString(seed) % rotations.length]
}

export interface BookPalette {
  hlClass: string
  labelColor: string
}

/** Pick a per-book neon highlighter palette, seeded from book id */
export function bookPalette(seed: string): BookPalette {
  const palettes: BookPalette[] = [
    { hlClass: 'hl-pink',   labelColor: '#ff3db4' },
    { hlClass: 'hl-yellow', labelColor: '#c4a800' },
    { hlClass: 'hl-cyan',   labelColor: '#0090aa' },
    { hlClass: 'hl-green',  labelColor: '#2a8a10' },
    { hlClass: 'hl-orange', labelColor: '#c04000' },
    { hlClass: 'hl-purple', labelColor: '#8800bb' },
  ]
  return palettes[hashString(seed) % palettes.length]
}

/** Taste score → display label + neon color */
export function tasteScoreDisplay(score: number): {
  label: string
  color: string
  glowColor: string
  hlClass: string
} {
  if (score >= 8) return { label: 'strong match', color: '#2a8a10', glowColor: 'rgba(57,255,20,0.5)',  hlClass: 'hl-green'  }
  if (score >= 6) return { label: 'good match',   color: '#0090aa', glowColor: 'rgba(0,229,255,0.4)',  hlClass: 'hl-cyan'   }
  if (score >= 4) return { label: 'maybe',         color: '#c4a800', glowColor: 'rgba(255,229,0,0.4)', hlClass: 'hl-yellow' }
  return              { label: 'stretch',          color: '#c04000', glowColor: 'rgba(255,109,0,0.4)', hlClass: 'hl-orange' }
}

/** Format an ISO date string to a readable form */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

/** Truncate text to N words */
export function truncateWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '…'
}
