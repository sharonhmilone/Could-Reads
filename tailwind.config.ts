import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        hand: ['Caveat', 'cursive'],
        type: ['Special Elite', 'cursive'],
        sans: ['Caveat', 'cursive'],
      },
      colors: {
        paper: {
          DEFAULT: '#f0e4c8',
          light: '#faf5e8',
          dark: '#e0d0a8',
          aged: '#d4c090',
        },
        ink: {
          DEFAULT: '#2c1810',
          brown: '#5c3d2e',
          rust: '#8b3a0f',
          blue: '#2a4a7f',
          faded: '#7a6a5a',
        },
        stain: {
          coffee: '#c4a882',
          rust: '#c87040',
          blue: '#7090b8',
        },
        // Neon highlighter colors — translucent on paper
        hi: {
          yellow: '#ffe500',
          pink: '#ff3db4',
          green: '#39ff14',
          cyan: '#00e5ff',
          orange: '#ff6d00',
          purple: '#c400ff',
        },
      },
      boxShadow: {
        paper: '2px 3px 8px rgba(44, 24, 16, 0.25), 1px 1px 3px rgba(44, 24, 16, 0.15)',
        'paper-lg': '4px 6px 16px rgba(44, 24, 16, 0.3), 2px 2px 6px rgba(44, 24, 16, 0.2)',
        'paper-lifted': '6px 8px 20px rgba(44, 24, 16, 0.35)',
        // Neon glow shadows — used on highlighted elements
        'glow-yellow': '0 0 8px rgba(255, 229, 0, 0.7), 0 0 20px rgba(255, 229, 0, 0.25)',
        'glow-pink': '0 0 8px rgba(255, 61, 180, 0.6), 0 0 20px rgba(255, 61, 180, 0.2)',
        'glow-green': '0 0 8px rgba(57, 255, 20, 0.6), 0 0 20px rgba(57, 255, 20, 0.2)',
        'glow-cyan': '0 0 8px rgba(0, 229, 255, 0.6), 0 0 20px rgba(0, 229, 255, 0.2)',
        'glow-orange': '0 0 8px rgba(255, 109, 0, 0.6), 0 0 20px rgba(255, 109, 0, 0.2)',
        'glow-purple': '0 0 8px rgba(196, 0, 255, 0.6), 0 0 20px rgba(196, 0, 255, 0.2)',
        pin: '0 2px 6px rgba(44, 24, 16, 0.4)',
      },
      rotate: {
        '-2': '-2deg',
        '-1.5': '-1.5deg',
        '-1': '-1deg',
        '-0.5': '-0.5deg',
        '0.5': '0.5deg',
        '1': '1deg',
        '1.5': '1.5deg',
        '2': '2deg',
        '2.5': '2.5deg',
      },
      backgroundImage: {
        'paper-texture': `
          radial-gradient(ellipse at 20% 30%, rgba(180,140,80,0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 70%, rgba(160,120,60,0.05) 0%, transparent 50%)
        `,
        'lined-paper': `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 27px,
            rgba(44,24,16,0.07) 27px,
            rgba(44,24,16,0.07) 28px
          ),
          linear-gradient(90deg, transparent 48px, rgba(180,80,80,0.15) 48px, rgba(180,80,80,0.15) 50px, transparent 50px)
        `,
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        blink: 'blink 1.2s step-end infinite',
        wiggle: 'wiggle 0.3s ease-in-out',
        'stamp-in': 'stampIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        stampIn: {
          from: { opacity: '0', transform: 'scale(1.3) rotate(-5deg)' },
          to: { opacity: '1', transform: 'scale(1) rotate(-3deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
