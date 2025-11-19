import React from 'react';
import { Box, alpha } from '@mui/material';
import { designTokens } from '@/theme/designTokens';

interface ProfessionalBackgroundProps {
  variant?: 'default' | 'hero' | 'dashboard' | 'auth';
  children: React.ReactNode;
  overlay?: boolean;
}

export const ProfessionalBackground: React.FC<ProfessionalBackgroundProps> = ({
  variant = 'default',
  children,
  overlay = false,
}) => {
  const getBackgroundStyles = () => {
    const baseStyles = {
      position: 'relative' as const,
      minHeight: '100vh',
      overflow: 'hidden',
    };

    switch (variant) {
      case 'hero':
        return {
          ...baseStyles,
          background: designTokens.gradients.hero,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 30%, ${alpha(designTokens.colors.accent[500], 0.15)} 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, ${alpha(designTokens.colors.secondary[500], 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, ${alpha(designTokens.colors.primary[300], 0.08)} 0%, transparent 50%)
            `,
            zIndex: 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
            `,
            zIndex: 1,
          },
        };

      case 'dashboard':
        return {
          ...baseStyles,
          background: `
            linear-gradient(135deg, ${designTokens.colors.neutral[50]} 0%, ${designTokens.colors.neutral[100]} 100%)
          `,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 90% 10%, ${alpha(designTokens.colors.primary[200], 0.3)} 0%, transparent 50%),
              radial-gradient(circle at 10% 90%, ${alpha(designTokens.colors.secondary[200], 0.2)} 0%, transparent 50%)
            `,
            zIndex: 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23295B9E' fill-opacity='0.03'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
            `,
            zIndex: 1,
          },
        };

      case 'auth':
        return {
          ...baseStyles,
          background: `
            linear-gradient(135deg, ${designTokens.colors.primary[600]} 0%, ${designTokens.colors.secondary[500]} 50%, ${designTokens.colors.primary[800]} 100%)
          `,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 30% 20%, ${alpha('#FFFFFF', 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, ${alpha(designTokens.colors.accent[500], 0.15)} 0%, transparent 50%)
            `,
            zIndex: 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M0 0h80v80H0V0zm20 20v40h40V20H20zm20 35a15 15 0 1 1 0-30 15 15 0 0 1 0 30z' fill-rule='nonzero'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
            `,
            zIndex: 1,
          },
        };

      default:
        return {
          ...baseStyles,
          backgroundColor: designTokens.colors.neutral[100],
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 50% 50%, ${alpha(designTokens.colors.primary[100], 0.5)} 0%, transparent 70%)
            `,
            zIndex: 1,
          },
        };
    }
  };

  const overlayStyles = overlay ? {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: alpha(designTokens.colors.neutral[900], 0.3),
      zIndex: 2,
    },
  } : {};

  return (
    <Box
      sx={{
        ...getBackgroundStyles(),
        ...overlayStyles,
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 3, height: '100%' }}>
        {children}
      </Box>
    </Box>
  );
};

export default ProfessionalBackground;