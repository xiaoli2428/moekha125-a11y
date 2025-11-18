module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6EE7B7',
        accent: '#7C3AED'
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.06))'
      }
    },
  },
  plugins: [],
}