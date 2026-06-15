import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Resolve content globs relative to this config file so Tailwind scans the
// right folder regardless of the working directory the dev server is launched
// from.
const root = dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [join(root, 'index.html'), join(root, 'src/**/*.{ts,tsx}')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          300: '#8ec1ff',
          400: '#599dff',
          500: '#3478f6',
          600: '#1f5be0',
          700: '#1a48b8',
          800: '#1b3e92',
          900: '#1c3873',
        },
        // Signature warm-gold accent, a nod to the geometry of Islamic
        // scholarship that the Khwarizmi name evokes. Pairs with the blue.
        accent: {
          50: '#fdf6e9',
          100: '#f8e7c2',
          200: '#f1d08a',
          300: '#e7b455',
          400: '#d99a2c',
          500: '#c07d16',
          600: '#9c6210',
          700: '#7a4c12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        // A small, intentional elevation scale to replace borders-everywhere.
        card: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)',
        raised: '0 4px 12px rgba(15,23,42,0.08), 0 12px 32px rgba(15,23,42,0.10)',
        float: '0 12px 40px rgba(15,23,42,0.18)',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.18)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.22s cubic-bezier(0.2, 0, 0, 1)',
        pop: 'pop 0.4s cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [],
};
