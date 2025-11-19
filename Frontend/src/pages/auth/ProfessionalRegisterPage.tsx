import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Alert,
  Container,
  Grid,
  Link,
  InputAdornment,
  IconButton,
  alpha,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  AccountBalanceWallet,
  CheckCircle,
  Security,
  Speed,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { designTokens } from '@/theme/designTokens';
import ProfessionalCard from '@/components/ui/ProfessionalCard';
import ProfessionalButton from '@/components/ui/ProfessionalButton';
import ProfessionalBackground from '@/components/ui/ProfessionalBackground';
import FloatingElements from '@/components/ui/FloatingElements';

interface RegisterFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  accountType: string;
  dateOfBirth: string;
  address: string;
}

const ProfessionalRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const steps = ['Personal Info', 'Account Details', 'Security'];

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');

    try {
      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: <Security sx={{ fontSize: 28, color: designTokens.colors.primary[500] }} />,
      title: 'Secure Banking',
      description: 'Bank-grade security with 256-bit encryption',
    },
    {
      icon: <Speed sx={{ fontSize: 28, color: designTokens.colors.secondary[500] }} />,
      title: 'Instant Access',
      description: 'Immediate account activation and access',
    },
    {
      icon: <CheckCircle sx={{ fontSize: 28, color: designTokens.colors.success[500] }} />,
      title: 'No Hidden Fees',
      description: 'Transparent pricing with no surprises',
    },
  ];

  return (
    <ProfessionalBackground variant="auth">
      <Container maxWidth="xl" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4, pt: 12 }}>
        <FloatingElements />
        
        <Grid container spacing={6} alignItems="center" sx={{ position: 'relative', zIndex: 2 }}>
          {/* Left Side - Branding & Benefits */}
          <Grid item xs={12} lg={5}>
            <Box sx={{ pr: { lg: 4 } }}>
              {/* Logo & Brand */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <AccountBalanceWallet 
                  sx={{ 
                    fontSize: 48, 
                    color: '#FFFFFF',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                    mr: 2 
                  }} 
                />
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      color: '#FFFFFF',
                      fontWeight: designTokens.typography.fontWeight.bold,
                      fontFamily: designTokens.typography.fontFamily.primary,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    Perfect Bank
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: alpha('#FFFFFF', 0.9),
                      fontFamily: designTokens.typography.fontFamily.primary,
                    }}
                  >
                    Join Thousands of Happy Customers
                  </Typography>
                </Box>
              </Box>

              {/* Welcome Message */}
              <Typography
                variant="h4"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  mb: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Start Your Banking Journey
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: alpha('#FFFFFF', 0.9),
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Create your account in minutes and experience the future of digital banking.
              </Typography>

              {/* Benefits */}
              <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                {benefits.map((benefit, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 3,
                      p: 2,
                      borderRadius: designTokens.borderRadius.lg,
                      background: alpha('#FFFFFF', 0.1),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                    }}
                  >
                    <Box sx={{ mr: 3 }}>{benefit.icon}</Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#FFFFFF',
                          fontWeight: designTokens.typography.fontWeight.semibold,
                          mb: 0.5,
                        }}
                      >
                        {benefit.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: alpha('#FFFFFF', 0.8),
                        }}
                      >
                        {benefit.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Registration Form */}
          <Grid item xs={12} lg={7}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ProfessionalCard
                variant="glass"
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  p: 4,
                  background: alpha('#FFFFFF', 0.95),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha('#FFFFFF', 0.3)}`,
                }}
              >
                {/* Form Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: designTokens.typography.fontWeight.bold,
                      color: designTokens.colors.neutral[800],
                      mb: 1,
                    }}
                  >
                    Create Account
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: designTokens.colors.neutral[600],
                    }}
                  >
                    Fill in your details to get started
                  </Typography>
                </Box>

                {/* Progress Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

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

                {/* Registration Form */}
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
                    {/* Personal Information */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('fullName', { required: 'Full name is required' })}
                        fullWidth
                        label="Full Name"
                        error={!!errors.fullName}
                        helperText={errors.fullName?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: designTokens.colors.primary[400] }} />
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

                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email format'
                          }
                        })}
                        fullWidth
                        label="Email Address"
                        type="email"
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
                          '& .MuiOutlinedInput-root': {
                            borderRadius: designTokens.borderRadius.md,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('phoneNumber', { required: 'Phone number is required' })}
                        fullWidth
                        label="Phone Number"
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: designTokens.colors.primary[400] }} />
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

                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('dateOfBirth', { required: 'Date of birth is required' })}
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.dateOfBirth}
                        helperText={errors.dateOfBirth?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: designTokens.borderRadius.md,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        {...register('address', { required: 'Address is required' })}
                        fullWidth
                        label="Address"
                        multiline
                        rows={2}
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: designTokens.borderRadius.md,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        {...register('accountType', { required: 'Account type is required' })}
                        fullWidth
                        select
                        label="Account Type"
                        error={!!errors.accountType}
                        helperText={errors.accountType?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: designTokens.borderRadius.md,
                          },
                        }}
                      >
                        <MenuItem value="savings">Savings Account</MenuItem>
                        <MenuItem value="current">Current Account</MenuItem>
                        <MenuItem value="business">Business Account</MenuItem>
                      </TextField>
                    </Grid>

                    {/* Password Fields */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters'
                          }
                        })}
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
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
                          '& .MuiOutlinedInput-root': {
                            borderRadius: designTokens.borderRadius.md,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: value => value === password || 'Passwords do not match'
                        })}
                        fullWidth
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: designTokens.colors.primary[400] }} />
                            </InputAdornment>
                          ),
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
                  </Grid>

                  <ProfessionalButton
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      mt: 4,
                      mb: 3,
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </ProfessionalButton>

                  {/* Login Link */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: designTokens.colors.neutral[600] }}>
                      Already have an account?{' '}
                      <Link
                        onClick={() => navigate('/login')}
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
                        Sign In
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </ProfessionalCard>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </ProfessionalBackground>
  );
};

export default ProfessionalRegisterPage;