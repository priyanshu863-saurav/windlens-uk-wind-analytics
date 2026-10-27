/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B14',
          900: '#0B1120', // Background
          800: '#111B2E', // Panel background
          700: '#1A2740', // Panel hover / elevated
          600: '#253249', // Borders
          500: '#33435F',
        },
        teal: {
          DEFAULT: '#2DD4BF',
          400: '#2DD4BF',
          500: '#14B8A6',
          900: '#042F2E',
          950: '#021B1A',
        },
        amber: {
          DEFAULT: '#FBBF24',
          400: '#FBBF24',
          500: '#F59E0B',
          900: '#451A03',
          950: '#260E02',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(37, 50, 73, 0.6)',
        'panel-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(45, 212, 191, 0.3)',
      },
    },
  },
  plugins: [],
};
