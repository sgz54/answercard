/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bamboo: {
          50: '#f2f6f3',
          100: '#dce8e0',
          200: '#b9d1c2',
          300: '#8fb39d',
          400: '#6a9578',
          500: '#4A7C59',
          600: '#3c6648',
          700: '#31523c',
          800: '#284131',
          900: '#1f3326',
        },
        cream: {
          DEFAULT: '#F5E6CA',
          50: '#fdf9f0',
          100: '#faf2e1',
          200: '#F5E6CA',
          300: '#ecd5ab',
          400: '#dfbe84',
        },
        ember: {
          DEFAULT: '#e0854f',
          light: '#f0a978',
          dark: '#c46a38',
        },
        ink: '#2b2f2c',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        spinFast: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(1440deg)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        breathe: 'breathe 3.6s ease-in-out infinite',
        fadeUp: 'fadeUp 0.7s ease-out both',
        fadeIn: 'fadeIn 0.6s ease-out both',
        pulseDot: 'pulseDot 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
