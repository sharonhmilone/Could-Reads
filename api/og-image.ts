export const config = { runtime: 'edge' }

export default function handler(): Response {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Paper background -->
  <rect width="1200" height="630" fill="#e8e0d0"/>

  <!-- Subtle texture lines -->
  <line x1="0" y1="200" x2="1200" y2="200" stroke="#d4c9b5" stroke-width="1" opacity="0.5"/>
  <line x1="0" y1="260" x2="1200" y2="260" stroke="#d4c9b5" stroke-width="1" opacity="0.5"/>
  <line x1="0" y1="320" x2="1200" y2="320" stroke="#d4c9b5" stroke-width="1" opacity="0.5"/>
  <line x1="0" y1="380" x2="1200" y2="380" stroke="#d4c9b5" stroke-width="1" opacity="0.5"/>
  <line x1="0" y1="440" x2="1200" y2="440" stroke="#d4c9b5" stroke-width="1" opacity="0.5"/>

  <!-- Coffee ring decoration -->
  <circle cx="1060" cy="520" r="80" fill="none" stroke="#c4b49a" stroke-width="3" opacity="0.35"/>
  <circle cx="1060" cy="520" r="70" fill="none" stroke="#c4b49a" stroke-width="1" opacity="0.2"/>
  <circle cx="140" cy="100" r="55" fill="none" stroke="#c4b49a" stroke-width="2.5" opacity="0.25"/>

  <!-- Pink highlight box behind "Reads" -->
  <rect x="534" y="178" width="310" height="118" fill="#ff3db4" opacity="0.25" rx="4"/>

  <!-- Could Reads title -->
  <text x="140" y="280" font-family="Georgia, 'Times New Roman', serif" font-size="130" font-weight="700" fill="#2c2416" letter-spacing="-2">Could</text>
  <text x="534" y="280" font-family="Georgia, 'Times New Roman', serif" font-size="130" font-weight="700" fill="#2c2416" letter-spacing="-2" filter="url(#glow)">Reads</text>

  <!-- Pink glow on Reads -->
  <text x="534" y="280" font-family="Georgia, 'Times New Roman', serif" font-size="130" font-weight="700" fill="#ff3db4" opacity="0.15" letter-spacing="-2">Reads</text>

  <!-- Subtitle -->
  <text x="140" y="380" font-family="Georgia, serif" font-size="38" fill="#7a6a55" font-style="italic">books friends think you should read</text>

  <!-- Neon accent dot -->
  <circle cx="140" cy="440" r="6" fill="#39ff14" opacity="0.8"/>
  <circle cx="140" cy="440" r="12" fill="#39ff14" opacity="0.15"/>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
