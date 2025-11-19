import React, { useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      address: '',
    },
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors } } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      showNotification('Profile updated successfully', NotificationType.SUCCESS);
    } catch (err) {
      showNotification('Failed to update profile', NotificationType.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      showNotification('Passwords do not match', NotificationType.ERROR);
      return;
    }
    
    setIsLoading(true);
    try {
      showNotification('Password changed successfully', NotificationType.SUCCESS);
    } catch (err) {
      showNotification('Failed to change password', NotificationType.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>

      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Personal Information" />
            <Tab label="Change Password" />
            <Tab label="Documents" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleSubmit(onProfileSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register('fullName', { required: 'Full name is required' })}
                    fullWidth
                    label="Full Name"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register('email')}
                    fullWidth
                    label="Email"
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register('phoneNumber', { required: 'Phone number is required' })}
                    fullWidth
                    label="Phone Number"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    {...register('address')}
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                  >
                    Update Profile
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                    fullWidth
                    label="Current Password"
                    type="password"
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    {...registerPassword('newPassword', { required: 'New password is required' })}
                    fullWidth
                    label="New Password"
                    type="password"
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    {...registerPassword('confirmPassword', { required: 'Please confirm password' })}
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                  >
                    Change Password
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Upload Documents
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="file"
                  label="Signature"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ accept: 'image/*' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="file"
                  label="Profile Photo"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ accept: 'image/*' }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained">
                  Upload Documents
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
