import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Alert,
  Container,
  Link,
  InputAdornment,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AccountBalanceWallet,
  Shield,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';
import { getErrorMessage } from '@/utils/errorHandler';
import { loginSchema, type LoginFormData } from '@/validation/authValidation';
import { designTokens } from '@/theme/designTokens';
import ProfessionalCard from '@/components/ui/ProfessionalCard';
import ProfessionalButton from '@/components/ui/ProfessionalButton';

const CleanLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    if (loading) return; // Prevent double submission
    
    setLoading(true);
    setError('');
    
    try {
      await login(data);
      showNotification('Login successful!', NotificationType.SUCCESS);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(getErrorMessage(err));
      setLoading(false);
      return false;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
      }}
    >
      {/* Left Column - Image */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
            `,
          },
        }}
      >
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <AccountBalanceWallet
            sx={{
              fontSize: 80,
              color: '#FFFFFF',
              mb: 3,
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
            }}
          />
          <Typography
            variant="h1"
            sx={{
              color: '#FFFFFF',
              fontWeight: 800,
              mb: 0.5,
              fontSize: { xs: '2rem', md: '2.5rem' },
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em',
            }}
          >
            Perfect
          </Typography>
          <Typography
            variant="h1"
            sx={{
              color: '#10b981',
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em',
            }}
          >
            Bank
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#FFFFFF',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              🔐 Secure Banking
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Column - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          backgroundColor: '#64748b',
        }}
      >
        <ProfessionalCard
          variant="elevated"
          sx={{
            p: 6,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(designTokens.colors.neutral[300], 0.3)}`,
            maxWidth: 480,
            width: '100%',
          }}
        >
            {/* Mobile Logo - Only show on small screens */}
            <Box sx={{ textAlign: 'center', mb: 4, display: { xs: 'block', md: 'none' } }}>
              <AccountBalanceWallet
                sx={{
                  fontSize: 48,
                  color: designTokens.colors.primary[600],
                  mb: 2,
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: designTokens.typography.fontWeight.bold,
                  color: designTokens.colors.primary[700],
                  mb: 1,
                }}
              >
                Perfect Bank
              </Typography>
            </Box>

            {/* Form Header */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[800],
                textAlign: 'center',
                mb: 4,
              }}
            >
              Sign in to your account
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: designTokens.borderRadius.md,
                }}
              >
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 4 }}>
              <TextField
                {...register('email')}
                fullWidth
                label="Email Address *"
                type="email"
                autoComplete="email"
                autoFocus
                disabled={loading}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: designTokens.colors.primary[400] }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: designTokens.borderRadius.md,
                    backgroundColor: alpha(designTokens.colors.neutral[50], 0.5),
                    '&.Mui-error': {
                      '& fieldset': {
                        borderColor: '#dc2626',
                        borderWidth: '2px',
                      },
                    },
                  },
                  '& .MuiFormHelperText-root.Mui-error': {
                    color: '#dc2626',
                    fontWeight: 600,
                  },
                }}
              />

              <TextField
                {...register('password')}
                fullWidth
                label="Password *"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={loading}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: designTokens.colors.primary[400] }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: designTokens.borderRadius.md,
                    backgroundColor: alpha(designTokens.colors.neutral[50], 0.5),
                    '&.Mui-error': {
                      '& fieldset': {
                        borderColor: '#dc2626',
                        borderWidth: '2px',
                      },
                    },
                  },
                  '& .MuiFormHelperText-root.Mui-error': {
                    color: '#dc2626',
                    fontWeight: 600,
                  },
                }}
              />

              <ProfessionalButton
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading || !isValid}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: designTokens.typography.fontWeight.semibold,
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </ProfessionalButton>
            </Box>

            {/* Forgot Password & Register Links */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="body2" sx={{ color: designTokens.colors.neutral[600], mb: 2 }}>
                <Link
                  onClick={() => navigate('/forgot-password')}
                  sx={{
                    color: designTokens.colors.primary[600],
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontWeight: designTokens.typography.fontWeight.medium,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot your password?
                </Link>
              </Typography>
              
              <Typography variant="body2" sx={{ color: designTokens.colors.neutral[600] }}>
                Don't have an account?{' '}
                <Link
                  onClick={() => navigate('/register')}
                  sx={{
                    color: designTokens.colors.primary[600],
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create Account
                </Link>
              </Typography>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                textAlign: 'center',
                pt: 3,
                borderTop: `1px solid ${designTokens.colors.neutral[200]}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Shield sx={{ fontSize: 16, color: designTokens.colors.accent[600], mr: 1 }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: designTokens.colors.neutral[600],
                    fontWeight: designTokens.typography.fontWeight.medium,
                  }}
                >
                  Secured with industry-standard encryption
                </Typography>
              </Box>
              
              <Typography
                variant="caption"
                sx={{
                  color: designTokens.colors.neutral[500],
                }}
              >
                © 2024 Perfect Bank. All rights reserved.
              </Typography>
            </Box>
        </ProfessionalCard>
      </Box>
    </Box>
  );
};

export default CleanLoginPage;