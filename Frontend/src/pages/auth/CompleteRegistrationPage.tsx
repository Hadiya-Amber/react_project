import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  Box,
  Alert,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  alpha,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd, Shield } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { registrationService } from '@/services/registrationService'
import { otpService } from '@/services/otpService'
import { SimpleCustomerRegistrationDto, Gender } from '@/types'
import { designTokens } from '@/theme/designTokens';
import ProfessionalCard from '@/components/ui/ProfessionalCard';
import ProfessionalButton from '@/components/ui/ProfessionalButton';

const CompleteRegistrationPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || '';
  const verified = location.state?.verified || false;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SimpleCustomerRegistrationDto>({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      address: '',
      dateOfBirth: '',
      gender: Gender.Male,
    },
  });

  const password = watch('password');

  useEffect(() => {
    if (!email || !verified) {
      navigate('/register');
    }
  }, [email, verified, navigate]);

  const onSubmit = async (data: SimpleCustomerRegistrationDto) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const registrationData = {
        ...data,
        email,
        dateOfBirth: new Date(data.dateOfBirth).toISOString(),
      };

      await registrationService.registerCustomer(registrationData)
      
      // Mark email as registered to prevent duplicate registrations
      otpService.markEmailAsRegistered(email)
      
      setSuccess('Registration successful! You can now login with your credentials.')
      
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
          <PersonAdd
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
              🎆 Final Step
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
            maxWidth: 600,
            width: '100%',
          }}
        >
          {/* Mobile Logo - Only show on small screens */}
          <Box sx={{ textAlign: 'center', mb: 4, display: { xs: 'block', md: 'none' } }}>
            <PersonAdd
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

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[800],
                mb: 1,
              }}
            >
              Complete Your Registration
            </Typography>
            <Typography variant="body2" sx={{ color: designTokens.colors.neutral[600] }}>
              Email verified: {email}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  {...register('fullName', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    pattern: {
                      value: /^[a-zA-Z\s]+$/,
                      message: 'Name can only contain letters and spaces',
                    },
                  })}
                  fullWidth
                  label="Full Name"
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: designTokens.borderRadius.md,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('phoneNumber', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Enter valid 10-digit mobile number starting with 6-9',
                    },
                    minLength: { value: 10, message: 'Phone number must be 10 digits' },
                    maxLength: { value: 10, message: 'Phone number must be 10 digits' },
                  })}
                  fullWidth
                  label="Phone Number"
                  type="tel"
                  inputProps={{ maxLength: 10 }}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: designTokens.borderRadius.md,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message: 'Password must contain uppercase, lowercase, number and special character',
                    },
                  })}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isLoading}
                  InputProps={{
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: designTokens.borderRadius.md,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: designTokens.borderRadius.md,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('address', {
                    required: 'Address is required',
                    minLength: { value: 10, message: 'Address must be at least 10 characters' },
                    maxLength: { value: 200, message: 'Address cannot exceed 200 characters' },
                  })}
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: designTokens.borderRadius.md,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('dateOfBirth', { 
                    required: 'Date of birth is required',
                    validate: (value) => {
                      const today = new Date();
                      const birthDate = new Date(value);
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                      
                      if (birthDate > today) return 'Date of birth cannot be in the future';
                      if (age < 18) return 'You must be at least 18 years old';
                      if (age > 100) return 'Please enter a valid date of birth';
                      
                      return true;
                    }
                  })}
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth?.message}
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: designTokens.borderRadius.md,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    {...register('gender', { required: 'Gender is required' })}
                    label="Gender"
                    defaultValue={Gender.Male}
                    disabled={isLoading}
                    sx={{
                      borderRadius: designTokens.borderRadius.md,
                    }}
                  >
                    <MenuItem value={Gender.Male}>Male</MenuItem>
                    <MenuItem value={Gender.Female}>Female</MenuItem>
                    <MenuItem value={Gender.Other}>Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <ProfessionalButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={isLoading}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    mt: 3,
                  }}
                >
                  {isLoading ? 'Creating Account...' : 'Complete Registration'}
                </ProfessionalButton>
              </Grid>
            </Grid>
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

export default CompleteRegistrationPage;
