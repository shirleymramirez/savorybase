/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mist: {
          50: "#f7f7f5",
          100: "#efefec",
          200: "#dfdfda",
          300: "#c8c8c2",
          400: "#a8a8a1",
          500: "#8a8a82",
          600: "#6b6b65",
          700: "#565650",
          800: "#454540",
          900: "#383833"
        }
      },
      boxShadow: {
        soft: "0 20px 45px -28px rgba(43, 45, 38, 0.3)"
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "sans-serif"],
        serif: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "serif"]
      }
    }
  },
  plugins: []
};
