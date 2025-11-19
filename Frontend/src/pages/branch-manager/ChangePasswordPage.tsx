import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService, ChangePasswordDto } from '@/services/authService';
import { NotificationType } from '@/types/notification';
import { useNotification } from '@/context/NotificationContext';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ChangePasswordDto>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordDto) => {
    setLoading(true);
    setError('');

    try {
      await authService.changePassword(data);
      setSuccess(true);
      showNotification('Password changed successfully!', NotificationType.SUCCESS);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password change failed';
      setError(errorMessage);
      showNotification(errorMessage, NotificationType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Change Password
      </Typography>
      
      <Box display="flex" justifyContent="center" mt={4}>
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>Password changed successfully!</Alert>}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                {...register('currentPassword', { required: 'Current password is required' })}
                fullWidth
                label="Current Password"
                type="password"
                margin="normal"
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message}
              />

              <TextField
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                fullWidth
                label="New Password"
                type="password"
                margin="normal"
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
              />

              <TextField
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === newPassword || 'Passwords do not match'
                })}
                fullWidth
                label="Confirm New Password"
                type="password"
                margin="normal"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ChangePasswordPage;
