/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        success: '#16A34A',
        warning: '#F59E0B',
        retrogression: '#DC2626',
        bgDark: '#0F172A',
        cardDark: '#1E293B',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
