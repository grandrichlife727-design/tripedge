/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TripEdge Design Tokens
        cream: {
          50: '#FDFBF7',   // page background
          100: '#F7F3EC',   // surface alt
          200: '#F0EBE1',   // surface / tab bg
          300: '#EDE8DD',   // borders
          400: '#D4C9B5',   // muted elements
        },
        earth: {
          600: '#A89E8C',   // muted text
          700: '#8C7E6A',   // secondary text
          800: '#5C5142',   // feature text
          900: '#2C2418',   // primary text
        },
        teal: {
          DEFAULT: '#2A9D8F', // primary accent
          light: '#E8F5EE',   // teal bg
          border: '#C5E8D4',  // teal border
        },
        ocean: {
          DEFAULT: '#1A6DAD', // secondary accent
          light: '#E6F2FA',
          border: '#C0DDF2',
        },
        success: {
          DEFAULT: '#1B7340',
          light: '#E8F5EE',
        },
        warning: {
          DEFAULT: '#D4600E',
          light: '#FEF0E7',
          border: '#FADCC8',
        },
        gold: {
          DEFAULT: '#8B6914',
          light: '#FFF8E6',
          muted: '#A67C00',
          border: '#FFF0BF',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Outfit"', '"Avenir Next"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '12px',
        badge: '20px',
        section: '28px',
      },
      boxShadow: {
        card: '0 8px 32px rgba(44, 36, 24, 0.08)',
        'card-hover': '0 12px 32px rgba(44, 36, 24, 0.10)',
        'card-elevated': '0 16px 40px rgba(44, 36, 24, 0.10)',
        button: '0 4px 16px rgba(42, 157, 143, 0.25)',
        'button-hover': '0 8px 28px rgba(42, 157, 143, 0.35)',
      },
      animation: {
        'fade-up': 'fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both',
        'slide-in': 'slideIn 0.4s ease both',
        'float': 'float 4s ease infinite',
        'shimmer': 'shimmer 1.8s ease infinite',
        'gradient-shift': 'gradientShift 12s ease infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-300% 0' },
          '100%': { backgroundPosition: '300% 0' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
};
