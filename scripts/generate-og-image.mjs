#!/usr/bin/env node
// Run from project root: node scripts/generate-og-image.mjs
// Generates public/og-image.png as a static file.

import satori from 'satori'
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Use the Geist font bundled inside @vercel/og — always present, no network needed.
const fontData = readFileSync(resolve(root, 'node_modules/@vercel/og/dist/Geist-Regular.ttf'))

function h(type, props, ...children) {
  const c = children.length === 0 ? undefined : children.length === 1 ? children[0] : children
  return { type, props: c !== undefined ? { ...props, children: c } : props }
}

const element = h('div', {
  style: {
    width: 1200, height: 630,
    background: '#e8e0d0',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    padding: '0 110px', position: 'relative',
  },
},
  // coffee rings
  h('div', { style: { position: 'absolute', bottom: 50, right: 80, width: 140, height: 140, borderRadius: '50%', display: 'flex', border: '2px solid rgba(196,168,130,0.4)' } }),
  h('div', { style: { position: 'absolute', bottom: 78, right: 108, width: 84, height: 84, borderRadius: '50%', display: 'flex', border: '1.5px solid rgba(196,168,130,0.25)' } }),
  h('div', { style: { position: 'absolute', top: 60, left: 70, width: 100, height: 100, borderRadius: '50%', display: 'flex', border: '2px solid rgba(196,168,130,0.4)' } }),
  h('div', { style: { position: 'absolute', top: 85, left: 95, width: 50, height: 50, borderRadius: '50%', display: 'flex', border: '1.5px solid rgba(196,168,130,0.25)' } }),
  // title
  h('div', { style: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 } },
    h('span', { style: { fontFamily: 'Geist', fontSize: 110, color: '#2c2416', lineHeight: 1 } }, 'Could'),
    h('span', { style: { fontFamily: 'Geist', fontSize: 110, color: '#2c2416', lineHeight: 1, background: 'rgba(255,61,180,0.35)', padding: '4px 14px 10px' } }, 'Reads'),
  ),
  // tagline
  h('div', { style: { display: 'flex', fontFamily: 'Geist', fontSize: 44, color: '#7a6a55', marginLeft: 4 } }, 'books friends sent me'),
  // green dot
  h('div', { style: { position: 'absolute', bottom: 72, left: 110, width: 14, height: 14, borderRadius: '50%', display: 'flex', background: '#39ff14' } }),
)

const svg = await satori(element, {
  width: 1200,
  height: 630,
  fonts: [{ name: 'Geist', data: fontData, weight: 400, style: 'normal' }],
})

const png = await sharp(Buffer.from(svg)).png().toBuffer()
writeFileSync(resolve(root, 'public/og-image.png'), png)
console.log(`✓ public/og-image.png (${(png.length / 1024).toFixed(1)} KB)`)
