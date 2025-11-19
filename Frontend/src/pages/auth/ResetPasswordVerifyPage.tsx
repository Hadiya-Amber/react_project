import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import api from '@/api/axios';
import { OtpPurpose } from '@/types/otp';

const ResetPasswordVerifyPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ otpCode: string }>();

  const onSubmit = async (data: { otpCode: string }) => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('otpCode', data.otpCode);
      formData.append('purpose', OtpPurpose.PasswordReset.toString());

      const response = await api.post('/password-reset/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        navigate('/reset-password/new', { state: { email } });
      } else {
        setError(response.data.message || 'Invalid reset code');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid reset code');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Verify Reset Code
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Enter the 6-digit code sent to {email}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        {...register('otpCode', {
          required: 'Reset code is required',
          pattern: {
            value: /^\d{6}$/,
            message: 'Reset code must be 6 digits',
          },
        })}
        fullWidth
        label="Enter 6-digit Reset Code"
        type="text"
        inputProps={{ maxLength: 6 }}
        margin="normal"
        error={!!errors.otpCode}
        helperText={errors.otpCode?.message}
        disabled={isLoading}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Verify Code'}
      </Button>

      <Box textAlign="center">
        <Button
          variant="text"
          onClick={() => navigate('/forgot-password')}
          disabled={isLoading}
        >
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default ResetPasswordVerifyPage;
