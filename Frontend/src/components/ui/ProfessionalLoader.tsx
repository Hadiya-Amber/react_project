import React from 'react';
import { Box, CircularProgress, Typography, alpha } from '@mui/material';
import { designTokens } from '@/theme/designTokens';
import { AccountBalanceWallet } from '@mui/icons-material';

interface ProfessionalLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'page' | 'inline' | 'overlay';
}

export const ProfessionalLoader: React.FC<ProfessionalLoaderProps> = ({
  message = 'Loading...',
  size = 'medium',
  variant = 'page',
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      default:
        return 48;
    }
  };

  const getContainerStyles = () => {
    const baseStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    };

    switch (variant) {
      case 'page':
        return {
          ...baseStyles,
          minHeight: '100vh',
          background: designTokens.gradients.hero,
          position: 'relative' as const,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 50% 50%, ${alpha(designTokens.colors.accent[500], 0.1)} 0%, transparent 70%)`,
          },
        };

      case 'overlay':
        return {
          ...baseStyles,
          position: 'fixed' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha(designTokens.colors.neutral[900], 0.8),
          backdropFilter: 'blur(10px)',
          zIndex: designTokens.zIndex.modal,
        };

      default: // inline
        return {
          ...baseStyles,
          py: 4,
        };
    }
  };

  return (
    <Box sx={getContainerStyles()}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Banking Logo Animation */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            position: 'relative',
          }}
        >
          <AccountBalanceWallet
            sx={{
              fontSize: getSize() + 16,
              color: variant === 'page' ? '#FFFFFF' : designTokens.colors.primary[500],
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.7, transform: 'scale(1.05)' },
              },
            }}
          />
          
          {/* Rotating Progress Ring */}
          <CircularProgress
            size={getSize() + 32}
            thickness={2}
            sx={{
              position: 'absolute',
              color: variant === 'page' 
                ? alpha('#FFFFFF', 0.3) 
                : alpha(designTokens.colors.primary[500], 0.3),
              animation: 'rotate 2s linear infinite',
              '@keyframes rotate': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Box>

        {/* Professional Loading Text */}
        <Typography
          variant="h6"
          sx={{
            color: variant === 'page' ? '#FFFFFF' : designTokens.colors.neutral[700],
            fontWeight: designTokens.typography.fontWeight.medium,
            fontFamily: designTokens.typography.fontFamily.primary,
            textAlign: 'center',
            opacity: 0.9,
          }}
        >
          Perfect Bank
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: variant === 'page' 
              ? alpha('#FFFFFF', 0.8) 
              : designTokens.colors.neutral[600],
            fontFamily: designTokens.typography.fontFamily.primary,
            textAlign: 'center',
            mt: 1,
          }}
        >
          {message}
        </Typography>

        {/* Loading Dots Animation */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            mt: 2,
            justifyContent: 'center',
          }}
        >
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: variant === 'page' 
                  ? alpha('#FFFFFF', 0.6) 
                  : designTokens.colors.primary[400],
                animation: `bounce 1.4s ease-in-out ${index * 0.16}s infinite both`,
                '@keyframes bounce': {
                  '0%, 80%, 100%': {
                    transform: 'scale(0)',
                    opacity: 0.5,
                  },
                  '40%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ProfessionalLoader;