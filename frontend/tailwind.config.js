export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0a12',
        }
      },
      backgroundOpacity: {
        3: '0.03',
      }
    },
  },
  plugins: [],
}
