/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark:   { DEFAULT: '#020810', 2: '#040f1c', 3: '#071428' },
        green:  { DEFAULT: '#00ff88', dim: '#00c96a' },
        cyan:   { DEFAULT: '#00d4ff' },
        blue:   { DEFAULT: '#0066ff' },
        purple: { DEFAULT: '#7c3aed' },
        amber:  { DEFAULT: '#f59e0b' },
        pink:   { DEFAULT: '#ec4899' },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
      },
      backdropBlur: { glass: '20px', strong: '32px' },
      animation: {
        float:      'float 5s ease-in-out infinite',
        'float-2':  'float 6s ease-in-out infinite -2s',
        'float-3':  'float 7s ease-in-out infinite -4s',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'ring-pulse': 'ringPulse 4s ease-in-out infinite',
        'slide-in': 'slideIn .4s ease-out',
        'fade-up':  'fadeUp .5s ease-out',
        'count-up': 'countUp 1s ease-out',
        'drift':    'drift 15s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseGlow: { '0%,100%': { opacity: 1, boxShadow: '0 0 20px rgba(0,255,136,0.3)' }, '50%': { opacity: 0.7, boxShadow: '0 0 40px rgba(0,255,136,0.6)' } },
        ringPulse: { '0%,100%': { opacity: 0.3, transform: 'scale(1)' }, '50%': { opacity: 1, transform: 'scale(1.03)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        fadeUp:  { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        drift:   { '0%,100%': { transform: 'translate(0,0) scale(1)', opacity: 0 }, '10%': { opacity: 1 }, '90%': { opacity: 0.8 }, '100%': { transform: 'translate(var(--dx),var(--dy)) scale(0)' } }
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glow-green': '0 0 20px rgba(0,255,136,0.3), 0 0 60px rgba(0,255,136,0.1)',
        'glow-cyan':  '0 0 20px rgba(0,212,255,0.3)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.3)',
      }
    },
  },
  plugins: [],
}
