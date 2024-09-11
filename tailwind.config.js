/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
    'text': '#0d080b',
    'text2':'#FFFFFF',
    'background': '#faf6f8',
    'primary': '#002244',
    'secondary': '#E0E0E0',
    'accent': '#002244',
    'heading':'#000000',
    'joinbutton':'#87CEFA',
    'joinbutton2':'#002D62',
    'sender':'#F0F0F0',
    'senderhover':'#A9A9A9',
    'receiver':'#E0E0E0',
    'receiverhover':'#BEBEBE'
     },
    extend: {},
  },

  plugins: [],
}
