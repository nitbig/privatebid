// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        "black": "#0A0A0A",
        "dark-grey": "#1F1F1F",
        "grey": "#3A3A3A",
        "light-grey": "#E5E5E5",
        "white": "#FFFFFF",
        "primary": "#0D47A1",
        "secondary": "#1565C0",
        "accent": "#FF5722"
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

