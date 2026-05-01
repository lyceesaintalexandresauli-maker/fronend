/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wall-yellow': '#E6C56A',
      },
    },
  },
  plugins: [],
  experimental: {
    optimizeUniversalDefaults: true
  },
  future: {
    hoverOnlyWhenSupported: true,
  }
}
