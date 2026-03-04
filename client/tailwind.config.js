/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          50: '#EBF0F5',
          100: '#D7E1EB',
          200: '#AFC3D7',
          300: '#87A5C3',
          400: '#5F87AF',
          500: '#1E3A5F',
          600: '#1B3456',
          700: '#162B47',
          800: '#112238',
          900: '#0C1929',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
