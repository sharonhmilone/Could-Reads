/** Merge class names (simple version, no clsx dep needed) */
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
  const rotations = [
    '-rotate-2',
    '-rotate-1',
    '-rotate-1',
    'rotate-1',
    'rotate-2',
    '-rotate-1',
    'rotate-1',
    '',
  ]
  return rotations[hashString(seed) % rotations.length]
}

export interface BookPalette {
  hlClass: string         // e.g. 'hl-pink' — the highlighter sweep on the title
  glowClass: string       // e.g. 'shadow-glow-pink'
  borderStyle: string     // inline style string for left border
  labelColor: string      // e.g. '#ff3db4'
  name: string
}

/** Pick a per-book neon highlighter palette, seeded from title+author */
export function bookPalette(seed: string): BookPalette {
  const palettes: BookPalette[] = [
    { hlClass: 'hl-pink',   glowClass: 'shadow-glow-pink',   borderStyle: 'border-left: 4px solid #ff3db4', labelColor: '#ff3db4', name: 'pink' },
    { hlClass: 'hl-yellow', glowClass: 'shadow-glow-yellow', borderStyle: 'border-left: 4px solid #ffe500', labelColor: '#c4a800', name: 'yellow' },
    { hlClass: 'hl-cyan',   glowClass: 'shadow-glow-cyan',   borderStyle: 'border-left: 4px solid #00e5ff', labelColor: '#0090aa', name: 'cyan' },
    { hlClass: 'hl-green',  glowClass: 'shadow-glow-green',  borderStyle: 'border-left: 4px solid #39ff14', labelColor: '#2a8a10', name: 'green' },
    { hlClass: 'hl-orange', glowClass: 'shadow-glow-orange', borderStyle: 'border-left: 4px solid #ff6d00', labelColor: '#c04000', name: 'orange' },
    { hlClass: 'hl-purple', glowClass: 'shadow-glow-purple', borderStyle: 'border-left: 4px solid #c400ff', labelColor: '#8800bb', name: 'purple' },
  ]
  return palettes[hashString(seed) % palettes.length]
}

/** Format an ISO date string to a readable form */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

/** Source display info */
export function sourceInfo(source: string): { label: string; emoji: string } {
  const map: Record<string, { label: string; emoji: string }> = {
    linkedin:    { label: 'LinkedIn',    emoji: '💼' },
    twitter:     { label: 'Twitter/X',   emoji: '🐦' },
    'in-person': { label: 'In person',   emoji: '🗣️' },
    podcast:     { label: 'Podcast',     emoji: '🎙️' },
    newsletter:  { label: 'Newsletter',  emoji: '📬' },
    other:       { label: 'Other',       emoji: '📌' },
  }
  return map[source] ?? { label: source, emoji: '📌' }
}

/** Truncate text to N words */
export function truncateWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '…'
}
