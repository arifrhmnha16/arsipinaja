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
          blue: '#2563EB',       // Primary Royal Blue
          sky: '#38BDF8',        // Retro Sky Blue
          cyan: '#0EA5E9',       // Electric Cyan
          navy: '#1E3A8A',       // Deep Navy
          ice: '#E0F2FE',        // Ice Blue Surface
          cream: '#E0F2FE',      // Soft Blue Tint (alias)
          bg: '#F0F7FF',         // Fresh Ice Blue Background
          black: '#171717',      // Brutalist Outline Black
          secondary: '#475569',   // Slate Secondary
          border: '#171717',
          yellow: '#38BDF8',     // Sky Blue
          pink: '#1E3A8A',       // Pure Deep Navy (No Pink!)
          green: '#0EA5E9',      // Cyan Blue
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
        'retro-blue': '4px 4px 0px #2563EB',
        'retro-sky': '4px 4px 0px #38BDF8',
        'retro-navy': '4px 4px 0px #1E3A8A',
        'retro-green': '4px 4px 0px #0EA5E9',
        'retro-pink': '4px 4px 0px #1E3A8A',
        'retro-yellow': '4px 4px 0px #38BDF8',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
