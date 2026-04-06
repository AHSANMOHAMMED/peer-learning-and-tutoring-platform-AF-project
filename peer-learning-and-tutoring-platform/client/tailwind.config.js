/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef4ff',
          100: '#d8e4ff',
          200: '#b6cdff',
          300: '#86a8ff',
          400: '#5e84ff',
          500: '#3f65e6',
          600: '#334eb5',
          700: '#293d8a',
          800: '#223165',
          900: '#1c284d',
          950: '#111827',
        },
        secondary: {
          50: '#e8f0ff',
          100: '#cddcff',
          200: '#a7c1ff',
          300: '#7f9dff',
          400: '#5a7bff',
          500: '#3f58e0',
          600: '#3347b7',
          700: '#29368d',
          800: '#222e6d',
          900: '#1a2553',
        },
        // Role-specific theme colors
        student: {
          light: '#7da6ff',
          DEFAULT: '#5a7bff',
          dark: '#354db2',
          gradient: 'from-sky-500 to-indigo-600',
        },
        tutor: {
          light: '#82b6ff',
          DEFAULT: '#4f7ae6',
          dark: '#314fa7',
          gradient: 'from-blue-500 to-slate-700',
        },
        admin: {
          light: '#d6e3ff',
          DEFAULT: '#a6b8ff',
          dark: '#6d7ef0',
          gradient: 'from-slate-700 to-slate-900',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
      },
    },
  },
  plugins: [],
}
