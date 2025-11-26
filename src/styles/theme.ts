/**
 * Design System Apple-like
 * Palette colori minimalista, tipografia pulita, spaziatura generosa
 */

export const theme = {
  // Colori Light Mode
  colors: {
    light: {
      bg: {
        primary: '#FFFFFF',
        secondary: '#F5F5F7',
        tertiary: '#E8E8ED',
        elevated: '#FFFFFF',
      },
      text: {
        primary: '#1D1D1F',
        secondary: '#6E6E73',
        tertiary: '#86868B',
        inverse: '#FFFFFF',
      },
      accent: {
        blue: '#007AFF',
        blueHover: '#0051D5',
        blueActive: '#004FC1',
      },
      status: {
        success: '#34C759',
        error: '#FF3B30',
        warning: '#FF9500',
        info: '#007AFF',
      },
      border: {
        primary: '#D2D2D7',
        secondary: '#E5E5EA',
        focus: '#007AFF',
      },
      node: {
        start: { bg: '#D1F4E0', border: '#34C759', text: '#0D5028' },
        end: { bg: '#FFE5E5', border: '#FF3B30', text: '#660000' },
        input: { bg: '#E3F2FD', border: '#2196F3', text: '#0D47A1' },
        output: { bg: '#F3E5F5', border: '#9C27B0', text: '#4A148C' },
        process: { bg: '#FFF9E6', border: '#FFC107', text: '#663C00' },
        decision: { bg: '#FFE9D6', border: '#FF9800', text: '#661E00' },
        loop: { bg: '#FCE4EC', border: '#E91E63', text: '#6B0030' },
      },
      shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
    // Colori Dark Mode
    dark: {
      bg: {
        primary: '#000000',
        secondary: '#1C1C1E',
        tertiary: '#2C2C2E',
        elevated: '#1C1C1E',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#98989D',
        tertiary: '#6E6E73',
        inverse: '#000000',
      },
      accent: {
        blue: '#0A84FF',
        blueHover: '#409CFF',
        blueActive: '#60A5FA',
      },
      status: {
        success: '#30D158',
        error: '#FF453A',
        warning: '#FF9F0A',
        info: '#0A84FF',
      },
      border: {
        primary: '#38383A',
        secondary: '#2C2C2E',
        focus: '#0A84FF',
      },
      node: {
        start: { bg: '#0D3B2E', border: '#30D158', text: '#D1F4E0' },
        end: { bg: '#3B0D0D', border: '#FF453A', text: '#FFE5E5' },
        input: { bg: '#0D2847', border: '#409CFF', text: '#E3F2FD' },
        output: { bg: '#2E0D38', border: '#BF5AF2', text: '#F3E5F5' },
        process: { bg: '#3B2E0D', border: '#FFD60A', text: '#FFF9E6' },
        decision: { bg: '#3B1E0D', border: '#FF9F0A', text: '#FFE9D6' },
        loop: { bg: '#3B0D1E', border: '#FF375F', text: '#FCE4EC' },
      },
      shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
      },
    },
  },

  // Tipografia
  typography: {
    fontFamily: {
      sans: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`,
      mono: `'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace`,
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing system (4px base)
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Breakpoints per responsive
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Transizioni e animazioni
  transitions: {
    duration: {
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
    },
    easing: {
      // Apple-like smooth easing
      default: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0.0, 1, 1)',
      out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
  },
} as const;

export type Theme = typeof theme;
export type ThemeMode = 'light' | 'dark';

/**
 * Helper per ottenere i colori del tema corrente
 */
export const getThemeColors = (mode: ThemeMode) => {
  return theme.colors[mode];
};

/**
 * CSS Variables per uso con Tailwind e CSS
 */
export const getCSSVariables = (mode: ThemeMode) => {
  const colors = getThemeColors(mode);

  return {
    // Background
    '--bg-primary': colors.bg.primary,
    '--bg-secondary': colors.bg.secondary,
    '--bg-tertiary': colors.bg.tertiary,
    '--bg-elevated': colors.bg.elevated,

    // Text
    '--text-primary': colors.text.primary,
    '--text-secondary': colors.text.secondary,
    '--text-tertiary': colors.text.tertiary,
    '--text-inverse': colors.text.inverse,

    // Accent
    '--accent-blue': colors.accent.blue,
    '--accent-blue-hover': colors.accent.blueHover,
    '--accent-blue-active': colors.accent.blueActive,

    // Status
    '--status-success': colors.status.success,
    '--status-error': colors.status.error,
    '--status-warning': colors.status.warning,
    '--status-info': colors.status.info,

    // Border
    '--border-primary': colors.border.primary,
    '--border-secondary': colors.border.secondary,
    '--border-focus': colors.border.focus,
  };
};
