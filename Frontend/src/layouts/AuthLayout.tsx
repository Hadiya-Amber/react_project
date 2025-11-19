import React from 'react';
import { Box, Container, Paper, Typography, Avatar } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import { designTokens } from '@/theme/designTokens';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${designTokens.colors.neutral[100]} 0%, ${designTokens.colors.neutral[200]} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(100, 116, 139, 0.1) 0%, transparent 50%)
          `,
        }}
      />
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            border: `1px solid ${designTokens.colors.neutral[300]}`,
            boxShadow: designTokens.shadows.lg,
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                background: `linear-gradient(135deg, ${designTokens.colors.primary[500]} 0%, ${designTokens.colors.primary[600]} 100%)`,
                boxShadow: `0 8px 25px ${designTokens.colors.primary[500]}30`,
              }}
            >
              <AccountBalanceWallet sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{
                fontWeight: 700,
                mb: 1,
                background: `linear-gradient(135deg, ${designTokens.colors.primary[600]} 0%, ${designTokens.colors.primary[700]} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Perfect Bank
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: designTokens.colors.neutral[600],
                fontWeight: 400,
                mb: 1,
              }}
            >
              Secure Online Banking System
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 1,
              mb: 2,
            }}>
              <Box sx={{ 
                width: 40, 
                height: 2, 
                background: `linear-gradient(90deg, ${designTokens.colors.primary[500]} 0%, ${designTokens.colors.primary[600]} 100%)`,
                borderRadius: 1,
              }} />
              <Typography variant="caption" sx={{ 
                color: designTokens.colors.neutral[500],
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                Trust & Excellence
              </Typography>
              <Box sx={{ 
                width: 40, 
                height: 2, 
                background: `linear-gradient(90deg, ${designTokens.colors.primary[600]} 0%, ${designTokens.colors.accent[500]} 100%)`,
                borderRadius: 1,
              }} />
            </Box>
          </Box>
          
          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            {children}
          </Box>
          
          {/* Footer */}
          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${designTokens.colors.neutral[200]}` }}>
            <Typography variant="caption" sx={{ 
              color: designTokens.colors.neutral[500],
              display: 'block',
            }}>
              © 2024 Perfect Bank. All rights reserved.
            </Typography>
            <Typography variant="caption" sx={{ 
              color: designTokens.colors.neutral[500],
              display: 'block',
              mt: 0.5,
            }}>
              Secured with industry-standard encryption
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
