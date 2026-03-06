/* @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
 theme: {
    extend: {
      colors: {
        emerald: {
          50: '#f0fdf4',
          500: '#10b981',
          600: '#059669',
        }
      }
    },
  },
  plugins: [],
}

