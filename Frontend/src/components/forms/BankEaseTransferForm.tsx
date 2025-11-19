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
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material'
import { Send, AccountBalance } from '@mui/icons-material'
import { BankEaseFormField } from './BankEaseFormField'
import { transferSchema, type TransferFormData } from '@/validation/accountValidation'

interface BankEaseTransferFormProps {
  onSubmit: (data: TransferFormData) => Promise<void>
  isLoading?: boolean
  error?: string
  accounts?: Array<{ id: string; accountNumber: string; balance: number; type: string }>
}

export const BankEaseTransferForm = memo(({
  onSubmit,
  isLoading = false,
  error,
  accounts = []
}: BankEaseTransferFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    mode: 'onChange',
    defaultValues: {
      fromAccountId: '',
      toAccountNumber: '',
      amount: 0,
      description: '',
    }
  })

  const selectedAccount = accounts.find(acc => acc.id === watch('fromAccountId'))

  const handleFormSubmit = async (data: TransferFormData) => {
    startTransition(async () => {
      try {
        await onSubmit(data)
        reset()
      } catch (error) {
        // Error handled by parent
      }
    })
  }

  return (
    <Box sx={{ 
      maxWidth: { xs: '100%', sm: 500, md: 600 }, 
      mx: 'auto', 
      p: { xs: 1, sm: 2, md: 3 } 
    }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Send sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Transfer Money
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transfer Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>From Account</InputLabel>
                  <Select
                    value={watch('fromAccountId')}
                    label="From Account"
                    onChange={(e) => setValue('fromAccountId', e.target.value)}
                    disabled={isLoading}
                    error={!!errors.fromAccountId}
                  >
                    {accounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        <Box>
                          <Typography variant="body1">
                            {account.accountNumber} ({account.type})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Balance: ₹{account.balance.toLocaleString()}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.fromAccountId && (
                    <Typography variant="caption" color="error">
                      {errors.fromAccountId.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {selectedAccount && (
                <Grid item xs={12}>
                  <Alert severity="info" icon={<AccountBalance />}>
                    Available Balance: ₹{selectedAccount.balance.toLocaleString()}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <BankEaseFormField
                  name="toAccountNumber"
                  control={control}
                  label="To Account Number"
                  disabled={isLoading}
                  required
                  placeholder="Enter beneficiary account number"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <BankEaseFormField
                  name="amount"
                  control={control}
                  label="Amount (₹)"
                  type="number"
                  disabled={isLoading}
                  required
                  inputProps={{ min: 1, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12}>
                <BankEaseFormField
                  name="description"
                  control={control}
                  label="Description (Optional)"
                  multiline
                  rows={3}
                  disabled={isLoading}
                  placeholder="Enter transfer description or remarks"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {watch('amount') > 0 && selectedAccount && (
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transfer Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    From Account:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedAccount.accountNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    To Account:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {watch('toAccountNumber') || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Transfer Amount:
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    ₹{watch('amount').toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Remaining Balance:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ₹{(selectedAccount.balance - watch('amount')).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Box 
          display="flex" 
          gap={{ xs: 1, sm: 2 }} 
          justifyContent="center"
          flexDirection={{ xs: 'column', sm: 'row' }}
        >
          <Button
            variant="outlined"
            onClick={() => reset()}
            disabled={isLoading}
            size="large"
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading || !isValid || (selectedAccount && watch('amount') > selectedAccount.balance)}
            startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
            sx={{ minWidth: 200 }}
          >
            {isLoading ? 'Processing...' : 'Transfer Money'}
          </Button>
        </Box>
      </form>
    </Box>
  )
})

BankEaseTransferForm.displayName = 'BankEaseTransferForm'
