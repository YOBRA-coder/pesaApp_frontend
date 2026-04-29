/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080c14',
        bg2: '#0d1220',
        bg3: '#111827',
        card: '#0f1623',
        card2: '#141d2e',
        green: { DEFAULT: '#00e57a', dark: '#00c46a' },
        gold: '#f0c040',
        danger: '#ff4d6a',
        blue: { DEFAULT: '#4d9fff' },
        purple: { DEFAULT: '#a855f7' },
        border: 'rgba(255,255,255,0.07)',
        border2: 'rgba(255,255,255,0.12)',
        muted: '#8899aa',
        subtle: '#4a5c70',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(0,229,122,0.15)',
        'glow-lg': '0 0 60px rgba(0,229,122,0.08)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        pulse2: 'pulse 2s infinite',
      },
      keyframes: {
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
