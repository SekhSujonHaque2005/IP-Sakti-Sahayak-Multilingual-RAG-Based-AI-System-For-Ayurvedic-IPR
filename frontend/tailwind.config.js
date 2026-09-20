/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Lora', 'Georgia', 'serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        forest: {
          DEFAULT: '#283D34',
          50: '#F2F6F4',
          100: '#E1ECE6',
          200: '#BDD6CA',
          300: '#8EBAA5',
          700: '#283D34',
          800: '#1F3029',
          900: '#15211C',
        },
        terracotta: {
          DEFAULT: '#924E2B',
          50: '#FDF7F3',
          100: '#F7ECE3',
          200: '#ECD3C1',
          300: '#DBB094',
          400: '#B86B35',
          500: '#924E2B',
          600: '#7E3E1E',
          700: '#643015',
        },
        sage: {
          DEFAULT: '#A29D7D',
          50: '#F7F6F2',
          100: '#EDEBE2',
          200: '#DCD8C5',
          300: '#C5C0A4',
          400: '#A29D7D',
          500: '#8A8565',
          600: '#6E694E',
        },
        greige: {
          DEFAULT: '#D4CEC1',
          light: '#E6E1D7',
          dark: '#B8B1A2',
        },
        cream: {
          DEFAULT: '#EDE4D3',
          light: '#F5EFE3',
          dark: '#DECDB5',
        },
        'off-white': '#FAF7F2',
        'forest-black': '#1A2622',
        'forest-muted': '#5C645E',
        'ayush-success': '#2E4A3E',
        'ayush-warning': '#B86B35',
        'ayush-danger': '#9E3B33',
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(40, 61, 52, 0.05), 0 1px 2px rgba(40, 61, 52, 0.03)',
        'warm-md': '0 4px 16px -2px rgba(40, 61, 52, 0.06), 0 2px 6px -1px rgba(40, 61, 52, 0.03)',
        'warm-lg': '0 12px 32px -4px rgba(40, 61, 52, 0.08), 0 4px 12px -2px rgba(40, 61, 52, 0.04)',
        'warm-xl': '0 20px 48px -6px rgba(40, 61, 52, 0.10)',
        'warm-inner': 'inset 0 1px 2px rgba(40, 61, 52, 0.06)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}

