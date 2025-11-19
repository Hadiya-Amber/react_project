import { Theme } from '@mui/material/styles';

// Responsive breakpoints
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Common responsive spacing
export const responsiveSpacing = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
};

// Common responsive typography
export const responsiveTypography = {
  h1: {
    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
  },
  h2: {
    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
  },
  h3: {
    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
  },
  h4: {
    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
  },
  h5: {
    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' }
  },
  h6: {
    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
  }
};

// Common responsive component props
export const responsiveProps = {
  // Button sizes
  button: {
    size: { xs: 'small', sm: 'medium' }
  },
  
  // TextField sizes
  textField: {
    size: { xs: 'small', sm: 'medium' }
  },
  
  // Card padding
  card: {
    padding: { xs: 2, sm: 3, md: 4 }
  },
  
  // Container padding
  container: {
    padding: { xs: 1, sm: 2, md: 3 }
  },
  
  // Grid spacing
  grid: {
    spacing: { xs: 1, sm: 2, md: 3 }
  }
};

// Utility function to get responsive values
export const getResponsiveValue = (theme: Theme, values: Record<string, any>) => {
  return Object.entries(values).reduce((acc, [breakpoint, value]) => {
    acc[theme.breakpoints.up(breakpoint as any)] = value;
    return acc;
  }, {} as any);
};

// Common responsive mixins
export const responsiveMixins = {
  // Hide on mobile
  hideOnMobile: {
    display: { xs: 'none', sm: 'block' }
  },
  
  // Hide on desktop
  hideOnDesktop: {
    display: { xs: 'block', sm: 'none' }
  },
  
  // Responsive flex direction
  responsiveFlex: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: { xs: 1, sm: 2 }
  },
  
  // Responsive text alignment
  responsiveTextAlign: {
    textAlign: { xs: 'center', sm: 'left' }
  },
  
  // Responsive width
  responsiveWidth: {
    width: { xs: '100%', sm: 'auto' }
  }
};