
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wooly-cream': '#FFF5E1',
        'wooly-pink': {
          100: '#FFE4E1',
          300: '#FFB6C1',
          400: '#FF9EAA',
          500: '#FF8095',
        },
        'wooly-peach': '#FFDAB9',
        'wooly-lavender': '#E6E6FA',
        'wooly-brown': '#5D4037',
        'wooly-sage': '#D8BFD8',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        hand: ['Patrick Hand', 'cursive'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(255, 182, 193, 0.4)',
        'cute': '4px 4px 0px 0px rgba(255, 182, 193, 1)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}
