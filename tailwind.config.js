/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-green': '#29cc85',
        'success-bg': 'rgba(41, 204, 133, 0.08)',
        'failed-red': '#ff4d4f',
        'failed-bg': 'rgba(255, 77, 79, 0.08)',
        'text-primary': '#1a1a1b',
        'text-secondary': '#9da3ae',
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'sans-serif'],
      },
      borderRadius: {
        'lg': '16px',
        'md': '10px',
      },
      boxShadow: {
        'card': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'btn': '0 8px 16px rgba(41, 204, 133, 0.15)',
      }
    },
  },
  plugins: [],
}
