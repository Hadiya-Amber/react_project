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

interface ResetPasswordForm {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('code', data.code);
      formData.append('newPassword', data.newPassword);

      const response = await api.post('/password-reset/reset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Reset Password
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Enter the reset code sent to {email} and your new password
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TextField
        {...register('code', {
          required: 'Reset code is required',
          minLength: {
            value: 6,
            message: 'Reset code must be at least 6 characters',
          },
        })}
        fullWidth
        label="Reset Code"
        margin="normal"
        error={!!errors.code}
        helperText={errors.code?.message}
        disabled={isLoading}
      />

      <TextField
        {...register('newPassword', {
          required: 'New password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        })}
        fullWidth
        label="New Password"
        type="password"
        margin="normal"
        error={!!errors.newPassword}
        helperText={errors.newPassword?.message}
        disabled={isLoading}
      />

      <TextField
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (value) =>
            value === newPassword || 'Passwords do not match',
        })}
        fullWidth
        label="Confirm New Password"
        type="password"
        margin="normal"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        disabled={isLoading}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
      </Button>

      <Box textAlign="center">
        <Button
          variant="text"
          onClick={() => navigate('/login')}
          disabled={isLoading}
        >
          Back to Login
        </Button>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
