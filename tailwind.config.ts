import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1c1b18',
        paper: '#e9e0c9',
        'paper-dark': '#ddd0ab',
        'paper-light': '#fdfaf1',
        indigo: { DEFAULT: '#1b2a4a', deep: '#101c33' },
        vermillion: '#b23a2f',
        marigold: '#d9a441',
        pine: '#2f5233'
      },
      fontFamily: {
        display: ['"Yatra One"', 'cursive'],
        sans: ['"Work Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    }
  },
  plugins: []
};

export default config;
