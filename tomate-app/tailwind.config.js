/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Gym IA tokens ─────────────────────────────────────────────────
        ink: {
          DEFAULT: '#F4F4F5',  // primary
          2: '#A1A1A8',        // secondary
          3: '#62626A',        // tertiary / labels / units
          4: '#3D3D44',        // disabled / icon strokes
        },
        accent: {
          DEFAULT: '#FF2D2D',  // primary CTA, current state, PRs
          dim:     '#E12121',  // pressed
          soft:    'rgba(255,45,45,0.12)',
          line:    'rgba(255,45,45,0.35)',
        },
        surface: {
          DEFAULT: '#0A0A0B',  // app background
          raised:  '#121214',  // modals, panels
          card:    '#17171A',  // card bg
          elev:    '#1E1E22',  // buttons, chips, key inputs
          line:    '#24242A',  // borders, dividers
          'line-soft': '#1B1B20',  // subtle dividers inside cards
        },
        good: '#4ADE80',
        warn: '#F59E0B',

        // Backwards compat: keep brand mapping to accent so old refs still work
        brand: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#FF6B6B',
          500: '#FF2D2D',
          600: '#E12121',
          700: '#B81818',
          800: '#8F1212',
          900: '#660C0C',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        serif:   ['"Instrument Serif"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        eyebrow:    '0.18em',
        'eyebrow-2': '0.14em',
        display:    '-0.02em',
        'display-tight': '-0.03em',
        // legacy aliases used in older components
        'wider-x':   '0.14em',
        'widest-x':  '0.18em',
      },
      fontSize: {
        // Display scale (serif italic)
        'display-1': ['64px',  { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        'display-2': ['52px',  { lineHeight: '0.96', letterSpacing: '-0.025em' }],
        'display-3': ['44px',  { lineHeight: '1.0',  letterSpacing: '-0.02em' }],
        'display-4': ['38px',  { lineHeight: '1.0',  letterSpacing: '-0.02em' }],
        'display-5': ['28px',  { lineHeight: '1.0',  letterSpacing: '-0.02em' }],
        // Big mono numbers
        'num-xl':    ['80px', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'num-l':     ['52px', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'num-m':     ['38px', { lineHeight: '1.0' }],
        'num-s':     ['26px', { lineHeight: '1.0' }],
        // Eyebrow
        eyebrow: ['10px',  { lineHeight: '1.2', letterSpacing: '0.18em' }],
      },
      borderRadius: {
        'pill': '999px',
      },
      keyframes: {
        'check-pop': {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',   opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        breathe: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.45' },
        },
        amp: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%':       { transform: 'scaleY(1.0)' },
        },
      },
      animation: {
        'check-pop': 'check-pop 400ms ease',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'breathe':   'breathe 2s ease-in-out infinite',
        'amp':       'amp 700ms ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
