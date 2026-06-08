/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        'blush-cream': '#FDF0F6',
        'soft-pink': '#F4C0D1',
        'lavender-mist': '#EEEDFE',
        'periwinkle': '#AFA9EC',
        'rose-accent': '#D4537E',
        'dusk-navy': '#3C3489',
      }
    },
  },
  plugins: [],
}
