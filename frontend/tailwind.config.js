/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../src/**/*.{js,ts,jsx,tsx}",   // Scans parent if running from a nested subfolder
    "./src/pages/**/*.{js,ts,jsx,tsx}" // Direct targeting path for your views
  ],
  theme: {
    extend: {
      colors: {
        hiveBg: '#003135',      // Syncing with your preferred 5-color palette image
        hiveSurface: '#024950', 
        hiveAccent: '#964734',   
        hiveCyan: '#0FA4AF',    
        hiveLime: '#AFDDE5',    
      }
    },
  },
  plugins: [],
}