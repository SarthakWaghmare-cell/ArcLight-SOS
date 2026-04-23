/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D',
        surface: '#1A1A1A',
        primary: '#EF4444', 
        apple: {
          red: '#FF3B30',
          redDark: '#FF453A',
          orange: '#FF9500',
          green: '#34C759',
          blue: '#0A84FF',
          purple: '#BF5AF2',
          gray: '#8E8E93',
          grayDark: '#1C1C1E',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
