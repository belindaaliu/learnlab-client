/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. TYPOGRAPHY SYSTEM
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Main project font
      },
      
      // 2. COLOR PALETTE (Royal Tech Theme)
      colors: {
        primary: {
          DEFAULT: '#6366f1', // Indigo-500 (Brand primary color)
          hover: '#4f46e5',   // Indigo-600 (Hover state)
          light: '#e0e7ff',   // Indigo-100 (Light background for cards/badges)
        },
        secondary: {
          DEFAULT: '#0ea5e9', // Sky-500 (Secondary actions/icons)
          hover: '#0284c7',
        },
        accent: {
          DEFAULT: '#f59e0b', // Amber-500 (Call-to-Action buttons)
          hover: '#d97706',
        },
        
        // Background Colors
        background: '#f8fafc', // Slate-50 (Page background - soft white)
        surface: '#ffffff',    // White (Card background)
        
        // Text Colors
        textMain: '#0f172a',   // Slate-900 (Main text color)
        textMuted: '#64748b',  // Slate-500 (Secondary/Muted text)
      },
      
      // 3. SHADOWS
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)', // Soft shadow for cards
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)',    // Purple glow effect
      }
    },
  },
  plugins: [],
}