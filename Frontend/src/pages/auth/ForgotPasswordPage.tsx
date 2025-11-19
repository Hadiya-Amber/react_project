import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Box,
  Alert,
  Typography,
  InputAdornment,
  alpha,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Email, LockReset, Shield } from '@mui/icons-material';
import api from '@/api/axios';
import { designTokens } from '@/theme/designTokens';
import ProfessionalCard from '@/components/ui/ProfessionalCard';
import ProfessionalButton from '@/components/ui/ProfessionalButton';

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('email', data.email);

      const response = await api.post('/password-reset/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setSuccess('Password reset code sent to your email');
        setTimeout(() => {
          navigate('/reset-password/verify', { state: { email: data.email } });
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to send reset code');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
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
          <LockReset
            sx={{
              fontSize: 80,
              color: '#FFFFFF',
              mb: 2,
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
              🔑 Reset Password
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
            <LockReset
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

          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[800],
                mb: 2,
              }}
            >
              Forgot Password
            </Typography>
            <Typography variant="body1" sx={{ color: designTokens.colors.neutral[600] }}>
              Enter your email to receive a password reset code
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 4 }}>
            <TextField
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              fullWidth
              label="Email Address *"
              type="email"
              autoComplete="email"
              autoFocus
              disabled={isLoading}
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
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: designTokens.borderRadius.md,
                  backgroundColor: alpha(designTokens.colors.neutral[50], 0.5),
                },
              }}
            />

            <ProfessionalButton
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: designTokens.typography.fontWeight.semibold,
                mb: 3,
              }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </ProfessionalButton>

            <Box sx={{ textAlign: 'center' }}>
              <ProfessionalButton
                variant="secondary"
                onClick={() => navigate('/login')}
                disabled={isLoading}
              >
                Back to Login
              </ProfessionalButton>
            </Box>
          </Box>

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
          </Box>
        </ProfessionalCard>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
