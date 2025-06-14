/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D97706',    // Sunset Orange
        secondary: '#FBBF24',  // Sand Gold
        accent: '#0EA5E9',     // Ocean Teal
        neutral: '#F3F4F6',    // Seafoam
        success: '#047857',    // Palm Leaf
      },
      fontFamily: {
        'pacifico': ['Pacifico', 'cursive'],
        'roboto': ['Roboto', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 