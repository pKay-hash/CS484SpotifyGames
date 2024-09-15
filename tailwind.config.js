/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily:{
        teko:["Teko", 'sans-serif'],
        oswald:["Oswald", 'sans-serif']
      },
      keyframes: {
        pulsate: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        animateImage:{
          '0%, 100%': {transform: 'scale(1)', opacity: '0.8'},
          '50%': { transform: 'scale(1.05)', opacity: '1.0' },
        },
      },
      animation: {
        pulsate: 'pulsate 1s ease-in-out infinite',
        animateDrake: 'animateImage 6s ease-in-out infinite 0s',
        animateKdot: 'animateImage 6s ease-in-out infinite 2s',
        animateCole: 'animateImage 6s ease-in-out infinite 4s',
      },
    },
  },
  plugins: [],
}