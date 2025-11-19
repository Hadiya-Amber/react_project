import { createTheme, alpha } from '@mui/material/styles';
import { designTokens } from './designTokens';

// Professional Banking Colors
const colors = {
  primary: designTokens.colors.primary[500],
  secondary: designTokens.colors.secondary[500], 
  accent: designTokens.colors.accent[500],
  backgroundLight: designTokens.colors.neutral[100],
  surface: '#FFFFFF',
  textPrimary: designTokens.colors.neutral[800],
  textSecondary: designTokens.colors.neutral[500],
  error: designTokens.colors.error[500],
  border: designTokens.colors.neutral[300],
};

// Professional Banking Theme
export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: colors.primary,
      light: '#4A7BC8',
      dark: '#1E4A7A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.secondary,
      light: '#5BC4CA',
      dark: '#2A8A91',
      contrastText: '#FFFFFF',
    },
    error: {
      main: colors.error,
      light: '#E57373',
      dark: '#C62828',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: colors.accent,
      light: '#FFD699',
      dark: '#E6A052',
      contrastText: colors.textPrimary,
    },
    success: {
      main: colors.secondary,
      light: '#5BC4CA',
      dark: '#2A8A91',
      contrastText: '#FFFFFF',
    },
    background: {
      default: colors.backgroundLight,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    divider: colors.border,
    action: {
      disabled: colors.border,
      disabledBackground: colors.border,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: colors.textPrimary,
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontWeight: 600,
      color: colors.textPrimary,
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontWeight: 600,
      color: colors.textPrimary,
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontWeight: 600,
      color: colors.textPrimary,
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontWeight: 500,
      color: colors.textPrimary,
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    h6: {
      fontWeight: 500,
      color: colors.textPrimary,
      fontSize: '1.1rem',
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
    body1: {
      color: colors.textPrimary,
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
    body2: {
      color: colors.textSecondary,
      fontSize: '0.875rem',
      '@media (max-width:600px)': {
        fontSize: '0.8rem',
      },
    },
    caption: {
      color: colors.textSecondary,
      fontSize: '0.75rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.backgroundLight,
          color: colors.textPrimary,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(41, 91, 158, 0.08)',
          border: `1px solid ${colors.border}`,
          '@media (max-width:600px)': {
            borderRadius: 12,
            margin: '8px',
            boxShadow: '0 2px 12px rgba(41, 91, 158, 0.06)',
          },
          '&:hover': {
            boxShadow: '0 8px 32px rgba(41, 91, 158, 0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
          boxShadow: 'none',
          '@media (max-width:600px)': {
            padding: '8px 16px',
            fontSize: '0.875rem',
          },
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        sizeSmall: {
          '@media (max-width:600px)': {
            padding: '6px 12px',
            fontSize: '0.8rem',
          },
        },
        sizeLarge: {
          '@media (max-width:600px)': {
            padding: '10px 20px',
            fontSize: '1rem',
          },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            backgroundColor: colors.primary,
            '&:hover': {
              backgroundColor: '#1E4A7A',
            },
          },
          '&.MuiButton-containedSecondary': {
            backgroundColor: colors.secondary,
            '&:hover': {
              backgroundColor: '#2A8A91',
            },
          },
        },
        outlined: {
          borderColor: colors.border,
          color: colors.textPrimary,
          '&:hover': {
            borderColor: colors.primary,
            backgroundColor: 'rgba(41, 91, 158, 0.04)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.primary,
          boxShadow: '0 2px 12px rgba(41, 91, 158, 0.15)',
          '@media (max-width:600px)': {
            '& .MuiToolbar-root': {
              minHeight: '56px',
              paddingLeft: '8px',
              paddingRight: '8px',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          borderRight: `1px solid ${colors.border}`,
          boxShadow: '0 4px 20px rgba(41, 91, 158, 0.08)',
          '@media (max-width:900px)': {
            width: '280px',
          },
          '@media (max-width:600px)': {
            width: '100%',
            maxWidth: '320px',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: `rgba(41, 91, 158, 0.1)`,
            color: colors.primary,
            '&:hover': {
              backgroundColor: `rgba(41, 91, 158, 0.15)`,
            },
          },
          '&:hover': {
            backgroundColor: `rgba(41, 91, 158, 0.05)`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '@media (max-width:600px)': {
              fontSize: '16px', // Prevents zoom on iOS
            },
            '& fieldset': {
              borderColor: colors.border,
            },
            '&:hover fieldset': {
              borderColor: colors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
            },
          },
          '& .MuiInputLabel-root': {
            '@media (max-width:600px)': {
              fontSize: '0.9rem',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        colorPrimary: {
          backgroundColor: colors.primary,
          color: '#FFFFFF',
        },
        colorSecondary: {
          backgroundColor: colors.secondary,
          color: '#FFFFFF',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardError: {
          backgroundColor: 'rgba(217, 83, 79, 0.1)',
          color: colors.error,
          border: `1px solid ${colors.error}`,
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 178, 92, 0.1)',
          color: '#E6A052',
          border: `1px solid ${colors.accent}`,
        },
        standardSuccess: {
          backgroundColor: 'rgba(57, 180, 187, 0.1)',
          color: colors.secondary,
          border: `1px solid ${colors.secondary}`,
        },
        standardInfo: {
          backgroundColor: 'rgba(41, 91, 158, 0.1)',
          color: colors.primary,
          border: `1px solid ${colors.primary}`,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.backgroundLight,
          '& .MuiTableCell-head': {
            color: colors.textPrimary,
            fontWeight: 600,
            borderBottom: `2px solid ${colors.border}`,
            '@media (max-width:600px)': {
              fontSize: '0.8rem',
              padding: '8px 4px',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            fontSize: '0.8rem',
            padding: '8px 4px',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(242, 248, 253, 0.5)',
          },
          '&:hover': {
            backgroundColor: 'rgba(41, 91, 158, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          boxShadow: '0 2px 12px rgba(41, 91, 158, 0.08)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.border,
        },
      },
    },
  },
});

// Export design system for use in custom components
export { colors, designTokens };

// Professional theme variants
export const createProfessionalTheme = (variant: 'light' | 'dark' = 'light') => {
  return createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      mode: variant,
      ...(variant === 'dark' && {
        background: {
          default: designTokens.colors.neutral[900],
          paper: designTokens.colors.neutral[800],
        },
        text: {
          primary: designTokens.colors.neutral[100],
          secondary: designTokens.colors.neutral[400],
        },
      }),
    },
  });
};

// Banking-specific component styles
export const bankingComponents = {
  glassCard: {
    background: designTokens.gradients.glass,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
    boxShadow: designTokens.shadows.glass,
  },
  
  heroGradient: {
    background: designTokens.gradients.hero,
  },
  
  professionalButton: {
    background: designTokens.gradients.primary,
    borderRadius: designTokens.borderRadius.md,
    boxShadow: designTokens.shadows.md,
    transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.easeInOut}`,
    '&:hover': {
      boxShadow: designTokens.shadows.lg,
      transform: 'translateY(-2px)',
    },
  },
};

