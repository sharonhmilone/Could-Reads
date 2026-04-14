import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

export default async function handler(): Promise<Response> {
  // Load Special Elite so the image matches the app's typewriter aesthetic
  let fontData: ArrayBuffer | undefined
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Special+Elite&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120' } }
    ).then(r => r.text())
    const fontUrl = css.match(/url\(([^)]+)\)/)?.[1]
    if (fontUrl) fontData = await fetch(fontUrl).then(r => r.arrayBuffer())
  } catch {
    // Fall back to browser serif if Google Fonts is unreachable
  }

  const fonts = fontData
    ? [{ name: 'Special Elite', data: fontData, style: 'normal' as const, weight: 400 as const }]
    : []

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
          padding: '90px 100px',
          position: 'relative',
        }}
      >
        {/* Coffee ring top-left */}
        <div style={{
          position: 'absolute', top: 60, left: 80,
          width: 110, height: 110, borderRadius: '50%',
          border: '3px solid #c4b49a', opacity: 0.35, display: 'flex',
        }} />
        {/* Coffee ring inner top-left */}
        <div style={{
          position: 'absolute', top: 82, left: 102,
          width: 66, height: 66, borderRadius: '50%',
          border: '1.5px solid #c4b49a', opacity: 0.2, display: 'flex',
        }} />

        {/* Coffee ring bottom-right */}
        <div style={{
          position: 'absolute', bottom: 55, right: 90,
          width: 150, height: 150, borderRadius: '50%',
          border: '3px solid #c4b49a', opacity: 0.3, display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: 80, right: 115,
          width: 100, height: 100, borderRadius: '50%',
          border: '1.5px solid #c4b49a', opacity: 0.18, display: 'flex',
        }} />

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', marginBottom: '28px' }}>
          <span style={{
            fontSize: 128,
            fontFamily: fontData ? 'Special Elite' : 'serif',
            color: '#2c2416',
            lineHeight: 1,
          }}>
            Could
          </span>
          <span style={{
            fontSize: 128,
            fontFamily: fontData ? 'Special Elite' : 'serif',
            color: '#2c2416',
            lineHeight: 1,
            background: 'rgba(255, 61, 180, 0.28)',
            padding: '0 14px 6px',
          }}>
            Reads
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          display: 'flex',
          fontSize: 46,
          fontFamily: fontData ? 'Special Elite' : 'serif',
          color: '#7a6a55',
          marginBottom: '14px',
          letterSpacing: '0.01em',
        }}>
          books from friends
        </div>

        {/* Sub-tagline */}
        <div style={{
          display: 'flex',
          fontSize: 28,
          fontFamily: fontData ? 'Special Elite' : 'serif',
          color: '#a89880',
          letterSpacing: '0.02em',
        }}>
          with an AI pitch for each one
        </div>

        {/* Green dot accent */}
        <div style={{
          position: 'absolute',
          bottom: 88,
          left: 100,
          width: 16, height: 16, borderRadius: '50%',
          background: '#39ff14',
          boxShadow: '0 0 14px rgba(57,255,20,0.8)',
          display: 'flex',
        }} />
      </div>
    ),
    { width: 1200, height: 630, fonts }
  )
}
