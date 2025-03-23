module.exports = {
  purge: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      fontFamily: {
        stock: ['Roboto Mono', 'monospace'], // Use a font that fits the stock market theme
      },
      colors: {
        dark: {
          DEFAULT: '#1f2937',
          light: '#374151',
          lighter: '#4b5563',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
