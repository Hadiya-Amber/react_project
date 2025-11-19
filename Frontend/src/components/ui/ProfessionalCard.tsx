import React from 'react';
import { Card, CardProps, alpha } from '@mui/material';
import { designTokens } from '@/theme/designTokens';

interface ProfessionalCardProps extends Omit<CardProps, 'variant'> {
  variant?: 'glass' | 'elevated' | 'gradient' | 'hero';
  glowEffect?: boolean;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  variant = 'elevated',
  glowEffect = false,
  children,
  sx,
  ...props
}) => {
  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: designTokens.borderRadius.xl,
      transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.easeInOut}`,
      border: `1px solid ${alpha(designTokens.colors.neutral[300], 0.3)}`,
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyles,
          background: designTokens.gradients.glass,
          backdropFilter: 'blur(20px)',
          boxShadow: designTokens.shadows.glass,
          border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
          '&:hover': {
            boxShadow: designTokens.shadows.glassHover,
            transform: 'translateY(-4px)',
          },
        };

      case 'gradient':
        return {
          ...baseStyles,
          background: designTokens.gradients.hero,
          color: '#FFFFFF',
          boxShadow: designTokens.shadows.xl,
          border: 'none',
          '&:hover': {
            boxShadow: designTokens.shadows['2xl'],
            transform: 'translateY(-6px)',
          },
        };

      case 'hero':
        return {
          ...baseStyles,
          background: `linear-gradient(145deg, ${alpha('#FFFFFF', 0.95)} 0%, ${alpha('#FFFFFF', 0.8)} 100%)`,
          backdropFilter: 'blur(30px)',
          boxShadow: designTokens.shadows.xl,
          border: `1px solid ${alpha(designTokens.colors.primary[300], 0.3)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${designTokens.colors.primary[300]}, transparent)`,
          },
          '&:hover': {
            boxShadow: designTokens.shadows['2xl'],
            transform: 'translateY(-8px)',
          },
        };

      default: // elevated
        return {
          ...baseStyles,
          background: designTokens.gradients.card,
          backdropFilter: 'blur(10px)',
          boxShadow: designTokens.shadows.md,
          '&:hover': {
            boxShadow: designTokens.shadows.lg,
            transform: 'translateY(-2px)',
          },
        };
    }
  };

  const glowStyles = glowEffect ? {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      background: designTokens.gradients.primary,
      borderRadius: designTokens.borderRadius.xl,
      zIndex: -1,
      opacity: 0,
      transition: `opacity ${designTokens.animation.duration.normal} ${designTokens.animation.easing.easeInOut}`,
    },
    '&:hover::after': {
      opacity: 0.3,
    },
  } : {};

  return (
    <Card
      sx={{
        ...getCardStyles(),
        ...glowStyles,
        ...sx,
      } as any}
      {...props}
    >
      {children}
    </Card>
  );
};

export default ProfessionalCard;