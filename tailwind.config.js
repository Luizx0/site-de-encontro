export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        space: '#060812',
        star: '#eef2ff',
        neon: '#80d8ff',
        magic: '#c084fc',
        gold: '#f5d76e'
      },
      boxShadow: {
        glow: '0 0 50px rgba(128, 216, 255, 0.18)'
      },
      backgroundImage: {
        'space-gradient': 'radial-gradient(circle at top, rgba(120, 203, 255, 0.06), transparent 28%), radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.14), transparent 16%)'
      }
    }
  },
  plugins: []
};
