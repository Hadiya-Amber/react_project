import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { transactionService, TransferDto } from '@/services/transactionService';
import { AccountStatus } from '@/types';
import { accountService, AccountReadDto } from '@/services/accountService';
import { TransactionType } from '@/types';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';
import { useMinorAccountCheck } from '@/hooks/useMinorAccountCheck';
import { useCustomer } from '@/context/CustomerContext';
import AccountSelector from '@/components/AccountSelector';
import { getErrorMessage } from '@/utils/errorHandler';

const TransferPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification, addToHistory } = useNotification();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<AccountReadDto[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [hasApprovedAccount, setHasApprovedAccount] = useState(false);
  const { isMinorAccountBlocked, userAge } = useMinorAccountCheck();
  
  // Get customer context for cache invalidation
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
  } = useForm<TransferDto & { transactionType: TransactionType }>({
    defaultValues: {
      fromAccountNumber: '',
      toAccountNumber: '',
      amount: 0,
      description: '',
      reference: '',
      transactionType: TransactionType.Transfer
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

  // Function to sanitize account numbers (remove special characters)
  const sanitizeAccountNumber = (accountNumber: string): string => {
    return accountNumber.replace(/[^A-Za-z0-9]/g, '');
  };

  const onSubmit = async (data: TransferDto & { transactionType: TransactionType }) => {
    setLoading(true);
    try {
      // Remove transactionType from data before sending to backend
      const { transactionType, ...transferData } = data;
      
      // Sanitize account numbers to remove special characters
      transferData.fromAccountNumber = sanitizeAccountNumber(transferData.fromAccountNumber);
      transferData.toAccountNumber = sanitizeAccountNumber(transferData.toAccountNumber);
      
      // Ensure amount is a valid number
      if (!transferData.amount || transferData.amount <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }
      
      await transactionService.transfer(transferData);
      
      // Invalidate customer cache to refresh dashboard data
      if (customerContext?.invalidateCache) {
        customerContext.invalidateCache();
      }
      
      // Show appropriate message based on amount
      const requiresApproval = transferData.amount >= 100000;
      if (requiresApproval) {
        showNotification('High-value transfer submitted for approval. You will be notified once processed.', NotificationType.INFO);
        addToHistory({
          id: Date.now().toString(),
          type: 'info' as any,
          category: 'transactional' as any,
          title: 'High-Value Transfer Pending',
          message: `Transfer of ₹${transferData.amount.toLocaleString()} to ${transferData.toAccountNumber} submitted for approval`,
          timestamp: new Date(),
          read: false
        });
      } else {
        showNotification('Transfer completed successfully!', NotificationType.SUCCESS);
        addToHistory({
          id: Date.now().toString(),
          type: 'success' as any,
          category: 'transactional' as any,
          title: 'Transfer Completed',
          message: `Transfer of ₹${transferData.amount.toLocaleString()} to ${transferData.toAccountNumber} completed successfully`,
          timestamp: new Date(),
          read: false
        });
      }
      
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
        Transfer Money
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
                  label="Transfer from Account *"
                  userAge={userAge}
                  excludeMinorIfOver18={true}
                />
              )}
            />

            <Controller
              name="toAccountNumber"
              control={control}
              rules={{ 
                required: 'To account number is required',
                minLength: {
                  value: 8,
                  message: 'Account number must be at least 8 characters'
                },
                maxLength: {
                  value: 20,
                  message: 'Account number cannot exceed 20 characters'
                },
                pattern: {
                  value: /^[A-Za-z0-9]+$/,
                  message: 'Account number must contain only letters and numbers'
                },
                validate: (value) => {
                  if (!value.trim()) return 'To account number is required';
                  return true;
                }
              }}
              render={({ field }) => (
                <Box>
                  <TextField
                    {...field}
                    fullWidth
                    label="To Account Number *"
                    margin="normal"
                    error={!!errors.toAccountNumber}
                    helperText={errors.toAccountNumber?.message || "Enter an active account number"}
                  />
                  {accounts.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Your account: {accounts.find(acc => 
                        acc.status === AccountStatus.Active && 
                        acc.isActive
                      )?.accountNumber || 'None active'}
                    </Typography>
                  )}
                </Box>
              )}
            />

            <Controller
              name="amount"
              control={control}
              rules={{ 
                required: 'Amount is required',
                min: { value: 1, message: 'Amount must be greater than 0' },
                max: { value: 10000000, message: 'Maximum transfer amount is ₹1,00,00,000' },
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
                  label="Amount *"
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
              name="transactionType"
              control={control}
              rules={{ required: 'Transaction type is required' }}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.transactionType}>
                  <InputLabel>Transaction Type *</InputLabel>
                  <Select 
                    {...field} 
                    value={field.value ?? TransactionType.Deposit} 
                    label="Transaction Type *"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    <MenuItem value={TransactionType.Deposit}>Deposit</MenuItem>
                    <MenuItem value={TransactionType.Withdrawal}>Withdrawal</MenuItem>
                    <MenuItem value={TransactionType.Transfer}>Transfer</MenuItem>
                    <MenuItem value={3}>Bill Payment</MenuItem>
                    <MenuItem value={4}>Loan Payment</MenuItem>
                    <MenuItem value={5}>Investment Deposit</MenuItem>
                  </Select>
                  {errors.transactionType && (
                    <Typography variant="caption" color="error">
                      {errors.transactionType.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="reference"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Reference (Optional)"
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
              {loading ? <CircularProgress size={24} /> : 'Submit Transfer'}
            </Button>
          </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransferPage;
