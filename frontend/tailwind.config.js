/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Emerald Noir luxury palette ── */
        'soft-black':  '#0A0F0D',
        'rose-gold':   '#D4A96A',
        'ivory':       '#F5F0E8',
        'luxury-gold': '#C8991E',

        /* ── Legacy gold scale (keep existing usages working) ── */
        gold: {
          50:  '#fdf8ec',
          100: '#f8edc5',
          200: '#f0d480',
          300: '#e5b840',
          400: '#C8991E',
          500: '#C8991E',
          600: '#a47c18',
          700: '#7d5f12',
          800: '#58430d',
          900: '#382b08',
        },

        /* ── Neutral base ── */
        cream:     '#F5F0E8',
        obsidian:  '#0A0F0D',
        charcoal:  '#0D1F17',
        amethyst:  '#1A6B4A',
        midnight:  '#0D1F17',
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
        '400':  '400ms',
        '600':  '600ms',
        '800':  '800ms',
        '1000': '1000ms',
        '1200': '1200ms',
      },
      animation: {
        'fade-up':      'fadeUp 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'fade-up-slow': 'fadeUp 1s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'fade-down':    'fadeDown 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'fade-left':    'fadeLeft 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'fade-right':   'fadeRight 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'fade-in':      'fadeIn 0.5s ease forwards',
        'scale-in':     'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-up':     'slideUp 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'shimmer':      'shimmer 1.8s infinite',
        'float':        'float 4s ease-in-out infinite',
        'pulse-gold':   'pulseGold 2s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
        'marquee':      'marquee 20s linear infinite',
        'hero-text':    'heroText 1.2s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'hero-line':    'heroLine 1s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s forwards',
        'rose-pulse':   'rosePulse 3s ease-in-out infinite',
        'amethyst-pulse': 'amethystPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity: 0, transform: 'translateY(16px)' },  '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeDown:  { '0%': { opacity: 0, transform: 'translateY(-12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeLeft:  { '0%': { opacity: 0, transform: 'translateX(16px)' },  '100%': { opacity: 1, transform: 'translateX(0)' } },
        fadeRight: { '0%': { opacity: 0, transform: 'translateX(-16px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        fadeIn:    { '0%': { opacity: 0 },                                  '100%': { opacity: 1 } },
        scaleIn:   { '0%': { opacity: 0, transform: 'scale(0.95)' },       '100%': { opacity: 1, transform: 'scale(1)' } },
        slideUp:   { '0%': { transform: 'translateY(100%)' },              '100%': { transform: 'translateY(0)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' },              '100%': { backgroundPosition: '200% 0' } },
        float:     { '0%,100%': { transform: 'translateY(0)' },            '50%': { transform: 'translateY(-10px)' } },
        pulseGold: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(200,153,30,0.4)' },
          '50%':     { boxShadow: '0 0 0 10px rgba(200,153,30,0)' },
        },
        rosePulse: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(212,169,106,0.4)' },
          '50%':     { boxShadow: '0 0 0 12px rgba(212,169,106,0)' },
        },
        amethystPulse: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(26,107,74,0.4)' },
          '50%':     { boxShadow: '0 0 0 12px rgba(26,107,74,0)' },
        },
        marquee:   { '0%': { transform: 'translateX(0)' },                 '100%': { transform: 'translateX(-50%)' } },
        heroText:  { '0%': { opacity: 0, transform: 'translateY(24px)' },  '100%': { opacity: 1, transform: 'translateY(0)' } },
        heroLine:  { '0%': { transform: 'scaleX(0)', opacity: 0 },         '100%': { transform: 'scaleX(1)', opacity: 1 } },
      },
      backgroundImage: {
        /* luxury gold shine */
        'gold-gradient':     'linear-gradient(135deg, #C8991E 0%, #EFC84A 45%, #C8991E 100%)',
        'gold-shimmer':      'linear-gradient(90deg, #C8991E 0%, #EFC84A 40%, #C8991E 60%, #9a7510 100%)',
        /* champagne tint */
        'rose-gradient':     'linear-gradient(135deg, #D4A96A 0%, #EDD09A 50%, #D4A96A 100%)',
        /* deep forest midnight */
        'dark-gradient':     'linear-gradient(180deg, #0A0F0D 0%, #0D1F17 100%)',
        /* hero overlay */
        'hero-overlay':      'linear-gradient(135deg, rgba(10,15,13,0.95) 0%, rgba(10,15,13,0.65) 60%, rgba(26,107,74,0.2) 100%)',
        /* card hover shimmer */
        'card-shine':        'linear-gradient(105deg, transparent 40%, rgba(200,153,30,0.18) 50%, transparent 60%)',
        /* emerald accent */
        'amethyst-gradient': 'linear-gradient(135deg, #1A6B4A 0%, #2DBD82 50%, #1A6B4A 100%)',
      },
      boxShadow: {
        'gold':        '0 8px 32px rgba(200,153,30,0.40)',
        'gold-lg':     '0 16px 48px rgba(200,153,30,0.50)',
        'rose':        '0 8px 32px rgba(212,169,106,0.40)',
        'rose-lg':     '0 16px 48px rgba(212,169,106,0.50)',
        'amethyst':    '0 8px 32px rgba(26,107,74,0.40)',
        'amethyst-lg': '0 16px 48px rgba(26,107,74,0.50)',
        'luxury':      '0 24px 64px rgba(10,15,13,0.30)',
        'glass':       '0 4px 24px rgba(10,15,13,0.20), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
}
