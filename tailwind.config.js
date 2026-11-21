// tailwind.config.js
//
// Enterprise-Grade Red Planet Tailwind Configuration (Tesla / Apple / SpaceX Scale)
// Founders: Deblaq & Win | Core Architecture & Engineering: Deblaq
// Full architectural token extension, custom glass panels, neon glows, scrollbar utilities,
// and multi-planetary styling rules supporting the entire Red Planet digital ecosystem.

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        marsRed: {
          DEFAULT: "#ff3300",
          glow: "#ff330088",
          dark: "#cc2900",
          bright: "#ff5533",
        },
        deepSpace: {
          DEFAULT: "#05050a",
          light: "#0f0f1a",
          card: "#0d0d16",
        },
        obsidian: {
          DEFAULT: "#0b0b14",
          surface: "#141422",
          border: "#1f1f33",
        },
        neonCyan: {
          DEFAULT: "#00f0ff",
          glow: "#00f0ff88",
        },
        nebulaPurple: {
          DEFAULT: "#8b5cf6",
          glow: "#8b5cf688",
        },
        solarFlare: {
          DEFAULT: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['var(--font-display)', 'var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-red': '0 0 25px rgba(255, 51, 0, 0.35)',
        'neon-red-lg': '0 0 50px rgba(255, 51, 0, 0.5)',
        'neon-cyan': '0 0 25px rgba(0, 240, 255, 0.35)',
        'neon-cyan-lg': '0 0 50px rgba(0, 240, 255, 0.5)',
        'card-hover': '0 20px 40px -15px rgba(255, 51, 0, 0.2)',
        'mars': '0 0 30px rgba(255, 51, 0, 0.35)',
        'cyan': '0 0 30px rgba(0, 240, 255, 0.35)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mars-glow': 'linear-gradient(180deg, rgba(255, 51, 0, 0.15) 0%, rgba(5, 5, 10, 0) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'gradient-mars': 'linear-gradient(135deg, #ff3300 0%, #ff5533 100%)',
        'gradient-violet': 'linear-gradient(135deg, #6a5cff 0%, #bf5af2 100%)',
        'gradient-sky': 'linear-gradient(135deg, #0a84ff 0%, #64d2ff 100%)',
        'gradient-amber': 'linear-gradient(135deg, #ff9f0a 0%, #ffd60a 100%)',
        'gradient-mint': 'linear-gradient(135deg, #30d158 0%, #66d4cf 100%)',
      },
      animation: {
        'spin-slow': 'spin 25s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'radar': 'radar 3s linear infinite',
        'radar-slow': 'radarSpin 12s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        radarSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 51, 0, 0.25)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 51, 0, 0.5)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.glass-panel': {
          background: 'rgba(13, 13, 22, 0.75)',
          backdropFilter: 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          border: '1px solid rgba(255, 51, 0, 0.15)',
          borderRadius: '16px',
        },
        '.glass-panel-strong': {
          background: 'rgba(11, 11, 20, 0.9)',
          backdropFilter: 'blur(24px)',
          '-webkit-backdrop-filter': 'blur(24px)',
          border: '1px solid rgba(255, 51, 0, 0.25)',
          borderRadius: '16px',
        },
        '.glass-panel-hover': {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.glass-panel-hover:hover': {
          background: 'rgba(20, 20, 34, 0.85)',
          borderColor: 'rgba(255, 51, 0, 0.4)',
          boxShadow: '0 0 30px rgba(255, 51, 0, 0.25)',
          transform: 'translateY(-2px)',
        },
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}