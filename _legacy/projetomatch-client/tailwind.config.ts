import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Certifique-se de que o Tailwind escaneia seus arquivos
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8', // Example custom color
        secondary: '#9333EA',
      },
      fontFamily: {
        inria: ['"Inria Sans"', 'sans-serif'], // Adiciona a fonte personalizada
      },
    },
  },
  plugins: [],
};

export default config;