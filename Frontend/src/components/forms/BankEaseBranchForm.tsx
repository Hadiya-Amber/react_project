import { memo, startTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
} from '@mui/material'
import { BankEaseFormField } from './BankEaseFormField'
import { branchSchema, type BranchFormData } from '@/validation/accountValidation'

interface BankEaseBranchFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: BranchFormData) => Promise<void>
  initialData?: Partial<BranchFormData>
  title?: string
  isLoading?: boolean
  error?: string
}

export const BankEaseBranchForm = memo(({
  open,
  onClose,
  onSubmit,
  initialData,
  title = 'Add Branch',
  isLoading = false,
  error
}: BankEaseBranchFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    mode: 'onChange',
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      postalCode: initialData?.postalCode || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      type: initialData?.type || 'sub',
      isActive: initialData?.isActive ?? true,
      ifscCode: initialData?.ifscCode || '',
    }
  })

  const handleFormSubmit = async (data: BranchFormData) => {
    startTransition(async () => {
      try {
        await onSubmit(data)
        reset()
        onClose()
      } catch (error) {
        // Error handled by parent
      }
    })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <BankEaseFormField
                name="name"
                control={control}
                label="Branch Name"
                disabled={isLoading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <BankEaseFormField
                name="code"
                control={control}
                label="Branch Code"
                disabled={isLoading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Branch Type</InputLabel>
                <Select
                  value={watch('type')}
                  label="Branch Type"
                  onChange={(e) => setValue('type', e.target.value as 'main' | 'regional' | 'sub')}
                  disabled={isLoading}
                  error={!!errors.type}
                >
                  <MenuItem value="main">Main Branch</MenuItem>
                  <MenuItem value="regional">Regional Branch</MenuItem>
                  <MenuItem value="sub">Sub Branch</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <BankEaseFormField
                name="address"
                control={control}
                label="Address"
                multiline
                rows={2}
                disabled={isLoading}
                required
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
            
            <Grid item xs={12} md={6}>
              <BankEaseFormField
                name="phone"
                control={control}
                label="Phone Number"
                disabled={isLoading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <BankEaseFormField
                name="email"
                control={control}
                label="Email"
                type="email"
                disabled={isLoading}
                required
              />
            </Grid>
            
            {!initialData && (
              <Grid item xs={12} md={6}>
                <BankEaseFormField
                  name="ifscCode"
                  control={control}
                  label="IFSC Code"
                  placeholder="e.g., SBIN0001234"
                  disabled={isLoading}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={watch('isActive')}
                    onChange={(e) => setValue('isActive', e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="Active Branch"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !isValid}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
})

BankEaseBranchForm.displayName = 'BankEaseBranchForm'
