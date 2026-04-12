/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#e6f7fa',
          DEFAULT: '#00a8cc',
          dark: '#008ba8',
        },
        secondary: {
          light: '#f5f5f0',
          DEFAULT: '#a08b7d',
          dark: '#7c6a5e',
        },
        accent: {
          light: '#c6e2ff',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        pastel: {
          pink: '#ffd1e8',
          blue: '#d4f2fa',
          purple: '#e5dbff',
          orange: '#ffeacc',
          green: '#d1fae5',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.4)',
          DEFAULT: 'rgba(255, 255, 255, 0.65)',
          dark: 'rgba(255, 255, 255, 0.85)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        '5xl': '0 35px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.1)',
        '4xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
