/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B2430',
        inkSoft: '#26313F',
        paper: '#F7F5F1',
        paperDim: '#EDE9E1',
        line: '#DAD4C8',
        teal: {
          DEFAULT: '#2F6F62',
          soft: '#E3EEE9',
        },
        amber: {
          DEFAULT: '#C98A3B',
          soft: '#F5E9D8',
        },
        rust: {
          DEFAULT: '#B6493B',
          soft: '#F3E1DD',
        },
        slate: {
          DEFAULT: '#5B6770',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
