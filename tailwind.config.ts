import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: { DEFAULT: '#10b981', dark: '#047857', soft: 'rgba(16,185,129,0.12)' },
        ink: {
          DEFAULT: '#f5f5f5',
          muted: '#a3a3a3',
          dim:   '#6b6b6b'
        },
        surface: {
          base: '#0a0a0a',
          1:    '#121212',
          2:    '#181818',
          3:    '#1f1f1f'
        },
        line: { DEFAULT: '#232323', soft: '#1c1c1c' }
      },
      boxShadow: {
        soft: '0 8px 24px -10px rgba(0,0,0,0.6)',
        glow: '0 8px 24px -10px rgba(16,185,129,0.45)'
      }
    }
  },
  plugins: []
};
export default config;
