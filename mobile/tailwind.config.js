/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0A',
        'bg-secondary': '#141414',
        'bg-surface': '#1C1C1C',
        'accent-blue': '#00D4FF',
        'accent-gold': '#C9A84C',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'text-muted': '#555555',
        success: '#00E676',
        warning: '#FFB300',
        error: '#FF1744',
      },
    },
  },
  plugins: [],
};
