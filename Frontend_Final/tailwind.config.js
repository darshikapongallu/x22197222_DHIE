module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'home-bg': "url('./src/assets/imgs/hlthbg1.jpg')",
      },
      backgroundColor: {
        'overlay-light': 'rgba(255, 255, 255, 0.7)',
        'overlay-dark': 'rgba(0, 0, 0, 0.7)',
      }
    },
  },
  plugins: [],
}
