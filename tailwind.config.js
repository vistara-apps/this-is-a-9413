/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220, 20%, 98%)',
        accent: 'hsl(160, 70%, 45%)',
        primary: 'hsl(220, 80%, 50%)',
        surface: 'hsl(0, 0%, 100%)',
      },
      borderRadius: {
        'lg-custom': '16px',
        'md-custom': '10px',
        'sm-custom': '6px',
      },
      spacing: {
        'lg-custom': '20px',
        'md-custom': '12px',
        'sm-custom': '8px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(0, 0%, 0%, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-fast': 'fadeIn 100ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}