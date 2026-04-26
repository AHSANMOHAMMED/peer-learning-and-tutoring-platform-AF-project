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
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        // Premium Professional Color Palette
        aura: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Sophisticated Neutrals
        slate: {
          50: '#f8f9fc',
          100: '#f1f3f5',
          200: '#e2e6ea',
          300: '#c1c7d0',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#25262b',
          900: '#1f222a',
          950: '#0f172a',
        },
        // Accent Colors for Data Visualization
        accent: {
          blue: {
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
          },
          emerald: {
            500: '#10b981',
            600: '#059669',
            700: '#047857',
          },
          amber: {
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
          },
          rose: {
            500: '#f43f5e',
            600: '#e11d48',
            700: '#be123c',
          },
          violet: {
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
          },
        },
        // Premium Glass Effects
        glass: {
          light: 'rgba(255, 255, 255, 0.4)',
          DEFAULT: 'rgba(255, 255, 255, 0.65)',
          dark: 'rgba(255, 255, 255, 0.85)',
        },
        // Extended pastel palette for dashboard cards
        pastel: {
          pink: '#ffd1e8',
          blue: '#d4f2fa',
          purple: '#e5dbff',
          orange: '#ffeacc',
          green: '#d1fae5',
          yellow: '#fef3c7',
          indigo: '#e0e7ff',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'float-slow': 'float 8s ease-in-out infinite',
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
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        '5xl': '0 35px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.1)',
        '4xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '3xl': '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
        '2xl': '0 15px 30px -8px rgba(0, 0, 0, 0.3)',
        'xl': '0 10px 20px -6px rgba(0, 0, 0, 0.2)',
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0, 0, 0, 0.08)',
        'elevated': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xs': '0.125rem',
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
        '5xl': '1.75rem',
        '6xl': '2.25rem',
        '7xl': '2.75rem',
        '8xl': '3.5rem',
        '9xl': '4.5rem',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      zIndex: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'auto': 'auto',
        'modal': '1000',
        'popover': '1100',
        'tooltip': '1200',
      }
    },
  },
  plugins: [
    function({addUtilities}) {
      const newUtilities = {
        '.text-shadow-sm': {
          textShadow: '0 1px 2px var(--tw-shadow-color)',
        },
        '.text-shadow': {
          textShadow: '0 2px 4px var(--tw-shadow-color)',
        },
        '.text-shadow-lg': {
          textShadow: '0 8px 16px var(--tw-shadow-color)',
        },
        '.outline-none-important': {
          outline: 'none !important',
        },
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '4px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: '100px',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
  darkMode: 'class',
}
