import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  padding?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  maxWidth = 'xl', 
  padding = true 
}) => {
  return (
    <Container 
      maxWidth={maxWidth} 
      sx={{ 
        px: padding ? { xs: 1, sm: 2, md: 3 } : 0,
        py: padding ? { xs: 1, sm: 2 } : 0,
        width: '100%'
      }}
    >
      {children}
    </Container>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  spacing?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  spacing = 2 
}) => {
  return (
    <Box 
      sx={{ 
        display: 'grid',
        gap: spacing,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        }
      }}
    >
      {children}
    </Box>
  );
};

interface ResponsiveCardProps {
  children: React.ReactNode;
  elevation?: number;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ 
  children, 
  elevation = 1 
}) => {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: elevation,
        p: { xs: 2, sm: 3 },
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {children}
    </Box>
  );
};

export const useResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoints: {
      xs: useMediaQuery(theme.breakpoints.only('xs')),
      sm: useMediaQuery(theme.breakpoints.only('sm')),
      md: useMediaQuery(theme.breakpoints.only('md')),
      lg: useMediaQuery(theme.breakpoints.only('lg')),
      xl: useMediaQuery(theme.breakpoints.only('xl'))
    }
  };
};