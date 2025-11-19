import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Branch, CreateBranchDto, BranchType, branchService } from '@/services/branchService';
import { useNotification } from '@/context/NotificationContext';
import { useAdminDashboard } from '@/context/AdminDashboardContext';
import { adminService } from '@/services/adminService';

interface BranchFormModalProps {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
  onSuccess: () => void;
}

const BranchFormModal: React.FC<BranchFormModalProps> = React.memo(({ open, onClose, branch, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();
  const { getBranchById, loadData } = useAdminDashboard();
  const isEdit = !!branch;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<CreateBranchDto>({
    defaultValues: {
      branchName: '',
      branchCode: '',
      address: '',
      city: '',
      state: '',
      ifscCode: '',
      postalCode: '',
      phoneNumber: '',
      email: '',
      branchType: BranchType.Sub,
      isActive: true,
    },
  });

  const branchId = useMemo(() => branch?.id, [branch?.id]);

  const fetchCompleteData = useCallback(() => {
    if (!branchId) return;
    
    const fullBranch = getBranchById(branchId);
    if (fullBranch) {
      const formData = {
        branchName: fullBranch.branchName || '',
        branchCode: fullBranch.branchCode || '',
        address: fullBranch.address || '',
        city: fullBranch.city || '',
        state: fullBranch.state || '',
        ifscCode: fullBranch.ifscCode || '',
        postalCode: fullBranch.postalCode || '',
        phoneNumber: fullBranch.phoneNumber || '',
        email: fullBranch.email || '',
        branchType: typeof fullBranch.branchType === 'string' ? BranchType.Sub : (fullBranch.branchType ?? BranchType.Sub),
        isActive: fullBranch.isActive ?? true,
      };
      reset(formData);
    } else {
      // Fallback to basic branch data if detailed data not available
      const branchData = branch as any;
      reset({
        branchName: branchData.branchName || '',
        branchCode: branchData.branchCode || '',
        address: branchData.address || '',
        city: branchData.city || '',
        state: branchData.state || '',
        ifscCode: '', 
        postalCode: branchData.postalCode || '',
        phoneNumber: branchData.phoneNumber || '',
        email: branchData.email || '',
        branchType: typeof branchData.branchType === 'string' ? BranchType.Sub : (branchData.branchType ?? BranchType.Sub),
        isActive: branchData.isActive ?? true,
      });
    }
  }, [branchId, branch, reset, getBranchById]);

  useEffect(() => {
    if (open && branch) {
      fetchCompleteData();
    } else if (open && !branch) {
      reset({
        branchName: '',
        branchCode: '',
        address: '',
        city: '',
        state: '',
        ifscCode: '',
        postalCode: '',
        phoneNumber: '',
        email: '',
        branchType: BranchType.Sub,
        isActive: true,
      });
    }
  }, [open, branch, fetchCompleteData, reset]);

  const getBranchTypeLabel = useCallback((type: BranchType): string => {
    switch (type) {
      case BranchType.Main: return 'Main Branch';
      case BranchType.Sub: return 'Sub Branch';
      case BranchType.Regional: return 'Regional Branch';
      default: return 'Sub Branch';
    }
  }, []);

  const onSubmit = useCallback(async (data: CreateBranchDto) => {
    setLoading(true);
    setError('');

    try {
      if (isEdit && branch) {
        await adminService.updateBranch(branch.id, data);
        showNotification('Branch updated successfully', 'success' as any);
        onClose();
      } else {
        await adminService.createBranch(data);
        showNotification('Branch created successfully', 'success' as any);
        // Clear cache to refresh dashboard data
        adminService.clearAdminDashboardCache();
        onSuccess();
        onClose();
      }
    } catch (err) {
      let errorMessage = 'Operation failed';
      if (err instanceof Error) {
        errorMessage = err.message;
        // Handle specific validation errors
        if (errorMessage.includes('Branch code already exists')) {
          errorMessage = 'A branch with this code already exists. Please use a different branch code.';
        } else if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
          errorMessage = 'This branch information already exists. Please check your input and try again.';
        } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
          errorMessage = 'Please check your input data and ensure all required fields are filled correctly.';
        }
      }
      setError(errorMessage);
      showNotification(errorMessage, 'error' as any);
    } finally {
      setLoading(false);
    }
  }, [isEdit, branch, showNotification, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    setError('');
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(async () => {
    if (!branch?.id) return;
    
    if (window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      setLoading(true);
      try {
        await adminService.deleteBranch(branch.id);
        showNotification('Branch deleted successfully', 'success' as any);
        onClose();
        // Navigate back to branches list since branch is deleted
        window.location.href = '/admin/branches';
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete branch';
        showNotification(errorMessage, 'error' as any);
      } finally {
        setLoading(false);
      }
    }
  }, [branch?.id, showNotification, onSuccess, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Branch' : 'Create New Branch'}
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                {...register('branchName', { required: 'Branch name is required' })}
                fullWidth
                label="Branch Name *"
                error={!!errors.branchName}
                helperText={errors.branchName?.message}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                {...register('branchCode', { 
                  required: 'Branch code is required',
                  pattern: {
                    value: /^[A-Z0-9]{3,10}$/,
                    message: 'Branch code must be 3-10 uppercase letters/numbers'
                  }
                })}
                fullWidth
                label="Branch Code *"
                error={!!errors.branchCode}
                helperText={errors.branchCode?.message}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="branchType"
                control={control}
                defaultValue={BranchType.Sub}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.branchType}>
                    <InputLabel>Branch Type</InputLabel>
                    <Select
                      {...field}
                      label="Branch Type"
                    >
                      <MenuItem value={BranchType.Main}>{getBranchTypeLabel(BranchType.Main)}</MenuItem>
                      <MenuItem value={BranchType.Sub}>{getBranchTypeLabel(BranchType.Sub)}</MenuItem>
                      <MenuItem value={BranchType.Regional}>{getBranchTypeLabel(BranchType.Regional)}</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                {...register('address')}
                fullWidth
                label="Address"
                multiline
                rows={2}
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                {...register('city', { required: 'City is required' })}
                fullWidth
                label="City *"
                error={!!errors.city}
                helperText={errors.city?.message}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                {...register('state', { required: 'State is required' })}
                fullWidth
                label="State *"
                error={!!errors.state}
                helperText={errors.state?.message}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                {...register('postalCode', { 
                  required: 'Postal code is required',
                  pattern: {
                    value: /^[1-9][0-9]{5}$/,
                    message: 'Invalid postal code format'
                  }
                })}
                fullWidth
                label="Postal Code *"
                error={!!errors.postalCode}
                helperText={errors.postalCode?.message}
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
                label="Phone Number *"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
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
                label="Email *"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                {...register('ifscCode', { 
                  required: 'IFSC code is required',
                  pattern: {
                    value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                    message: 'Invalid IFSC code format (e.g., SBIN0001234)'
                  }
                })}
                fullWidth
                label="IFSC Code *"
                error={!!errors.ifscCode}
                helperText={errors.ifscCode?.message}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="isActive"
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    }
                    label="Active Branch"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {isEdit && (
          <Button
            onClick={handleDelete}
            color="error"
            disabled={loading}
          >
            Delete
          </Button>
        )}
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default BranchFormModal;
