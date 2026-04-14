import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

export default function handler(): ImageResponse {
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
          width: 100, height: 100, borderRadius: '50%',
          border: '3px solid #c4b49a', opacity: 0.3, display: 'flex',
        }} />

        {/* Coffee ring bottom-right */}
        <div style={{
          position: 'absolute', bottom: 60, right: 100,
          width: 140, height: 140, borderRadius: '50%',
          border: '3px solid #c4b49a', opacity: 0.25, display: 'flex',
        }} />

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '24px' }}>
          <span style={{
            fontSize: 128,
            fontFamily: 'serif',
            fontWeight: 700,
            color: '#2c2416',
            lineHeight: 1,
          }}>
            Could
          </span>
          <span style={{
            fontSize: 128,
            fontFamily: 'serif',
            fontWeight: 700,
            color: '#2c2416',
            lineHeight: 1,
            background: 'rgba(255, 61, 180, 0.28)',
            padding: '0 12px 4px',
          }}>
            Reads
          </span>
        </div>

        {/* Subtitle */}
        <div style={{
          display: 'flex',
          fontSize: 40,
          fontFamily: 'serif',
          fontStyle: 'italic',
          color: '#7a6a55',
          marginBottom: '48px',
        }}>
          books friends think you should read
        </div>

        {/* Green dot accent */}
        <div style={{
          width: 14, height: 14, borderRadius: '50%',
          background: '#39ff14',
          boxShadow: '0 0 12px rgba(57,255,20,0.7)',
          display: 'flex',
        }} />
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
