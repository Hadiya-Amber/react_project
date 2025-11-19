import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { registrationService } from '@/services/registrationService'
import { otpService } from '@/services/otpService'
import { SimpleCustomerRegistrationDto, Gender } from '@/types'
import styles from './CompleteRegistrationPage.module.css';

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
    <Box component="form" onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
      <Typography variant="h6" gutterBottom>
        Complete Your Registration
      </Typography>
      <Typography variant="body2" color="textSecondary" className={styles.emailText}>
        Email verified: {email}
      </Typography>

      {error && <Alert severity="error" className={styles.alertMessage}>{error}</Alert>}
      {success && <Alert severity="success" className={styles.alertMessage}>{success}</Alert>}

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
            >
              <MenuItem value={Gender.Male}>Male</MenuItem>
              <MenuItem value={Gender.Female}>Female</MenuItem>
              <MenuItem value={Gender.Other}>Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Complete Registration'}
      </Button>
    </Box>
  );
};

export default CompleteRegistrationPage;
