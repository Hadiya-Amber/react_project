import React from 'react';
import { Box, alpha } from '@mui/material';
import { designTokens } from '@/theme/designTokens';

export const FloatingElements: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {/* Floating Banking Icons */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          fontSize: '3rem',
          opacity: 0.1,
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(5deg)' },
          },
        }}
      >
        💳
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '5%',
          fontSize: '2.5rem',
          opacity: 0.1,
          animation: 'float 8s ease-in-out infinite 2s',
        }}
      >
        📊
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '15%',
          fontSize: '2rem',
          opacity: 0.1,
          animation: 'float 7s ease-in-out infinite 1s',
        }}
      >
        🔒
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '20%',
          fontSize: '2.5rem',
          opacity: 0.1,
          animation: 'float 9s ease-in-out infinite 3s',
        }}
      >
        💰
      </Box>

      {/* Geometric Shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          right: '25%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(designTokens.colors.primary[300], 0.1)} 0%, ${alpha(designTokens.colors.secondary[300], 0.1)} 100%)`,
          animation: 'pulse 4s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.1 },
            '50%': { transform: 'scale(1.1)', opacity: 0.2 },
          },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          left: '20%',
          width: 80,
          height: 80,
          borderRadius: designTokens.borderRadius.lg,
          background: `linear-gradient(45deg, ${alpha(designTokens.colors.accent[300], 0.1)} 0%, ${alpha(designTokens.colors.primary[300], 0.1)} 100%)`,
          animation: 'rotate 20s linear infinite',
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />

      {/* Gradient Orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '30%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(designTokens.colors.primary[200], 0.15)} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          animation: 'drift 15s ease-in-out infinite',
          '@keyframes drift': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '33%': { transform: 'translate(30px, -30px)' },
            '66%': { transform: 'translate(-20px, 20px)' },
          },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '35%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(designTokens.colors.secondary[200], 0.15)} 0%, transparent 70%)`,
          filter: 'blur(30px)',
          animation: 'drift 12s ease-in-out infinite 5s',
        }}
      />
    </Box>
  );
};

export default FloatingElements;