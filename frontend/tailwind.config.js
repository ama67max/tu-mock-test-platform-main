/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      // ── Metallic Silver & Surface Theme System ──────────────────────────────────
      colors: {
        // Metallic Silver Surface Palette
        'surface-dim': '#dadada',
        'surface-bright': '#f9f9f9',
        'surface-variant': '#e2e2e2',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f3f3',
        'surface-container': '#eeeeee',
        'surface-container-high': '#e8e8e8',
        'surface-container-highest': '#e2e2e2',
        'primary-container': '#1b1b1b',
        'tertiary-container': '#1b1b1b',
        'secondary-container': '#e0dfdf',
        'on-primary-container': '#848484',
        'on-tertiary-container': '#848484',
        'on-secondary-container': '#626363',
        'on-surface-variant': '#4c4546',
        'on-surface': '#1b1b1b',
        'on-background': '#1b1b1b',
        'outline-variant': '#cfc4c5',
        'outline': '#7e7576',
        'inverse-surface': '#303030',
        'inverse-primary': '#c6c6c6',
        'surface-tint': '#5e5e5e',
        'surface': '#f9f9f9',
        'background': '#f9f9f9',
        'tertiary': '#000000',
        'secondary': '#5e5e5f',
        'primary': '#000000',

        // Primary Black Scale
        black: {
          DEFAULT: '#000000',
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#1a1a1a',
          850: '#141414',
          900: '#0a0a0a',
          950: '#000000',
        },
        // Secondary Silver Scale
        silver: {
          DEFAULT: '#C0C0C0',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#C0C0C0',
          500: '#A8A8A8',
          600: '#808080',
          700: '#6B6B6B',
          800: '#505050',
          900: '#3A3A3A',
        },
        // Accent White Scale
        white: {
          DEFAULT: '#FFFFFF',
          50: '#FFFFFF',
          100: '#FEFEFE',
          200: '#FCFCFC',
          300: '#FAFAFA',
          400: '#F8F8F8',
          500: '#F5F5F5',
        },
        // Status Colors
        success: {
          50: '#ecfdf3',
          100: '#d1fadf',
          500: '#12b76a',
          600: '#039855',
          700: '#027a48',
        },
        warning: {
          50: '#fffaeb',
          100: '#fef0c7',
          500: '#f79009',
          600: '#dc6803',
          700: '#b54708',
        },
        danger: {
          50: '#fef3f2',
          100: '#fee4e2',
          500: '#f04438',
          600: '#d92d20',
          700: '#b42318',
        },
      },
      // ── Typography System ──────────────────────────────────────────────────
      fontSize: {
        'body': ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'subheading': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        'heading': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        'display': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
      },
      // ── Font Family (Work Sans & Inter) ───────────────────────────────────
      fontFamily: {
        sans: ['"Work Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        headline: ['"Work Sans"', 'sans-serif'],
      },

      // ── Animations & Keyframes ─────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(192, 192, 192, 0.35)' },
          '70%': { boxShadow: '0 0 0 10px rgba(192, 192, 192, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(192, 192, 192, 0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      // ── Box Shadow (Depth & Elevation) ─────────────────────────────────────
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.8)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.8), 0 2px 4px -1px rgba(0, 0, 0, 0.6)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.8), 0 4px 6px -2px rgba(0, 0, 0, 0.6)',
        'silver-glow': '0 0 20px rgba(192, 192, 192, 0.3)',
        'white-glow': '0 0 30px rgba(255, 255, 255, 0.2)',
      },
      // ── Border Radius (Consistent UI) ──────────────────────────────────────
      borderRadius: {
        'DEFAULT': '8px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
    },
  },
  plugins: [],
};