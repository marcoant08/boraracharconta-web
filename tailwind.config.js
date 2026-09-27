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
        paper: 'oklch(0.975 0.010 95 / <alpha-value>)',
        ink: 'oklch(0.24 0.028 168 / <alpha-value>)',
        primary: {
          50: 'oklch(0.965 0.020 155 / <alpha-value>)',
          100: 'oklch(0.935 0.035 155 / <alpha-value>)',
          200: 'oklch(0.875 0.055 155 / <alpha-value>)',
          300: 'oklch(0.78 0.08 155 / <alpha-value>)',
          400: 'oklch(0.64 0.10 156 / <alpha-value>)',
          500: 'oklch(0.48 0.11 158 / <alpha-value>)',
          600: 'oklch(0.42 0.10 160 / <alpha-value>)',
          700: 'oklch(0.36 0.09 162 / <alpha-value>)',
          800: 'oklch(0.30 0.075 165 / <alpha-value>)',
          900: 'oklch(0.24 0.055 168 / <alpha-value>)',
        },
        gray: {
          50: 'oklch(0.975 0.010 95 / <alpha-value>)',
          100: 'oklch(0.955 0.014 95 / <alpha-value>)',
          200: 'oklch(0.905 0.016 90 / <alpha-value>)',
          300: 'oklch(0.835 0.020 85 / <alpha-value>)',
          400: 'oklch(0.62 0.022 155 / <alpha-value>)',
          500: 'oklch(0.48 0.028 160 / <alpha-value>)',
          600: 'oklch(0.42 0.030 162 / <alpha-value>)',
          700: 'oklch(0.36 0.028 165 / <alpha-value>)',
          800: 'oklch(0.30 0.025 165 / <alpha-value>)',
          900: 'oklch(0.24 0.028 168 / <alpha-value>)',
          950: 'oklch(0.18 0.022 170 / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 1px oklch(0.28 0.03 165 / 0.05), 0 10px 24px -12px oklch(0.28 0.03 165 / 0.16)',
        lift: '0 1px 2px oklch(0.22 0.04 160 / 0.30)',
      },
    },
  },
  plugins: [],
};
