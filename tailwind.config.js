/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFE500',
          green: '#00A968',
          pink: '#F381A6',
          blue: '#3989C5',
          cream: '#FFF0D9',
          bg: '#FFF9EF',
          black: '#171717',
          secondary: '#66615B',
          border: '#171717',
        }
      },
      fontFamily: {
        display: ['Fredoka', 'Poppins', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'retro-sm': '2px 2px 0px #171717',
        'retro': '4px 4px 0px #171717',
        'retro-lg': '6px 6px 0px #171717',
        'retro-xl': '8px 8px 0px #171717',
        'retro-white': '4px 4px 0px #FFFFFF',
        'retro-green': '4px 4px 0px #00A968',
        'retro-pink': '4px 4px 0px #F381A6',
        'retro-yellow': '4px 4px 0px #FFE500',
        'retro-blue': '4px 4px 0px #3989C5',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
