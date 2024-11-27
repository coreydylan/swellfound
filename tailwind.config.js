/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#034641',
          tint1: '#1c5f5a',
          tint2: '#367974',
          tint3: '#4f928d',
        },
        secondary: {
          DEFAULT: '#dcf0fa',
          tint1: '#ffffff',
          tint2: '#ffffff',
          tint3: '#ffffff',
        },
        tertiary: {
          DEFAULT: '#0abeb4',
          tint1: '#30e4da',
          tint2: '#3df1e7',
          tint3: '#56ffff',
        },
        gray: {
          1: '#000000',
          2: '#171818',
          3: '#717171',
        },
      },
    },
  },
  plugins: [],
};
