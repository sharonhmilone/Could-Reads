import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

async function fetchFont(family: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120' } }
    ).then(r => r.text())
    const url = css.match(/url\(([^)]+)\)/)?.[1]
    if (!url) return null
    return fetch(url).then(r => r.arrayBuffer())
  } catch {
    return null
  }
}

export default async function handler(): Promise<Response> {
  // 4-second timeout — if Google Fonts is slow, fall back to Noto Sans
  const timeout = new Promise<[null, null]>(resolve => setTimeout(() => resolve([null, null]), 4000))
  const [specialEliteData, caveatData] = await Promise.race([
    Promise.all([fetchFont('Special Elite'), fetchFont('Caveat')]),
    timeout,
  ])

  // Only pass fonts when we actually have data — passing [] suppresses
  // Satori's built-in Noto fonts and renders all text invisible.
  const fonts: ConstructorParameters<typeof ImageResponse>[1]['fonts'] =
    [
      specialEliteData && { name: 'Special Elite', data: specialEliteData, style: 'normal' as const, weight: 400 as const },
      caveatData       && { name: 'Caveat',        data: caveatData,        style: 'normal' as const, weight: 400 as const },
    ].filter(Boolean) as ConstructorParameters<typeof ImageResponse>[1]['fonts']

  const titleFont = specialEliteData ? 'Special Elite' : 'sans-serif'
  const handFont  = caveatData       ? 'Caveat'        : 'sans-serif'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#e8e0d0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 110px',
          position: 'relative',
        }}
      >
        {/* Coffee rings */}
        <div style={{ position: 'absolute', bottom: 50, right: 80, width: 140, height: 140, borderRadius: '50%', display: 'flex', border: '2px solid rgba(196,168,130,0.35)', boxShadow: 'inset 0 0 0 1px rgba(196,168,130,0.15)' }} />
        <div style={{ position: 'absolute', bottom: 75, right: 105, width: 90, height: 90, borderRadius: '50%', display: 'flex', border: '1.5px solid rgba(196,168,130,0.2)' }} />
        <div style={{ position: 'absolute', top: 60, left: 70, width: 100, height: 100, borderRadius: '50%', display: 'flex', border: '2px solid rgba(196,168,130,0.35)', boxShadow: 'inset 0 0 0 1px rgba(196,168,130,0.15)' }} />
        <div style={{ position: 'absolute', top: 83, left: 93, width: 54, height: 54, borderRadius: '50%', display: 'flex', border: '1.5px solid rgba(196,168,130,0.2)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontFamily: titleFont, fontSize: 120, color: '#2c2416', lineHeight: 1 }}>
            Could
          </span>
          <span style={{ fontFamily: titleFont, fontSize: 120, color: '#2c2416', lineHeight: 1, background: 'rgba(255,61,180,0.35)', padding: '2px 8px 8px', textShadow: '0 0 28px rgba(255,61,180,0.45)' }}>
            Reads
          </span>
        </div>

        {/* Tagline */}
        <div style={{ display: 'flex', fontFamily: handFont, fontSize: 48, color: '#7a6a55', transform: 'rotate(1deg)', transformOrigin: 'left center', marginLeft: '4px' }}>
          books friends sent me
        </div>

        {/* Green dot */}
        <div style={{ position: 'absolute', bottom: 72, left: 110, width: 14, height: 14, borderRadius: '50%', display: 'flex', background: '#39ff14', boxShadow: '0 0 14px rgba(57,255,20,0.8)' }} />
      </div>
    ),
    { width: 1200, height: 630, fonts: fonts.length ? fonts : undefined }
  )
}
