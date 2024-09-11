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
    'background': '#FFFFFF',
    'primary': '#52526d',
    'secondary': '#E0E0E0',
    'accent': '#002244',
    'heading':'#000000',
    'joinbutton':'#87CEFA',
    'joinbutton2':'#002D62',
    'sender':'#f6fdf6',
    'senderhover':'#ecf6ec',
    'receiver':'#f7f7f7',
    'receiverhover':'#ececec'
     },
    extend: {},
  },

  plugins: [],
}
