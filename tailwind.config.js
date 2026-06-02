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
        "eldora-bg": "#FAF7F2",
        "eldora-surface": "#FFFFFF",
        "eldora-coral": "#D95545",
        "eldora-coral-light": "#FFE7E2",
        "eldora-peach": "#FFD4C2",
        "eldora-mint": "#A8D8C2",
        "eldora-text": "#17202A",
        "eldora-text-muted": "#5F6B7A",
        "eldora-line": "#E7E1DA",
        "alert-critical": "#E53E3E",
        "alert-high": "#ED8936",
        "alert-medium": "#D69E2E",
        "alert-low": "#38A169",
      },
    },
  },
  plugins: [],
};
