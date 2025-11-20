import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreateEmployeeDto, UserRole, Gender } from '@/services/userService';
import { adminService } from '@/services/adminService';
import { Branch } from '@/services/branchService';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';
import { useAdminDashboard } from '@/context/AdminDashboardContext';

const CreateBranchManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [tempPassword, setTempPassword] = useState<string>('');
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [hasTriedSeparateFetch, setHasTriedSeparateFetch] = useState(false);
  
  // Get admin dashboard data
  const adminDashboardData = useAdminDashboard();
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesWithManagers, setBranchesWithManagers] = useState<Set<number>>(new Set());
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateEmployeeDto>({
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      gender: Gender.Male,
      branchId: location.state?.branchId || '',
      role: UserRole.BranchManager,
      designation: 'Branch Manager',
      joinDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    // Pre-select branch if coming from branch details
    if (location.state?.branchId) {
      setValue('branchId', location.state.branchId);
    }
  }, [location.state, setValue]);

  // Use consolidated data when available
  useEffect(() => {
    if (adminDashboardData.data?.branches && adminDashboardData.data.branchManagerStatuses) {
      // Using consolidated data - no separate API calls needed
      setBranches(adminDashboardData.data.branches);
      
      const managersSet = new Set<number>();
      adminDashboardData.data.branchManagerStatuses.forEach((status: any) => {
        if (status.hasBranchManager) {
          managersSet.add(status.branchId);
        }
      });
      setBranchesWithManagers(managersSet);
      setBranchesLoading(false);
    } else {
      // Keep loading state while waiting for consolidated data
      setBranchesLoading(adminDashboardData.loading);
    }
  }, [adminDashboardData.data, adminDashboardData.loading]);



  const onSubmit = async (data: CreateEmployeeDto) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    setTempPassword('');

    try {
      const result = await adminService.createBranchManager(data);
      setSuccess('Branch Manager created successfully!');
      setTempPassword(result.tempPassword || '');
      showNotification('Branch Manager created and email sent with login details', NotificationType.SUCCESS);
      
      // Don't auto-navigate, let admin copy the password
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create branch manager';
      setError(errorMessage);
      showNotification(errorMessage, NotificationType.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {location.state?.branchName ? `Assign Manager to ${location.state.branchName}` : 'Create Branch Manager'}
      </Typography>
      
      {location.state?.branchName && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You are assigning a branch manager to <strong>{location.state.branchName}</strong>
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
                {tempPassword && (
                  <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      🔑 Temporary Login Credentials
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                      Password: {tempPassword}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      ✉️ An email with these login details has been sent to the branch manager.
                    </Typography>
                    <Typography variant="caption" color="warning.main" display="block">
                      ⚠️ They must change this password on first login.
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(tempPassword);
                        showNotification('Password copied to clipboard', NotificationType.INFO);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Copy Password
                    </Button>
                  </Box>
                )}
              </Alert>
            )}

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
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email format'
                    }
                  })}
                  fullWidth
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('phoneNumber', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Invalid Indian mobile number'
                    }
                  })}
                  fullWidth
                  label="Phone Number"
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    {...register('gender', { required: 'Gender is required' })}
                    label="Gender"
                    defaultValue={Gender.Male}
                    error={!!errors.gender}
                  >
                    <MenuItem value={Gender.Male}>Male</MenuItem>
                    <MenuItem value={Gender.Female}>Female</MenuItem>
                    <MenuItem value={Gender.Other}>Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('dateOfBirth', { required: 'Date of birth is required' })}
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="branchId"
                  control={control}
                  rules={{ required: 'Branch selection is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.branchId}>
                      <InputLabel>Branch</InputLabel>
                      <Select
                        {...field}
                        label="Branch"
                        disabled={branchesLoading}
                      >
                        {branchesLoading ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Loading branches...
                          </MenuItem>
                        ) : (
                          branches.map((branch) => {
                            const hasManager = branchesWithManagers.has(branch.id);
                            return (
                              <MenuItem 
                                key={branch.id} 
                                value={branch.id}
                                disabled={hasManager}
                              >
                                {branch.branchName} - {branch.city}
                                {hasManager && ' (Manager Assigned)'}
                              </MenuItem>
                            );
                          })
                        )}
                      </Select>
                      {errors.branchId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                          {errors.branchId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('designation', { required: 'Designation is required' })}
                  fullWidth
                  label="Designation"
                  defaultValue="Branch Manager"
                  error={!!errors.designation}
                  helperText={errors.designation?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('joinDate')}
                  fullWidth
                  label="Join Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('address')}
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                  >
                    {success ? 'Done' : 'Cancel'}
                  </Button>
                  {!success && (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={20} /> : null}
                    >
                      {isLoading ? 'Creating...' : 'Create Branch Manager'}
                    </Button>
                  )}
                  {success && (
                    <Button
                      variant="contained"
                      onClick={() => window.location.reload()}
                    >
                      Create Another
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateBranchManagerPage;
