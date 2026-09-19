/**
 * Paleta AudioColors.
 *
 * `brand` (azul de la R del logo) es el UNICO color de acento: acciones,
 * estado activo y foco. `ink` es una escala de grises NEUTROS — sin tinte
 * azul, para no competir con los colores del logo.
 * Regla del proyecto: los colores se consumen SIEMPRE por token (bg-brand,
 * text-ink-700...), nunca como arbitrary value hex en el JSX. Zynka acabo con
 * dos paletas rivales y ~60 hex sueltos justamente por saltarse esto.
 */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    /**
     * Breakpoints propios (no los de Tailwind por defecto). Se usa
     * principalmente en iPhone (mobile) y desktop/laptop web.
     * `lg` queda debajo del estandar (1024px) a proposito: si algun dia se
     * usa en una tablet, el layout de escritorio entra antes de que se vea
     * apretado. Referencia: magastore-backoffice.
     */
    screens: {
      xs: '390px',
      sm: '640px',
      md: '768px',
      lg: '924px',
      xl: '1280px',
    },
    extend: {
      colors: {
        brand: {
          50: '#e9f3fb',
          100: '#d4e7f7',
          200: '#a8cff0',
          300: '#74b3e7',
          400: '#3b94dd',
          DEFAULT: '#1f6fb1',
          500: '#1f6fb1',
          600: '#18578b',
          700: '#124168',
          800: '#0c2c46',
          900: '#071927',
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
        /** Azul oscuro de marca: fondo de la variante dark del logo (BRAND.md). */
        midnight: '#181d37',
        /** Morado de la S del logo: marca visual del entorno de desarrollo (BRAND.md). */
        'dev-accent': '#613f90',
      },
      fontFamily: {
        sans: ['Fira Sans', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
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
