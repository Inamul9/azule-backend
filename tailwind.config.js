/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./views/*.ejs",
    "./views/admin/**/*.ejs",
    "./views/partials/**/*.ejs",
    "./public/**/*.js",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          deep: '#07160c',   // Near black forest green
          dark: '#0d2818',   // Rich deep forest green
          medium: '#1b4332', // Medium forest green
          light: '#2d6a4f',  // Accent forest green
          emerald: '#40916c' // Bright forest accent
        },
        gold: {
          light: '#f3e5ab',  // Pale soft gold
          DEFAULT: '#c5a880',// Premium warm gold
          warm: '#b89c72',   // Deeper luxurious gold
          dark: '#967b54',   // Aged gold accent
          glow: '#ffd700'    // Bright glowing gold
        },
        sunset: {
          orange: '#e65f2b', // Warm sunset orange
          yellow: '#f4a261', // Soft sunset yellow
          glow: '#ff9f1c'    // Bright fire campfire glow
        },
        cream: {
          light: '#fdfbf7',  // Soft white
          DEFAULT: '#f5f0e6',// Warm paper cream (from itinerary poster)
          dark: '#eadeca'    // Darker cream card background
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Outfit"', 'sans-serif'],
        cinzel: ['"Cinzel"', 'serif'],
        cursive: ['"Playball"', '"Great Vibes"', 'cursive']
      },
      animation: {
        'campfire-glow': 'campfire 3s infinite alternate',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        campfire: {
          '0%': { transform: 'scale(1)', opacity: '0.6', filter: 'blur(40px)' },
          '100%': { transform: 'scale(1.25)', opacity: '0.9', filter: 'blur(60px)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' }
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(13, 40, 24, 0.37)',
        'glass-gold': '0 8px 32px 0 rgba(197, 168, 128, 0.15)',
        'gold-glow': '0 0 20px rgba(197, 168, 128, 0.4)',
        'fire-glow': '0 0 35px rgba(230, 95, 43, 0.5)'
      }
    },
  },
  plugins: [],
}
