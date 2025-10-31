 /** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2fb',
          100: '#dce5f7',
          200: '#b9ccef',
          300: '#96b2e7',
          400: '#7399df',
          500: '#5B6FB5',  // Your main brand color
          600: '#4A5FA4',  // Your secondary brand color
          700: '#3D4E8D',  // Your accent brand color
          800: '#2f3d6f',
          900: '#212c51',
        },
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}