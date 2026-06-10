/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdfbf0',
          100: '#faf4d3',
          200: '#f5e89f',
          300: '#edd96a',
          400: '#e4c84a',
          500: '#d4a843',
          600: '#b8893a',
          700: '#8f6530',
          800: '#6b4a26',
          900: '#4a3219',
        },
        cream:    '#faf8f4',
        obsidian: '#0a0a0a',
        charcoal: '#1a1a1a',
      },
      fontFamily: {
        serif:   ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1000': '1000ms',
        '1200': '1200ms',
      },
      animation: {
        /* entrance */
        'fade-up':       'fadeUp 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'fade-up-slow':  'fadeUp 1s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'fade-down':     'fadeDown 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'fade-left':     'fadeLeft 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'fade-right':    'fadeRight 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'fade-in':       'fadeIn 0.5s ease forwards',
        'scale-in':      'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-up':      'slideUp 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        /* looping */
        'shimmer':       'shimmer 1.8s infinite',
        'float':         'float 4s ease-in-out infinite',
        'pulse-gold':    'pulseGold 2s ease-in-out infinite',
        'spin-slow':     'spin 8s linear infinite',
        'marquee':       'marquee 20s linear infinite',
        /* hero */
        'hero-text':     'heroText 1.2s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'hero-line':     'heroLine 1s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s forwards',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity: 0, transform: 'translateY(16px)' },   '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeDown:  { '0%': { opacity: 0, transform: 'translateY(-12px)' },  '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeLeft:  { '0%': { opacity: 0, transform: 'translateX(16px)' },   '100%': { opacity: 1, transform: 'translateX(0)' } },
        fadeRight: { '0%': { opacity: 0, transform: 'translateX(-16px)' },  '100%': { opacity: 1, transform: 'translateX(0)' } },
        fadeIn:    { '0%': { opacity: 0 },                                   '100%': { opacity: 1 } },
        scaleIn:   { '0%': { opacity: 0, transform: 'scale(0.95)' },        '100%': { opacity: 1, transform: 'scale(1)' } },
        slideUp:   { '0%': { transform: 'translateY(100%)' },               '100%': { transform: 'translateY(0)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' },               '100%': { backgroundPosition: '200% 0' } },
        float:     { '0%,100%': { transform: 'translateY(0)' },             '50%': { transform: 'translateY(-10px)' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(212,168,67,0.4)' }, '50%': { boxShadow: '0 0 0 10px rgba(212,168,67,0)' } },
        marquee:   { '0%': { transform: 'translateX(0)' },                  '100%': { transform: 'translateX(-50%)' } },
        heroText:  { '0%': { opacity: 0, transform: 'translateY(24px)' },   '100%': { opacity: 1, transform: 'translateY(0)' } },
        heroLine:  { '0%': { transform: 'scaleX(0)', opacity: 0 },          '100%': { transform: 'scaleX(1)', opacity: 1 } },
      },
      backgroundImage: {
        'gold-gradient':  'linear-gradient(135deg, #d4a843 0%, #f5e89f 50%, #d4a843 100%)',
        'dark-gradient':  'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        'gold-shimmer':   'linear-gradient(90deg, #d4a843 0%, #f5e89f 40%, #d4a843 60%, #b8893a 100%)',
      },
    },
  },
  plugins: [],
}
