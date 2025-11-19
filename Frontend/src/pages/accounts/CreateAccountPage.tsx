import React, { useState, useEffect, useCallback } from 'react';
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
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { accountService } from '@/services/accountService';
import { branchService, Branch } from '@/services/branchService';
import { CreateAccountDto, AccountType, EmploymentType, EmploymentTypeLabels, IdProofType, IdProofTypeLabels, IdProofValidation } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useCustomer } from '@/context/CustomerContext';
import { getErrorMessage } from '@/utils/errorHandler';
import { showGlobalError } from '@/utils/globalErrorHandler';
import api from '@/api/axios';

const CreateAccountPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>(() => {
    // Try to load from cache immediately
    const cached = sessionStorage.getItem('branches');
    const cacheTime = sessionStorage.getItem('branchesTimestamp');
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 600000) {
      return JSON.parse(cached).filter((b: Branch) => b.isActive);
    }
    return [];
  });
  const [loadingBranches, setLoadingBranches] = useState(() => {
    // Only show loading if no cache available
    const cached = sessionStorage.getItem('branches');
    const cacheTime = sessionStorage.getItem('branchesTimestamp');
    return !(cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 600000);
  });
  const [selectedIdProofType, setSelectedIdProofType] = useState<IdProofType>(IdProofType.Aadhaar);
  const [userAge, setUserAge] = useState<number | null>(null);
  
  // Try to get customer data if available
  let customerData = null;
  try {
    customerData = useCustomer();
  } catch {
    // Not in customer context, ignore
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      accountType: AccountType.Savings,
      initialDeposit: 100,
      purpose: '',
      branchId: 0,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      occupation: EmploymentType.Employed,
      monthlyIncome: 0,
      emergencyContactName: '',
      emergencyContactPhone: '',
      alternateContactPhone: '',
      idProofType: IdProofType.Aadhaar,
      idProofNumber: '',
      termsAndConditionsAccepted: false,
      privacyPolicyAccepted: false,
      antiMoneyLaunderingConsent: false,
    },
  });

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const allBranches = await branchService.getAllBranches();
      const activeBranches = allBranches.filter(branch => branch.isActive);
      setBranches(activeBranches);
    } catch (error) {
      showGlobalError('Unable to load branches. Using default branch.');
      setBranches([{
        id: 1,
        branchName: 'Main Branch',
        city: 'Default',
        branchCode: 'MAIN',
        branchType: 0,
        isMainBranch: true,
        state: '',
        phoneNumber: '',
        email: '',
        isActive: true,
        address: '',
        postalCode: '',
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    // Only fetch if no branches loaded from cache
    if (branches.length === 0) {
      fetchBranches();
    }
  }, []); // Empty dependency array to run only once

  const fetchUserProfile = useCallback(async () => {
    // Use consolidated customer data if available
    if (customerData?.data?.minorAccountCheck && !customerData.loading) {
      setUserAge(customerData.data.minorAccountCheck.userAge);
      return;
    }
    
    // Check cached profile data
    const cachedProfile = sessionStorage.getItem('userProfile');
    const cacheTime = sessionStorage.getItem('userProfileTimestamp');
    const now = Date.now();
    
    if (cachedProfile && cacheTime && (now - parseInt(cacheTime)) < 300000) {
      const profile = JSON.parse(cachedProfile);
      if (profile.dateOfBirth) {
        const birthDate = new Date(profile.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          setUserAge(age - 1);
        } else {
          setUserAge(age);
        }
      }
      return;
    }
    
    // Fallback to API call
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success && response.data.data.dateOfBirth) {
        const profileData = response.data.data;
        sessionStorage.setItem('userProfile', JSON.stringify(profileData));
        sessionStorage.setItem('userProfileTimestamp', now.toString());
        
        const birthDate = new Date(profileData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          setUserAge(age - 1);
        } else {
          setUserAge(age);
        }
      }
    } catch (err) {
      showGlobalError('Unable to load profile data. Some features may be limited.');
    }
  }, [customerData?.data, customerData?.loading]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  // Watch for ID proof type changes
  const watchedIdProofType = watch('idProofType');
  useEffect(() => {
    if (watchedIdProofType !== undefined) {
      setSelectedIdProofType(watchedIdProofType);
    }
  }, [watchedIdProofType]);

  const onSubmit = useCallback(async (data: any) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Frontend validation before API call
      if (!data.idProofDocument || data.idProofDocument.length === 0) {
        throw new Error('ID proof document is required');
      }
      
      // Validate file size (max 5MB)
      if (data.idProofDocument[0]?.size > 5 * 1024 * 1024) {
        throw new Error('ID proof document must be less than 5MB');
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(data.idProofDocument[0]?.type)) {
        throw new Error('ID proof document must be PDF, JPG, or PNG format');
      }
      
      // Validate all required checkboxes
      if (!data.termsAndConditionsAccepted) {
        throw new Error('You must accept the terms and conditions');
      }
      if (!data.privacyPolicyAccepted) {
        throw new Error('You must accept the privacy policy');
      }
      if (!data.antiMoneyLaunderingConsent) {
        throw new Error('You must provide anti-money laundering consent');
      }

      // Convert form data to proper format
      const formData: CreateAccountDto = {
        ...data,
        // Convert checkbox values to proper booleans
        termsAndConditionsAccepted: !!data.termsAndConditionsAccepted,
        privacyPolicyAccepted: !!data.privacyPolicyAccepted,
        antiMoneyLaunderingConsent: !!data.antiMoneyLaunderingConsent,
        // Convert ID proof type enum to string
        idProofType: IdProofTypeLabels[data.idProofType as IdProofType] || 'Aadhaar Card',
        // Handle file uploads
        idProofDocument: data.idProofDocument[0],
        incomeProofDocument: data.incomeProofDocument?.[0] || undefined,
      };

      await accountService.createAccount(formData);
      setSuccess('Account creation request submitted successfully! It will be reviewed by our team.');
      setTimeout(() => {
        navigate('/accounts');
      }, 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Account
      </Typography>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={3}>
              {/* Account Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Account Type *</InputLabel>
                  <Select
                    {...register('accountType', { required: 'Account type is required' })}
                    label="Account Type *"
                    defaultValue={AccountType.Savings}
                    error={!!errors.accountType}
                  >
                    <MenuItem value={AccountType.Savings}>Savings Account</MenuItem>
                    <MenuItem value={AccountType.Current}>Current Account</MenuItem>
                    <MenuItem value={AccountType.Minor} disabled={userAge !== null && userAge >= 18}>
                      Minor Account {userAge !== null && userAge >= 18 && '(Not available - Age 18+)'}
                    </MenuItem>
                    <MenuItem value={AccountType.Major}>Major Account</MenuItem>

                  </Select>
                  {errors.accountType && (
                    <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {errors.accountType.message as string}
                    </Typography>
                  )}
                </FormControl>
                {userAge !== null && userAge >= 18 && (
                  <Typography variant="caption" color="info.main" sx={{ mt: 1, display: 'block' }}>
                    Note: Minor accounts are only available for customers under 18 years of age. Your current age: {userAge} years.
                  </Typography>
                )}
              </Grid>

              {/* Initial Deposit */}
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('initialDeposit', {
                    required: 'Initial deposit is required',
                    min: { value: 100, message: 'Minimum deposit is ₹100' },
                    max: { value: 10000000, message: 'Maximum deposit is ₹1,00,00,000' },
                    validate: (value) => {
                      if (value < 100) return 'Minimum deposit is ₹100';
                      if (value > 10000000) return 'Maximum deposit is ₹1,00,00,000';
                      return true;
                    }
                  })}
                  fullWidth
                  label="Initial Deposit (₹) *"
                  type="number"
                  inputProps={{ min: 100, max: 10000000 }}
                  error={!!errors.initialDeposit}
                  helperText={(errors.initialDeposit?.message as string) || 'Minimum: ₹100, Maximum: ₹1,00,00,000'}
                />
              </Grid>

              {/* Purpose */}
              <Grid item xs={12}>
                <TextField
                  {...register('purpose', { required: 'Purpose is required' })}
                  fullWidth
                  label="Purpose of Account *"
                  multiline
                  rows={2}
                  error={!!errors.purpose}
                  helperText={errors.purpose?.message as string}
                />
              </Grid>

              {/* Address Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Address Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('addressLine1', { required: 'Address is required' })}
                  fullWidth
                  label="Address Line 1 *"
                  error={!!errors.addressLine1}
                  helperText={errors.addressLine1?.message as string}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('addressLine2')}
                  fullWidth
                  label="Address Line 2 (Optional)"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  {...register('city', { required: 'City is required' })}
                  fullWidth
                  label="City *"
                  error={!!errors.city}
                  helperText={errors.city?.message as string}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  {...register('state', { required: 'State is required' })}
                  fullWidth
                  label="State *"
                  error={!!errors.state}
                  helperText={errors.state?.message as string}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  {...register('postalCode', {
                    required: 'Postal code is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Postal code must be 6 digits'
                    }
                  })}
                  fullWidth
                  label="Postal Code *"
                  inputProps={{ maxLength: 6 }}
                  error={!!errors.postalCode}
                  helperText={(errors.postalCode?.message as string) || 'Enter 6-digit postal code'}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('country', { required: 'Country is required' })}
                  fullWidth
                  label="Country *"
                  defaultValue="India"
                  error={!!errors.country}
                  helperText={errors.country?.message as string}
                />
              </Grid>

              {/* Branch Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.branchId}>
                  <InputLabel>Select Branch *</InputLabel>
                  <Select
                    {...register('branchId', { required: 'Branch selection is required' })}
                    label="Select Branch *"
                    disabled={loadingBranches}
                  >
                    {loadingBranches ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading branches...
                      </MenuItem>
                    ) : (
                      branches.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id}>
                          {branch.branchName} - {branch.city}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.branchId && (
                    <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {errors.branchId.message as string}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Employment Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Employment Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.occupation}>
                  <InputLabel>Occupation *</InputLabel>
                  <Select
                    {...register('occupation', { required: 'Occupation is required' })}
                    label="Occupation *"
                    defaultValue={EmploymentType.Employed}
                  >
                    {Object.entries(EmploymentTypeLabels).map(([value, label]) => (
                      <MenuItem key={value} value={Number(value)}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.occupation && (
                    <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {errors.occupation.message as string}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('monthlyIncome')}
                  fullWidth
                  label="Monthly Income (₹)"
                  type="number"
                />
              </Grid>

              {/* Emergency Contact */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Emergency Contact
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('emergencyContactName', { required: 'Emergency contact name is required' })}
                  fullWidth
                  label="Emergency Contact Name *"
                  error={!!errors.emergencyContactName}
                  helperText={errors.emergencyContactName?.message as string}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('emergencyContactPhone', {
                    required: 'Emergency contact phone is required',
                    pattern: {
                      value: /^(\+91|91)?[6-9]\d{9}$/,
                      message: 'Enter valid 10-digit mobile number starting with 6-9'
                    }
                  })}
                  fullWidth
                  label="Emergency Contact Phone *"
                  inputProps={{ maxLength: 13 }}
                  error={!!errors.emergencyContactPhone}
                  helperText={(errors.emergencyContactPhone?.message as string) || 'Enter 10-digit mobile number'}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('alternateContactPhone')}
                  fullWidth
                  label="Alternate Contact Phone (Optional)"
                />
              </Grid>

              {/* ID Proof */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Identity Verification
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.idProofType}>
                  <InputLabel>ID Proof Type *</InputLabel>
                  <Select
                    {...register('idProofType', { required: 'ID proof type is required' })}
                    label="ID Proof Type *"
                    defaultValue={IdProofType.Aadhaar}
                  >
                    {Object.entries(IdProofTypeLabels).map(([value, label]) => (
                      <MenuItem key={value} value={Number(value)}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.idProofType && (
                    <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {errors.idProofType.message as string}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('idProofNumber', {
                    required: 'ID proof number is required',
                    pattern: {
                      value: IdProofValidation[selectedIdProofType]?.pattern,
                      message: IdProofValidation[selectedIdProofType]?.message
                    }
                  })}
                  fullWidth
                  label="ID Proof Number *"
                  placeholder={IdProofValidation[selectedIdProofType]?.placeholder}
                  error={!!errors.idProofNumber}
                  helperText={(errors.idProofNumber?.message as string) || IdProofValidation[selectedIdProofType]?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('idProofDocument', { required: 'ID proof document is required' })}
                  fullWidth
                  type="file"
                  label="ID Proof Document *"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ accept: '.pdf,.jpg,.jpeg,.png' }}
                  error={!!errors.idProofDocument}
                  helperText={(errors.idProofDocument?.message as string) || 'Upload PDF, JPG, or PNG file'}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('incomeProofDocument')}
                  fullWidth
                  type="file"
                  label="Income Proof Document (Optional)"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ accept: '.pdf,.jpg,.jpeg,.png' }}
                  helperText="Upload salary slip, ITR, or other income proof"
                />
              </Grid>

              {/* Terms and Conditions */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Terms and Conditions
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register('termsAndConditionsAccepted', { required: 'You must accept terms and conditions' })}
                    />
                  }
                  label="I accept the Terms and Conditions"
                />
                {errors.termsAndConditionsAccepted && (
                  <Typography color="error" variant="caption" display="block">
                    {errors.termsAndConditionsAccepted.message as string}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register('privacyPolicyAccepted', { required: 'You must accept privacy policy' })}
                    />
                  }
                  label="I accept the Privacy Policy"
                />
                {errors.privacyPolicyAccepted && (
                  <Typography color="error" variant="caption" display="block">
                    {errors.privacyPolicyAccepted.message as string}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register('antiMoneyLaunderingConsent', { required: 'AML consent is required' })}
                    />
                  }
                  label="I consent to Anti-Money Laundering checks"
                />
                {errors.antiMoneyLaunderingConsent && (
                  <Typography color="error" variant="caption" display="block">
                    {errors.antiMoneyLaunderingConsent.message as string}
                  </Typography>
                )}
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
});

export default CreateAccountPage;
