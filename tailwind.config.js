/**
 * Paleta AudioColors.
 *
 * `brand` (verde del logo) es el UNICO color de acento: acciones, estado
 * activo y foco. `ink` es una escala de grises NEUTROS — sin tinte azul, para
 * no competir con los colores del logo.
 * Regla del proyecto: los colores se consumen SIEMPRE por token (bg-brand,
 * text-ink-700...), nunca como arbitrary value hex en el JSX. Zynka acabo con
 * dos paletas rivales y ~60 hex sueltos justamente por saltarse esto.
 */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4faef',
          100: '#e3f3d8',
          200: '#c7e7b1',
          300: '#a5d882',
          400: '#83ca54',
          DEFAULT: '#66ae36',
          500: '#66ae36',
          600: '#54902d',
          700: '#447524',
          800: '#39611e',
          900: '#2e4e18',
        },
        ink: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          DEFAULT: '#27272a',
          800: '#27272a',
          900: '#18181b',
        },
        success: '#0d9488',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
