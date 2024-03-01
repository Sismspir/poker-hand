import { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '2xl': {'max': '0px'}
      },
      rotate: {
        '125': '125deg',
      },
      keyframes: {
        slideinX: {
          '50%': { opacity: '0.5', transform: 'translateX(0)' },
          '100%': { opacity: '0.5', transform: 'translateX(-400%)' },
        },
        slideinY: {
          '50%': { opacity: '0.5', transform: 'translateY(0)' },
          '100%': { opacity: '0.5', transform: 'translateY(-400%)' },
        },
        slideinFlop: {
          '50%': { opacity: '0.5', transform: 'translateY(0)' },
          '100%': { opacity: '0.5', transform: 'translateY(-200%)' },
        },
      },
      animation: {
        slideinX: 'slideinX 1s ease-in-out',
        slideinY: 'slideinY 1s ease-in-out',
        slideinFlop: 'slideinFlop 1s ease-in-out',
      },
    }
  },
  plugins: [],
};

export default config;
