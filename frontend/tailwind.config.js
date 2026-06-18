/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0F1115',
          900: '#15171C',
          800: '#1C1F26',
          700: '#242830',
          600: '#2E333D',
        },
        line: '#2A2E38',
        ink: {
          DEFAULT: '#EDEEF0',
          muted: '#8B8F99',
          faint: '#5C606A',
        },
        brass: '#D9A65A',
        brick: '#E2554A',
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 0 0 1px #2A2E38, 0 12px 28px -10px rgba(0,0,0,0.55)',
      },
      keyframes: {
        stamp: {
          '0%': { transform: 'scale(1.6)', opacity: '0' },
          '55%': { transform: 'scale(0.92)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        deny: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        stamp: 'stamp 0.5s ease-out forwards',
        deny: 'deny 0.28s ease-in-out',
        ticker: 'ticker 32s linear infinite',
      },
    },
  },
  plugins: [],
};
