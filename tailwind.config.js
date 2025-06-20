/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#1E3A5F', // Deep navy (primary) - slate-800
        'primary-50': '#F8FAFC', // Very light navy - slate-50
        'primary-100': '#F1F5F9', // Light navy - slate-100
        'primary-200': '#E2E8F0', // Medium light navy - slate-200
        'primary-500': '#64748B', // Medium navy - slate-500
        'primary-600': '#475569', // Dark medium navy - slate-600
        'primary-700': '#334155', // Darker navy - slate-700
        'primary-900': '#0F172A', // Very dark navy - slate-900

        // Secondary Colors
        'secondary': '#2563EB', // Vibrant blue (secondary) - blue-600
        'secondary-50': '#EFF6FF', // Very light blue - blue-50
        'secondary-100': '#DBEAFE', // Light blue - blue-100
        'secondary-200': '#BFDBFE', // Medium light blue - blue-200
        'secondary-500': '#3B82F6', // Medium blue - blue-500
        'secondary-700': '#1D4ED8', // Dark blue - blue-700
        'secondary-800': '#1E40AF', // Darker blue - blue-800
        'secondary-900': '#1E3A8A', // Very dark blue - blue-900

        // Accent Colors
        'accent': '#F59E0B', // Strategic amber (accent) - amber-500
        'accent-50': '#FFFBEB', // Very light amber - amber-50
        'accent-100': '#FEF3C7', // Light amber - amber-100
        'accent-200': '#FDE68A', // Medium light amber - amber-200
        'accent-400': '#FBBF24', // Medium amber - amber-400
        'accent-600': '#D97706', // Dark amber - amber-600
        'accent-700': '#B45309', // Darker amber - amber-700
        'accent-800': '#92400E', // Very dark amber - amber-800

        // Background Colors
        'background': '#F8FAFC', // Soft neutral background - slate-50
        'surface': '#FFFFFF', // Pure white surface - white
        'surface-secondary': '#F1F5F9', // Secondary surface - slate-100

        // Text Colors
        'text-primary': '#1F2937', // Rich charcoal primary text - gray-800
        'text-secondary': '#6B7280', // Balanced gray secondary text - gray-500
        'text-tertiary': '#9CA3AF', // Light gray tertiary text - gray-400
        'text-inverse': '#FFFFFF', // White text for dark backgrounds - white

        // Status Colors
        'success': '#10B981', // Confident green success - emerald-500
        'success-50': '#ECFDF5', // Very light green - emerald-50
        'success-100': '#D1FAE5', // Light green - emerald-100
        'success-600': '#059669', // Dark green - emerald-600
        'success-700': '#047857', // Darker green - emerald-700

        'warning': '#F59E0B', // Consistent amber warning - amber-500
        'warning-50': '#FFFBEB', // Very light amber - amber-50
        'warning-100': '#FEF3C7', // Light amber - amber-100
        'warning-600': '#D97706', // Dark amber - amber-600
        'warning-700': '#B45309', // Darker amber - amber-700

        'error': '#EF4444', // Clear red error - red-500
        'error-50': '#FEF2F2', // Very light red - red-50
        'error-100': '#FEE2E2', // Light red - red-100
        'error-600': '#DC2626', // Dark red - red-600
        'error-700': '#B91C1C', // Darker red - red-700

        // Border Colors
        'border': '#E5E7EB', // Minimal border color - gray-200
        'border-light': '#F3F4F6', // Light border - gray-100
        'border-dark': '#D1D5DB', // Dark border - gray-300
      },
      fontFamily: {
        'heading': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'body': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'caption': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'data': ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        'sm': '4px',
        'base': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'elevation-1': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevation-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevation-3': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elevation-4': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      transitionDuration: {
        '150': '150ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '900': '900',
        '1000': '1000',
        '1100': '1100',
        '1200': '1200',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-down': 'slideDown 300ms ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}