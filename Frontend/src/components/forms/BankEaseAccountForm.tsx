import { memo, startTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Step,
  Stepper,
  StepLabel,
} from '@mui/material'
import { BankEaseFormField } from './BankEaseFormField'
import { createAccountSchema, type CreateAccountFormData } from '@/validation/accountValidation'
import { AccountType } from '@/types/account'

interface BankEaseAccountFormProps {
  onSubmit: (data: CreateAccountFormData) => Promise<void>
  isLoading?: boolean
  error?: string
  branches?: Array<{ id: number; name: string; code: string }>
}

const steps = ['Account Details', 'Personal Information', 'Contact Information', 'Verification']

export const BankEaseAccountForm = memo(({
  onSubmit,
  isLoading = false,
  error,
  branches = []
}: BankEaseAccountFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    mode: 'onChange',
    defaultValues: {
      accountType: AccountType.SAVINGS,
      initialDeposit: 1000,
      purpose: '',
      branchId: 0,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      occupation: '',
      monthlyIncome: undefined,
      emergencyContactName: '',
      emergencyContactPhone: '',
      alternateContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      termsAndConditionsAccepted: false,
      privacyPolicyAccepted: false,
      antiMoneyLaunderingConsent: false,
    }
  })

  const handleFormSubmit = async (data: CreateAccountFormData) => {
    startTransition(async () => {
      try {
        await onSubmit(data)
      } catch (error) {
        // Error handled by parent
      }
    })
  }

  return (
    <Box sx={{ 
      maxWidth: { xs: '100%', sm: 600, md: 800 }, 
      mx: 'auto', 
      p: { xs: 1, sm: 2, md: 3 } 
    }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Create New Account
      </Typography>
      
      <Stepper 
        activeStep={0} 
        sx={{ 
          mb: { xs: 2, sm: 3, md: 4 },
          '& .MuiStepLabel-label': {
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
          },
        }}
        orientation={{ xs: 'vertical', sm: 'horizontal' }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Account Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={watch('accountType')}
                    label="Account Type"
                    onChange={(e) => setValue('accountType', e.target.value as AccountType)}
                    disabled={isLoading}
                    error={!!errors.accountType}
                  >
                    <MenuItem value={AccountType.SAVINGS}>Savings Account</MenuItem>
                    <MenuItem value={AccountType.CURRENT}>Current Account</MenuItem>
                    <MenuItem value={AccountType.FIXED_DEPOSIT}>Fixed Deposit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <BankEaseFormField
                  name="initialDeposit"
                  control={control}
                  label="Initial Deposit (₹)"
                  type="number"
                  disabled={isLoading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <BankEaseFormField
                  name="purpose"
                  control={control}
                  label="Account Purpose"
                  disabled={isLoading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Branch</InputLabel>
                  <Select
                    value={watch('branchId')}
                    label="Branch"
                    onChange={(e) => setValue('branchId', Number(e.target.value))}
                    disabled={isLoading}
                    error={!!errors.branchId}
                  >
                    {branches.map((branch) => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Address Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <BankEaseFormField
                  name="addressLine1"
                  control={control}
                  label="Address Line 1"
                  disabled={isLoading}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <BankEaseFormField
                  name="addressLine2"
                  control={control}
                  label="Address Line 2 (Optional)"
                  disabled={isLoading}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <BankEaseFormField
                  name="city"
                  control={control}
                  label="City"
                  disabled={isLoading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <BankEaseFormField
                  name="state"
                  control={control}
                  label="State"
                  disabled={isLoading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <BankEaseFormField
                  name="postalCode"
                  control={control}
                  label="Postal Code"
                  disabled={isLoading}
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Personal & Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <BankEaseFormField
                  name="occupation"
                  control={control}
                  label="Occupation"
                  disabled={isLoading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <BankEaseFormField
                  name="monthlyIncome"
                  control={control}
                  label="Monthly Income (₹)"
                  type="number"
                  disabled={isLoading}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <BankEaseFormField
                  name="emergencyContactName"
                  control={control}
                  label="Emergency Contact Name"
                  disabled={isLoading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <BankEaseFormField
                  name="emergencyContactPhone"
                  control={control}
                  label="Emergency Contact Phone"
                  disabled={isLoading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <BankEaseFormField
                  name="alternateContactPhone"
                  control={control}
                  label="Alternate Contact Phone"
                  disabled={isLoading}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Identity Verification
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>ID Proof Type</InputLabel>
                  <Select
                    value={watch('idProofType')}
                    label="ID Proof Type"
                    onChange={(e) => setValue('idProofType', e.target.value)}
                    disabled={isLoading}
                    error={!!errors.idProofType}
                  >
                    <MenuItem value="aadhar">Aadhar Card</MenuItem>
                    <MenuItem value="pan">PAN Card</MenuItem>
                    <MenuItem value="passport">Passport</MenuItem>
                    <MenuItem value="driving_license">Driving License</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <BankEaseFormField
                  name="idProofNumber"
                  control={control}
                  label="ID Proof Number"
                  disabled={isLoading}
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Terms & Conditions
            </Typography>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={watch('termsAndConditionsAccepted')}
                    onChange={(e) => setValue('termsAndConditionsAccepted', e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="I accept the Terms and Conditions"
              />
              {errors.termsAndConditionsAccepted && (
                <Typography variant="caption" color="error" display="block">
                  {errors.termsAndConditionsAccepted.message}
                </Typography>
              )}
            </Box>
            
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={watch('privacyPolicyAccepted')}
                    onChange={(e) => setValue('privacyPolicyAccepted', e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="I accept the Privacy Policy"
              />
              {errors.privacyPolicyAccepted && (
                <Typography variant="caption" color="error" display="block">
                  {errors.privacyPolicyAccepted.message}
                </Typography>
              )}
            </Box>
            
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={watch('antiMoneyLaunderingConsent')}
                    onChange={(e) => setValue('antiMoneyLaunderingConsent', e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="I consent to Anti-Money Laundering verification"
              />
              {errors.antiMoneyLaunderingConsent && (
                <Typography variant="caption" color="error" display="block">
                  {errors.antiMoneyLaunderingConsent.message}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading || !isValid}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
            sx={{ minWidth: 200 }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Box>
      </form>
    </Box>
  )
})

BankEaseAccountForm.displayName = 'BankEaseAccountForm'
