import React from 'react';
import { Button, ButtonProps, alpha, CircularProgress } from '@mui/material';
import { designTokens } from '@/theme/designTokens';

interface ProfessionalButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'glass' | 'gradient' | 'outline';
  loading?: boolean;
  glowEffect?: boolean;
}

export const ProfessionalButton: React.FC<ProfessionalButtonProps> = ({
  variant = 'primary',
  loading = false,
  glowEffect = false,
  children,
  disabled,
  sx,
  ...props
}) => {
  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: designTokens.borderRadius.md,
      fontWeight: designTokens.typography.fontWeight.semibold,
      fontFamily: designTokens.typography.fontFamily.primary,
      textTransform: 'none' as const,
      padding: `${designTokens.spacing[3]} ${designTokens.spacing[6]}`,
      transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.easeInOut}`,
      position: 'relative' as const,
      overflow: 'hidden' as const,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          background: designTokens.gradients.primary,
          color: '#FFFFFF',
          border: 'none',
          boxShadow: designTokens.shadows.md,
          '&:hover': {
            background: `linear-gradient(135deg, ${designTokens.colors.primary[600]} 0%, ${designTokens.colors.primary[800]} 100%)`,
            boxShadow: designTokens.shadows.lg,
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        };

      case 'secondary':
        return {
          ...baseStyles,
          background: designTokens.gradients.secondary,
          color: '#FFFFFF',
          border: 'none',
          boxShadow: designTokens.shadows.md,
          '&:hover': {
            background: `linear-gradient(135deg, ${designTokens.colors.secondary[600]} 0%, ${designTokens.colors.secondary[800]} 100%)`,
            boxShadow: designTokens.shadows.lg,
            transform: 'translateY(-2px)',
          },
        };

      case 'glass':
        return {
          ...baseStyles,
          background: alpha('#FFFFFF', 0.1),
          backdropFilter: 'blur(20px)',
          color: designTokens.colors.primary[600],
          border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
          boxShadow: designTokens.shadows.glass,
          '&:hover': {
            background: alpha('#FFFFFF', 0.2),
            boxShadow: designTokens.shadows.glassHover,
            transform: 'translateY(-2px)',
          },
        };

      case 'gradient':
        return {
          ...baseStyles,
          background: designTokens.gradients.accent,
          color: designTokens.colors.neutral[800],
          border: 'none',
          boxShadow: designTokens.shadows.md,
          '&:hover': {
            background: `linear-gradient(135deg, ${designTokens.colors.accent[600]} 0%, ${designTokens.colors.accent[700]} 100%)`,
            boxShadow: designTokens.shadows.lg,
            transform: 'translateY(-2px)',
          },
        };

      case 'outline':
        return {
          ...baseStyles,
          background: 'transparent',
          color: designTokens.colors.primary[600],
          border: `2px solid ${designTokens.colors.primary[300]}`,
          '&:hover': {
            background: alpha(designTokens.colors.primary[500], 0.1),
            borderColor: designTokens.colors.primary[500],
            boxShadow: `0 0 0 3px ${alpha(designTokens.colors.primary[500], 0.1)}`,
            transform: 'translateY(-1px)',
          },
        };

      default:
        return baseStyles;
    }
  };

  const glowStyles = glowEffect ? {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: designTokens.gradients.primary,
      borderRadius: 'inherit',
      opacity: 0,
      transition: `opacity ${designTokens.animation.duration.normal} ${designTokens.animation.easing.easeInOut}`,
      zIndex: -1,
    },
    '&:hover::before': {
      opacity: 0.2,
    },
  } : {};

  return (
    <Button
      disabled={disabled || loading}
      sx={{
        ...getButtonStyles(),
        ...glowStyles,
        ...(loading && {
          pointerEvents: 'none',
        }),
        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <>
          <CircularProgress
            size={20}
            sx={{
              color: 'inherit',
              mr: 1,
            }}
          />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default ProfessionalButton;