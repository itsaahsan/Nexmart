/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A0A0A',
        secondary: '#171717',
        accent: '#F97316',
        'accent-hover': '#EA6C0A',
        background: '#FAFAFA',
        card: '#FFFFFF',
        border: '#E5E7EB',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
