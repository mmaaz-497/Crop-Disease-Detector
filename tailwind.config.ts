import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-accent',
    'bg-amber-500',
    'bg-red-500',
    'text-white',
    'border-accent',
    'border-amber-500',
    'border-red-500',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B4332',
        accent: '#74C69D',
        base: {
          DEFAULT: '#F0FFF4',
        },
      },
      fontFamily: {
        urdu: ['Noto Naskh Arabic', 'serif'],
        sans: ['Inter', 'Noto Naskh Arabic', 'sans-serif'],
      },
      minHeight: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};

export default config;
