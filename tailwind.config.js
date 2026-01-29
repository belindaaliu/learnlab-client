/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5b21b6',
        primaryHover: '#4c1d95',
        secondary: '#0ea5e9',
        background: '#f8fafc',
        surface: '#ffffff',
        textMain: '#1e293b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}