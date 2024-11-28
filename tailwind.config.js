/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#034641',           // Top color for the card
          tint1: '#1c5f5a',
          tint2: '#367974',
          tint3: '#4f928d',
        },
        secondary: {
          DEFAULT: '#dcf0fa',
          tint1: '#f0f9ff',
          tint2: '#e6f5fc',
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
        // New lighter primary color for bottom of card
        'primary-lighter': '#7a9ea8', // Lighter primary color (bottom color)
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        wiggle: 'wiggle 0.5s ease-in-out',
        fadeIn: 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(-5deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Prose styling
    require('@tailwindcss/forms'), // Forms styling (search bar, etc.)
  ],
};