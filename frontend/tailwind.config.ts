import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/nav-items/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
    },
    extend: {
      screens: {
        sm: '500px',
        md: '800px',
        lg: '1200px',
        xl: '1536px',
      },
      colors: {
        primary: '#9b775c',
        'primary-dark': '#7d5b41',
        secondary: '#7b5e49',
        tertiary: '#4b392d',
        border: '#4b392d',
        brand: {
          accent: '#7b5e49',
          main: '#9b775c',
          border: '#4b392d',
        },
        text: {
          primary: '#000000',
          secondary: '#ffffff',
        },
        background: {
          primary: '#ffffff',
        },
        foreground: {
          primary: '#000000',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
        mono: [...defaultTheme.fontFamily.mono],
        poppins: ['var(--font-poppins)'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
