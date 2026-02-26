/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1A237E',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

