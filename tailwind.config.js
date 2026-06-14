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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
