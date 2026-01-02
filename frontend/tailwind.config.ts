import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ===========================================
      // COLORS DEL DESIGN SYSTEM
      // ===========================================
      colors: {
        // Colors primaris - La Pública
        primary: {
          DEFAULT: 'var(--color-primary, #1E3A5F)',
          light: 'var(--color-primary-light, #2E5A8F)',
          dark: 'var(--color-primary-dark, #0E2A4F)',
          50: 'var(--color-primary-50, #EEF4FA)',
          100: 'var(--color-primary-100, #D4E4F4)',
          500: 'var(--color-primary-500, #1E3A5F)',
          600: 'var(--color-primary-600, #183250)',
          700: 'var(--color-primary-700, #122A42)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, #2E7D32)',
          light: 'var(--color-secondary-light, #4CAF50)',
          dark: 'var(--color-secondary-dark, #1B5E20)',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #FF6B35)',
          light: 'var(--color-accent-light, #FF8A5B)',
          dark: 'var(--color-accent-dark, #E55A24)',
        },

        // Colors semàntics
        success: {
          DEFAULT: 'var(--color-success, #10B981)',
          light: 'var(--color-success-light, #34D399)',
          dark: 'var(--color-success-dark, #059669)',
        },
        warning: {
          DEFAULT: 'var(--color-warning, #F59E0B)',
          light: 'var(--color-warning-light, #FBBF24)',
          dark: 'var(--color-warning-dark, #D97706)',
        },
        error: {
          DEFAULT: 'var(--color-error, #EF4444)',
          light: 'var(--color-error-light, #F87171)',
          dark: 'var(--color-error-dark, #DC2626)',
        },
        info: {
          DEFAULT: 'var(--color-info, #3B82F6)',
          light: 'var(--color-info-light, #60A5FA)',
          dark: 'var(--color-info-dark, #2563EB)',
        },

        // Colors de superfície
        background: 'var(--color-background, #FFFFFF)',
        'background-alt': 'var(--color-background-alt, #F8FAFC)',
        surface: 'var(--color-surface, #FFFFFF)',
        overlay: 'var(--color-overlay, rgba(0, 0, 0, 0.5))',

        // Colors de text
        foreground: 'var(--color-text-primary, #0F172A)',
        'text-primary': 'var(--color-text-primary, #0F172A)',
        'text-secondary': 'var(--color-text-secondary, #475569)',
        'text-muted': 'var(--color-text-muted, #94A3B8)',
        'text-inverse': 'var(--color-text-inverse, #FFFFFF)',

        // Colors de border
        border: 'var(--color-border, #E2E8F0)',
        'border-light': 'var(--color-border-light, #F1F5F9)',
        'border-dark': 'var(--color-border-dark, #CBD5E1)',

        // Colors neutrals (slate)
        slate: {
          50: 'var(--color-slate-50, #F8FAFC)',
          100: 'var(--color-slate-100, #F1F5F9)',
          200: 'var(--color-slate-200, #E2E8F0)',
          300: 'var(--color-slate-300, #CBD5E1)',
          400: 'var(--color-slate-400, #94A3B8)',
          500: 'var(--color-slate-500, #64748B)',
          600: 'var(--color-slate-600, #475569)',
          700: 'var(--color-slate-700, #334155)',
          800: 'var(--color-slate-800, #1E293B)',
          900: 'var(--color-slate-900, #0F172A)',
        },

        // Colors per components específics
        card: {
          DEFAULT: 'var(--card-background, #FFFFFF)',
          foreground: 'var(--card-title-color, #111827)',
          border: 'var(--card-border-color, #E2E8F0)',
        },
        input: {
          DEFAULT: 'var(--Input-background, #FFFFFF)',
          border: 'var(--Input-border-color, #E2E8F0)',
          focus: 'var(--Input-focus-border, #3B82F6)',
        },
        button: {
          primary: 'var(--Button-primary-background, #1E3A5F)',
          'primary-hover': 'var(--Button-primary-hover, #2E5A8F)',
          secondary: 'var(--Button-secondary-background, #F1F5F9)',
          'secondary-hover': 'var(--Button-secondary-hover, #E2E8F0)',
        },
      },

      // ===========================================
      // BORDER RADIUS DEL DESIGN SYSTEM
      // ===========================================
      borderRadius: {
        none: 'var(--radius-none, 0)',
        sm: 'var(--radius-sm, 0.125rem)',
        DEFAULT: 'var(--radius, 0.25rem)',
        md: 'var(--radius-md, 0.375rem)',
        lg: 'var(--radius-lg, 0.5rem)',
        xl: 'var(--radius-xl, 0.75rem)',
        '2xl': 'var(--radius-2xl, 1rem)',
        '3xl': 'var(--radius-3xl, 1.5rem)',
        full: 'var(--radius-full, 9999px)',
        // Radius específics per components
        card: 'var(--card-border-radius, 0.75rem)',
        button: 'var(--Button-border-radius, 0.375rem)',
        input: 'var(--Input-border-radius, 0.375rem)',
      },

      // ===========================================
      // BOX SHADOW DEL DESIGN SYSTEM
      // ===========================================
      boxShadow: {
        none: 'none',
        sm: 'var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))',
        DEFAULT: 'var(--shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1))',
        md: 'var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1))',
        lg: 'var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1))',
        xl: 'var(--shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1))',
        '2xl': 'var(--shadow-2xl, 0 25px 50px -12px rgb(0 0 0 / 0.25))',
        inner: 'var(--shadow-inner, inset 0 2px 4px 0 rgb(0 0 0 / 0.05))',
        // Shadows específics per components
        card: 'var(--card-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1))',
        'card-hover': 'var(--card-shadow-hover, 0 10px 15px -3px rgb(0 0 0 / 0.1))',
      },

      // ===========================================
      // SPACING DEL DESIGN SYSTEM
      // ===========================================
      spacing: {
        '0': 'var(--spacing-0, 0)',
        '1': 'var(--spacing-1, 0.25rem)',
        '2': 'var(--spacing-2, 0.5rem)',
        '3': 'var(--spacing-3, 0.75rem)',
        '4': 'var(--spacing-4, 1rem)',
        '5': 'var(--spacing-5, 1.25rem)',
        '6': 'var(--spacing-6, 1.5rem)',
        '8': 'var(--spacing-8, 2rem)',
        '10': 'var(--spacing-10, 2.5rem)',
        '12': 'var(--spacing-12, 3rem)',
        '16': 'var(--spacing-16, 4rem)',
        '20': 'var(--spacing-20, 5rem)',
        '24': 'var(--spacing-24, 6rem)',
        // Spacing per components
        'card-padding': 'var(--card-content-padding, 1.5rem)',
        'sidebar': 'var(--sidebar-width, 280px)',
        'sidebar-collapsed': 'var(--sidebar-collapsed-width, 64px)',
        'header': 'var(--header-height, 64px)',
      },

      // ===========================================
      // FONTS DEL DESIGN SYSTEM
      // ===========================================
      fontFamily: {
        sans: ['var(--font-sans, Inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono, JetBrains Mono)', 'monospace'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        handwriting: ['Dynalight', 'cursive'],
      },

      fontSize: {
        xs: ['var(--font-size-xs, 0.75rem)', { lineHeight: '1rem' }],
        sm: ['var(--font-size-sm, 0.875rem)', { lineHeight: '1.25rem' }],
        base: ['var(--font-size-base, 1rem)', { lineHeight: '1.5rem' }],
        lg: ['var(--font-size-lg, 1.125rem)', { lineHeight: '1.75rem' }],
        xl: ['var(--font-size-xl, 1.25rem)', { lineHeight: '1.75rem' }],
        '2xl': ['var(--font-size-2xl, 1.5rem)', { lineHeight: '2rem' }],
        '3xl': ['var(--font-size-3xl, 1.875rem)', { lineHeight: '2.25rem' }],
        '4xl': ['var(--font-size-4xl, 2.25rem)', { lineHeight: '2.5rem' }],
      },

      // ===========================================
      // TRANSITIONS DEL DESIGN SYSTEM
      // ===========================================
      transitionDuration: {
        fast: 'var(--transition-fast, 150ms)',
        DEFAULT: 'var(--transition-default, 200ms)',
        slow: 'var(--transition-slow, 300ms)',
      },

      // ===========================================
      // LAYOUT DEL DESIGN SYSTEM
      // ===========================================
      maxWidth: {
        container: 'var(--container-max-width, 1280px)',
      },

      // ===========================================
      // Z-INDEX ESTÀNDAR
      // ===========================================
      zIndex: {
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        'modal-backdrop': '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070',
      },
    },
  },
  plugins: [],
};

export default config;
