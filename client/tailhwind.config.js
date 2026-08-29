/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          700: '#0B6B61',
        },
        amber: {
          50: '#FFFBEB',
        },
        stone: {
          800: '#1C1917',
        },
      },
    },
  },
  plugins: [],
};
