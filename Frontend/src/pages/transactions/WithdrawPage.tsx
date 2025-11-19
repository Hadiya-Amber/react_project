import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { transactionService, WithdrawalDto, WithdrawalMode } from '@/services/transactionService';
import { AccountStatus } from '@/types';
import { accountService, AccountReadDto } from '@/services/accountService';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';
import { useAuth } from '@/context/AuthContext';
import { useMinorAccountCheck } from '@/hooks/useMinorAccountCheck';
import AccountSelector from '@/components/AccountSelector';
import { getErrorMessage } from '@/utils/errorHandler';
import { useCustomer } from '@/context/CustomerContext';

const WithdrawPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<AccountReadDto[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [hasApprovedAccount, setHasApprovedAccount] = useState(false);
  const { isMinorAccountBlocked, userAge } = useMinorAccountCheck();
  
  // Get customer context for cached data
  let customerContext = null;
  try {
    customerContext = useCustomer();
  } catch {
    // Not in customer context, ignore
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WithdrawalDto>({
    defaultValues: {
      fromAccountNumber: '',
      amount: 0,
      withdrawalMode: WithdrawalMode.BankCounter,
      pin: '',
      referenceNumber: '',
      description: ''
    }
  });

  useEffect(() => {
    // Use cached customer data instead of API call
    if (customerContext?.data?.accountDetails) {
      const userAccounts = customerContext.data.accountDetails;
      setAccounts(userAccounts);
      const approved = userAccounts.some(acc => 
        acc.status === AccountStatus.Active && 
        acc.isActive
      );
      setHasApprovedAccount(approved);
      setAccountsLoading(false);
    } else if (!customerContext?.loading) {
      setAccountsLoading(false);
    }
  }, [customerContext?.data?.accountDetails, customerContext?.loading]);

  const onSubmit = async (data: WithdrawalDto) => {
    setLoading(true);
    try {
      // Set default branchId if not provided
      const withdrawalData = {
        ...data,
        branchId: data.branchId || user?.branchId || 1
      };
      
      await transactionService.withdraw(withdrawalData);
      
      // Show appropriate message based on withdrawal amount
      let message = 'Withdrawal request submitted successfully!';
      if (data.amount > 100000) {
        message += ' This withdrawal requires branch manager approval.';
      }
      
      showNotification(message, NotificationType.SUCCESS);
      reset();
      navigate('/transactions');
    } catch (error: any) {
      showNotification(getErrorMessage(error), NotificationType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Withdraw Money
      </Typography>

      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          {accountsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : !hasApprovedAccount ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="error" gutterBottom>
                No Active Accounts Available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any active accounts for transactions. Your accounts may be pending approval, dormant, or closed. Please contact your branch for assistance.
              </Typography>
            </Box>
          ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <Controller
              name="fromAccountNumber"
              control={control}
              rules={{ required: 'Account is required' }}
              render={({ field }) => (
                <AccountSelector
                  value={field.value || ''}
                  onChange={(accountNumber, accountId) => {
                    field.onChange(accountNumber);
                  }}
                  label="Withdraw from Account"
                  userAge={userAge}
                  excludeMinorIfOver18={true}
                />
              )}
            />

            <Controller
              name="amount"
              control={control}
              rules={{ 
                required: 'Amount is required',
                min: { value: 1, message: 'Amount must be greater than 0' },
                max: { value: 5000000, message: 'Maximum withdrawal amount is ₹50,00,000' },
                validate: (value) => {
                  if (!value || value <= 0) return 'Amount must be greater than 0';
                  if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) return 'Invalid amount format';
                  return true;
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Amount"
                  type="number"
                  margin="normal"
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    field.onChange(isNaN(value) ? 0 : value);
                  }}
                />
              )}
            />

            <Controller
              name="withdrawalMode"
              control={control}
              rules={{ required: 'Withdrawal mode is required' }}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.withdrawalMode}>
                  <InputLabel>Withdrawal Mode</InputLabel>
                  <Select {...field} value={field.value || WithdrawalMode.BankCounter} label="Withdrawal Mode">
                    <MenuItem value={WithdrawalMode.BankCounter}>Bank Counter</MenuItem>
                    <MenuItem value={WithdrawalMode.Cheque}>Cheque</MenuItem>
                  </Select>
                  {errors.withdrawalMode && (
                    <Typography variant="caption" color="error">
                      {errors.withdrawalMode.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="pin"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="PIN (Optional)"
                  type="password"
                  margin="normal"
                />
              )}
            />

            <Controller
              name="referenceNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Reference Number (Optional)"
                  margin="normal"
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Description (Optional)"
                  multiline
                  rows={3}
                  margin="normal"
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Withdrawal'}
            </Button>
          </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default WithdrawPage;
