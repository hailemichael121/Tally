/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: "#0f0f0f",
        mist: "#f7f4ef",
        blush: "#f2d6d3",
        cocoa: "#5a3f32",
        cloud: "rgba(255, 255, 255, 0.62)",
        glass: "rgba(255, 255, 255, 0.12)"
      },
      boxShadow: {
        soft: "0 20px 50px rgba(0, 0, 0, 0.18)",
        floaty: "0 12px 30px rgba(25, 15, 8, 0.18)"
      },
      borderRadius: {
        xl: "1.5rem",
        '2xl': "2rem"
      },
      backdropBlur: {
        xs: "6px"
      }
    }
  },
  plugins: []
};
