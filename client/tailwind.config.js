/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#b8d1ff',
          300: '#8ab0ff',
          400: '#5b87ff',
          500: '#3861fa',
          600: '#2643e0',
          700: '#1f34b0',
          800: '#1c2e8c',
          900: '#1a2870',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};
