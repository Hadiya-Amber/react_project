import React from 'react';
import { Box, Container, Typography, Grid, alpha } from '@mui/material';
import { designTokens } from '@/theme/designTokens';
import ProfessionalButton from './ProfessionalButton';
import { AccountBalance, Security, TrendingUp, Speed } from '@mui/icons-material';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  primaryAction?: {
    text: string;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
  showFeatures?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  showFeatures = true,
}) => {
  const features = [
    {
      icon: <Security sx={{ fontSize: 40, color: '#FFFFFF' }} />,
      title: 'Bank-Grade Security',
      description: 'Enterprise-level protection',
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: '#FFFFFF' }} />,
      title: 'Instant Transfers',
      description: 'Real-time transactions',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#FFFFFF' }} />,
      title: 'Smart Analytics',
      description: 'Financial insights',
    },
    {
      icon: <AccountBalance sx={{ fontSize: 40, color: '#FFFFFF' }} />,
      title: 'Multi-Account',
      description: 'Comprehensive banking',
    },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: designTokens.gradients.hero,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 20%, ${alpha(designTokens.colors.accent[500], 0.3)} 0%, transparent 50%),
                       radial-gradient(circle at 70% 80%, ${alpha(designTokens.colors.secondary[500], 0.2)} 0%, transparent 50%)`,
          zIndex: 1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ color: '#FFFFFF' }}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: designTokens.typography.fontWeight.bold,
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                  lineHeight: designTokens.typography.lineHeight.tight,
                  mb: 3,
                  background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.8) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {title}
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  lineHeight: designTokens.typography.lineHeight.relaxed,
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: designTokens.typography.fontWeight.normal,
                }}
              >
                {subtitle}
              </Typography>

              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                {primaryAction && (
                  <ProfessionalButton
                    variant="gradient"
                    size="large"
                    onClick={primaryAction.onClick}
                    glowEffect
                    sx={{
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      minWidth: 200,
                    }}
                  >
                    {primaryAction.text}
                  </ProfessionalButton>
                )}
                
                {secondaryAction && (
                  <ProfessionalButton
                    variant="glass"
                    size="large"
                    onClick={secondaryAction.onClick}
                    sx={{
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      minWidth: 200,
                      color: '#FFFFFF',
                      borderColor: alpha('#FFFFFF', 0.3),
                      '&:hover': {
                        borderColor: '#FFFFFF',
                        background: alpha('#FFFFFF', 0.1),
                      },
                    }}
                  >
                    {secondaryAction.text}
                  </ProfessionalButton>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: { xs: 300, md: 500 },
                position: 'relative',
              }}
            >
              {/* Banking Illustration */}
              <Box
                sx={{
                  fontSize: { xs: '8rem', md: '12rem', lg: '15rem' },
                  opacity: 0.9,
                  filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
                  animation: 'float 6s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                  },
                }}
              >
                🏦
              </Box>
              
              {/* Floating Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '20%',
                  right: '10%',
                  background: alpha('#FFFFFF', 0.1),
                  backdropFilter: 'blur(10px)',
                  borderRadius: designTokens.borderRadius.lg,
                  p: 2,
                  border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                  animation: 'float 4s ease-in-out infinite 1s',
                }}
              >
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  💳 Secure Payments
                </Typography>
              </Box>
              
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '10%',
                  background: alpha('#FFFFFF', 0.1),
                  backdropFilter: 'blur(10px)',
                  borderRadius: designTokens.borderRadius.lg,
                  p: 2,
                  border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                  animation: 'float 5s ease-in-out infinite 2s',
                }}
              >
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  📊 Real-time Analytics
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {showFeatures && (
          <Grid container spacing={4} sx={{ mt: 8 }}>
            {features.map((feature, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    background: alpha('#FFFFFF', 0.1),
                    backdropFilter: 'blur(20px)',
                    borderRadius: designTokens.borderRadius.lg,
                    border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                    transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.easeInOut}`,
                    '&:hover': {
                      background: alpha('#FFFFFF', 0.15),
                      transform: 'translateY(-4px)',
                      boxShadow: designTokens.shadows.xl,
                    },
                  }}
                >
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#FFFFFF',
                      fontWeight: designTokens.typography.fontWeight.semibold,
                      mb: 1,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha('#FFFFFF', 0.8),
                      fontSize: designTokens.typography.fontSize.sm,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default HeroSection;