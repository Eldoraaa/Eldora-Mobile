/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "eldora-base": "#FDF8F5",
        "eldora-surface": "#FFFFFF",
        "eldora-coral": "#FF8A7A",
        "eldora-coral-light": "#FFE8E5",
        "eldora-blue": "#7BA7D4",
        "eldora-blue-light": "#E8F2FB",
        "eldora-peach": "#FFD4C2",
        "eldora-mint": "#A8D8C2",
        "eldora-text": "#2D2D2D",
        "eldora-text-muted": "#8A8A8A",
        "alert-critical": "#E53E3E",
        "alert-high": "#ED8936",
        "alert-medium": "#D69E2E",
        "alert-low": "#38A169",
      },
    },
  },
  plugins: [],
};
