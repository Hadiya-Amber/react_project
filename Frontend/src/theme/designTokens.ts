// Professional Banking Design Tokens
export const designTokens = {
  // Professional Greyish Color Palette
  colors: {
    // Primary Sophisticated Greys - Modern & Professional
    primary: {
      50: '#F8FAFC',
      100: '#F1F5F9', 
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B', // Main brand color - Slate grey
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    
    // Secondary Warm Grey - Elegant & Refined
    secondary: {
      50: '#FAFAF9',
      100: '#F5F5F4',
      200: '#E7E5E4', 
      300: '#D6D3D1',
      400: '#A8A29E',
      500: '#78716C', // Main secondary - Stone grey
      600: '#57534E',
      700: '#44403C',
      800: '#292524',
      900: '#1C1917',
    },
    
    // Accent Emerald - Subtle & Trustworthy
    accent: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7', 
      400: '#34D399',
      500: '#10B981', // Main accent - Emerald
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    
    // Neutral Grays - Professional Balance
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5', // Background light
      200: '#EEEEEE',
      300: '#E0E0E0', // Border
      400: '#BDBDBD',
      500: '#9E9E9E', // Text secondary
      600: '#757575',
      700: '#616161',
      800: '#424242', // Text primary
      900: '#212121',
    },
    
    // Status Colors - Banking Operations
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },
    
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#D9534F', // Main error
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
  },
  
  // Professional Typography Scale
  typography: {
    fontFamily: {
      primary: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: '"Poppins", "Inter", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px  
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  
  // Professional Spacing System
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },
  
  // Professional Border Radius
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    base: '0.5rem',   // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    full: '9999px',
  },
  
  // Professional Shadows - Modern Grade
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    
    // Glassmorphism shadows
    glass: '0 8px 32px 0 rgba(100, 116, 139, 0.37)',
    glassHover: '0 16px 64px 0 rgba(100, 116, 139, 0.25)',
  },
  
  // Professional Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
    secondary: 'linear-gradient(135deg, #78716C 0%, #57534E 100%)',
    accent: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    hero: 'linear-gradient(135deg, #64748B 0%, #78716C 50%, #475569 100%)',
    card: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
    glass: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    overlay: 'linear-gradient(180deg, rgba(100, 116, 139, 0.8) 0%, rgba(71, 85, 105, 0.9) 100%)',
  },
  
  // Professional Animations
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms',
    },
    
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Professional Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '900px', 
    lg: '1200px',
    xl: '1536px',
    '2xl': '1920px',
  },
  
  // Professional Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// Type exports for TypeScript support
export type DesignTokens = typeof designTokens;
export type ColorScale = typeof designTokens.colors.primary;