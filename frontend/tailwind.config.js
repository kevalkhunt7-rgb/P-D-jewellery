/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'fade-in-out': {
          '0%, 100%': { opacity: '0', transform: 'scale(0.95)' },
          '15%, 85%': { opacity: '1', transform: 'scale(1)' },
        },
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in-out': 'fade-in-out 1.5s ease-in-out infinite',
        'loading-bar': 'loading-bar 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
};