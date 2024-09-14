/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily:{teko:["Teko", 'sans-serif'],
        oswald:["Oswald", 'sans-serif']
      },
      keyframes: {
        pulsate: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        pulsate: 'pulsate 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}