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
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { transactionService, DepositDto, DepositMode } from '@/services/transactionService';
import { AccountStatus } from '@/types';
import { accountService, AccountReadDto } from '@/services/accountService';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { useMinorAccountCheck } from '@/hooks/useMinorAccountCheck';
import { useCustomer } from '@/context/CustomerContext';
import { getErrorMessage } from '@/utils/errorHandler';

const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification, addToHistory } = useNotification();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasApprovedAccount, setHasApprovedAccount] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [userBranchId, setUserBranchId] = useState<number | null>(null);
  // Minor account check (unused but available)
  // const { isMinorAccountBlocked, userAge } = useMinorAccountCheck();
  
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
  } = useForm<DepositDto>({
    defaultValues: {
      toAccountNumber: '',
      amount: 0,
      depositMode: DepositMode.Cash,
      depositorName: '',
      referenceNumber: '',
      description: ''
    }
  });

  const watchedDepositMode = useWatch({ control, name: 'depositMode' });
  const watchedAmount = useWatch({ control, name: 'amount' });

  useEffect(() => {
    // Use cached customer data instead of API call
    if (customerContext?.data?.accountDetails) {
      const userAccounts = customerContext.data.accountDetails;
      const approved = userAccounts.some(acc => 
        acc.status === AccountStatus.Active && 
        acc.isActive
      );
      setHasApprovedAccount(approved);
      
      if (userAccounts.length > 0) {
        setUserBranchId(userAccounts[0].branchId);
      }
      setAccountsLoading(false);
    } else if (!customerContext?.loading) {
      setAccountsLoading(false);
    }
  }, [customerContext?.data?.accountDetails, customerContext?.loading]);

  const onSubmit = async (data: DepositDto) => {
    setLoading(true);
    // Submitting deposit with data
    
    try {
      // Add user's branch ID for deposit validation
      const depositData = {
        ...data,
        branchId: userBranchId || undefined
      };
      
      // Deposit data with branch ID
      
      await transactionService.deposit(depositData);
      
      // Invalidate customer cache to refresh dashboard data
      if (customerContext?.invalidateCache) {
        customerContext.invalidateCache();
      }
      
      // Show appropriate message based on deposit conditions
      let message = 'Deposit request submitted successfully!';
      if (data.amount > 50000 || 
          (data.depositMode === DepositMode.Cash && data.amount > 25000) ||
          data.depositMode === DepositMode.DemandDraft) {
        message += ' This deposit requires branch manager approval.';
      }
      
      showNotification(message, 'success' as any);
      
      // Add to notification history
      addToHistory({
        id: Date.now().toString(),
        type: 'success' as any,
        category: 'transactional' as any,
        title: 'Deposit Submitted',
        message: `Deposit of ₹${data.amount.toLocaleString()} to account ${data.toAccountNumber} submitted successfully`,
        timestamp: new Date(),
        read: false
      });
      
      reset();
      navigate('/transactions');
    } catch (error: any) {
      showNotification(getErrorMessage(error), 'error' as any);
    } finally {
      setLoading(false);
    }
  };

  const getReferenceLabel = (mode: DepositMode): string => {
    switch (mode) {
      case DepositMode.Cheque: return 'Cheque Number *';
      case DepositMode.OnlineTransfer: return 'Transaction Reference *';
      case DepositMode.DemandDraft: return 'Demand Draft Number *';
      case DepositMode.NEFT: return 'NEFT Reference *';
      case DepositMode.RTGS: return 'RTGS Reference *';
      case DepositMode.UPI: return 'UPI Transaction ID *';
      case DepositMode.IMPS: return 'IMPS Reference *';
      default: return 'Reference Number (Optional)';
    }
  };

  const getReferenceHelperText = (mode: DepositMode): string => {
    switch (mode) {
      case DepositMode.Cheque: return 'Enter 6-8 digit cheque number (e.g., 123456)';
      case DepositMode.OnlineTransfer: return 'Enter bank transaction reference (e.g., TXN123456789)';
      case DepositMode.DemandDraft: return 'Enter DD number (e.g., DD123456)';
      case DepositMode.NEFT: return 'Enter NEFT UTR number (e.g., NEFT21123456789)';
      case DepositMode.RTGS: return 'Enter RTGS UTR number (e.g., RTGS21123456789)';
      case DepositMode.UPI: return 'Enter 12-digit UPI transaction ID (e.g., 123456789012)';
      case DepositMode.IMPS: return 'Enter IMPS reference number (e.g., IMPS123456789)';
      default: return 'Optional reference for your records';
    }
  };

  const getReferencePlaceholder = (mode: DepositMode): string => {
    switch (mode) {
      case DepositMode.Cheque: return '123456';
      case DepositMode.OnlineTransfer: return 'TXN123456789';
      case DepositMode.DemandDraft: return 'DD123456';
      case DepositMode.NEFT: return 'NEFT21123456789';
      case DepositMode.RTGS: return 'RTGS21123456789';
      case DepositMode.UPI: return '123456789012';
      case DepositMode.IMPS: return 'IMPS123456789';
      default: return 'Optional reference';
    }
  };

  const isReferenceRequired = (mode: DepositMode): boolean => {
    return [
      DepositMode.Cheque,
      DepositMode.OnlineTransfer,
      DepositMode.NEFT,
      DepositMode.RTGS,
      DepositMode.UPI,
      DepositMode.IMPS,
      DepositMode.DemandDraft
    ].includes(mode);
  };

  const isDepositDisabled = (): boolean => {
    if (watchedDepositMode === DepositMode.Cash && watchedAmount > 200000) return true;
    if (watchedDepositMode === DepositMode.DemandDraft && watchedAmount < 1000) return true;
    return false;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Make a Deposit
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
              name="toAccountNumber"
              control={control}
              rules={{ 
                required: 'Account number is required',
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
                  if (!value.trim()) return 'Account number is required';
                  return true;
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Account Number *"
                  margin="normal"
                  error={!!errors.toAccountNumber}
                  helperText={errors.toAccountNumber?.message || 'Enter account number to deposit to (can be your own or others)'}
                  placeholder="Enter account number"
                />
              )}
            />

            <Controller
              name="amount"
              control={control}
              rules={{ 
                required: 'Amount is required',
                min: { value: 1, message: 'Amount must be greater than 0' },
                max: { value: 10000000, message: 'Maximum deposit amount is ₹1,00,00,000' },
                validate: (value) => {
                  if (!value || value <= 0) return 'Amount must be greater than 0';
                  if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) return 'Invalid amount format';
                  if (watchedDepositMode === DepositMode.Cash && value > 200000) {
                    return 'Cash deposits above ₹2,00,000 are not allowed';
                  }
                  if (watchedDepositMode === DepositMode.DemandDraft && value < 1000) {
                    return 'Minimum amount for demand draft is ₹1,000';
                  }
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
              name="depositMode"
              control={control}
              rules={{ required: 'Deposit mode is required' }}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.depositMode}>
                  <InputLabel>Deposit Mode *</InputLabel>
                  <Select 
                    {...field} 
                    value={field.value ?? DepositMode.Cash} 
                    label="Deposit Mode *"
                    onChange={(e) => {
                      // Deposit mode changed
                      field.onChange(Number(e.target.value));
                    }}
                  >
                    <MenuItem value={DepositMode.Cash}>Cash</MenuItem>
                    <MenuItem value={DepositMode.Cheque}>Cheque</MenuItem>
                    <MenuItem value={DepositMode.OnlineTransfer}>Online Transfer</MenuItem>
                    <MenuItem value={DepositMode.DemandDraft}>Demand Draft</MenuItem>
                    <MenuItem value={DepositMode.NEFT}>NEFT</MenuItem>
                    <MenuItem value={DepositMode.RTGS}>RTGS</MenuItem>
                    <MenuItem value={DepositMode.UPI}>UPI</MenuItem>
                    <MenuItem value={DepositMode.IMPS}>IMPS</MenuItem>
                  </Select>
                  {errors.depositMode && (
                    <Typography variant="caption" color="error">
                      {errors.depositMode.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="depositorName"
              control={control}
              rules={{ required: 'Depositor name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Depositor Name *"
                  margin="normal"
                  error={!!errors.depositorName}
                  helperText={errors.depositorName?.message || "Enter the name of the person making the deposit"}
                  required
                />
              )}
            />

            <Controller
              name="referenceNumber"
              control={control}
              rules={{
                required: (
                  watchedDepositMode === DepositMode.Cheque ||
                  watchedDepositMode === DepositMode.OnlineTransfer ||
                  watchedDepositMode === DepositMode.NEFT ||
                  watchedDepositMode === DepositMode.RTGS ||
                  watchedDepositMode === DepositMode.IMPS ||
                  watchedDepositMode === DepositMode.UPI ||
                  watchedDepositMode === DepositMode.DemandDraft
                ) ? 'Reference number is required for this deposit mode' : false
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={getReferenceLabel(watchedDepositMode)}
                  margin="normal"
                  error={!!errors.referenceNumber}
                  helperText={errors.referenceNumber?.message || getReferenceHelperText(watchedDepositMode)}
                  placeholder={getReferencePlaceholder(watchedDepositMode)}
                  required={isReferenceRequired(watchedDepositMode)}
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

            {/* Deposit Mode Specific Warnings */}
            {(watchedDepositMode === DepositMode.OnlineTransfer || 
              watchedDepositMode === DepositMode.NEFT || 
              watchedDepositMode === DepositMode.RTGS || 
              watchedDepositMode === DepositMode.UPI || 
              watchedDepositMode === DepositMode.IMPS) && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                For {watchedDepositMode === DepositMode.OnlineTransfer ? 'online transfers' : 
                     watchedDepositMode === DepositMode.NEFT ? 'NEFT transfers' :
                     watchedDepositMode === DepositMode.RTGS ? 'RTGS transfers' :
                     watchedDepositMode === DepositMode.UPI ? 'UPI transfers' : 'IMPS transfers'} between accounts, 
                please use the <Button variant="text" onClick={() => navigate('/transactions/transfer')} sx={{ p: 0, textTransform: 'none' }}>Transfer Money</Button> form instead.
                This deposit form is for external deposits into your account.
              </Alert>
            )}
            {watchedDepositMode === DepositMode.Cash && watchedAmount > 200000 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Cash deposits above ₹2,00,000 are not allowed as per RBI guidelines
              </Alert>
            )}
            {watchedDepositMode === DepositMode.DemandDraft && watchedAmount < 1000 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Minimum amount for demand draft is ₹1,000
              </Alert>
            )}
            {watchedAmount > 50000 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Deposits above ₹50,000 require branch manager approval
              </Alert>
            )}
            {watchedDepositMode === DepositMode.Cash && watchedAmount > 25000 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Cash deposits above ₹25,000 require branch manager approval
              </Alert>
            )}
            {watchedDepositMode === DepositMode.DemandDraft && (
              <Alert severity="info" sx={{ mt: 2 }}>
                All demand draft deposits require branch manager approval
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || isDepositDisabled()}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Deposit'}
            </Button>
          </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DepositPage;
