import React, { useState, useEffect, memo, useMemo, useCallback, useReducer, Suspense } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, AppDispatch } from '@/store';
// import { fetchTransactions } from '@/store/slices/transactionSlice';
import { useDebounce } from '@/hooks/useAdvancedPatterns';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Button,

} from '@mui/material';
import { Add, FilterList, Download, ArrowUpward, ArrowDownward, Visibility } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user';
import { AccountType } from '@/types/account';
import { TransactionType, TransactionStatus, TransactionDirection } from '@/types';
import { 
  transactionService, 
  TransactionReadDto, 
  UserTransactionHistoryDto,
  TransactionDetailDto
} from '@/services/transactionService';
import { AccountStatus } from '@/types';
import { accountService } from '@/services/accountService';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';
import { useAdminDashboard } from '@/context/AdminDashboardContext';
import { useCustomer } from '@/context/CustomerContext';
import { getTransactionDisplayData } from '@/utils/transactionUtils';

const getTransactionTypeLabel = (type: TransactionType | number): string => {
  switch (Number(type)) {
    case 0: return 'Cash Deposit'; // Deposit
    case 1: return 'Cash Withdrawal'; // Withdrawal
    case 2: return 'Fund Transfer'; // Transfer
    case 3: return 'Bill Payment'; // BillPayment
    case 4: return 'Loan Payment'; // LoanPayment
    case 5: return 'Payment'; // Payment
    case 6: return 'Refund'; // Refund
    case 7: return 'Interest Credit'; // Interest
    case 8: return 'Service Fee'; // Fee
    case 9: return 'Service Charge'; // ServiceCharge
    case 10: return 'Transaction Reversal'; // Reversal
    default: return 'Transaction';
  }
};

const getStatusLabel = (status: TransactionStatus | number): string => {
  switch (Number(status)) {
    case 0: return 'Pending'; // Pending
    case 1: return 'Processing'; // Processing
    case 2: return 'Completed'; // Completed
    case 3: return 'Failed'; // Failed
    case 4: return 'Cancelled'; // Cancelled
    case 5: return 'Requires Approval'; // RequiresApproval
    case 6: return 'Approved'; // Approved
    case 7: return 'Rejected'; // Rejected
    case 8: return 'Reversed'; // Reversed
    default: return 'Unknown';
  }
};

// Reducer for complex filter state
interface FilterState {
  type: string;
  status: string;
  search: string;
  accountType: string;
  fromDate: string;
  toDate: string;
  accountNumber: string;
}

type FilterAction = 
  | { type: 'SET_FILTER'; field: keyof FilterState; value: string }
  | { type: 'RESET_FILTERS' };

const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, [action.field]: action.value };
    case 'RESET_FILTERS':
      return {
        type: '',
        status: '',
        search: '',
        accountType: '',
        fromDate: '',
        toDate: '',
        accountNumber: '',
      };
    default:
      return state;
  }
};

// Memoized transaction row component
const TransactionRow = memo(({ transaction, onDownloadReceipt, userRole, userAccountNumber }: any) => {
  // Get properly formatted transaction data
  const displayData = getTransactionDisplayData(transaction, userAccountNumber);
  
  return (
    <TableRow>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          {displayData.direction === TransactionDirection.Credit ? 
            <ArrowDownward sx={{ color: 'success.main', fontSize: 16 }} /> :
            <ArrowUpward sx={{ color: 'error.main', fontSize: 16 }} />
          }
          <Typography variant="body2">
            {new Date(displayData.transactionDate).toLocaleDateString()}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {displayData.displayDescription || displayData.type || 'Transaction'}
        </Typography>
        {displayData.description && (
          <Typography variant="caption" color="text.secondary" display="block">
            {displayData.description}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {displayData.otherPartyName || 'N/A'}
        </Typography>
        {displayData.otherPartyAccount && (
          <Typography variant="caption" color="text.secondary" display="block">
            {displayData.otherPartyAccount}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          fontWeight="bold"
          color={displayData.direction === TransactionDirection.Credit ? 'success.main' : 'error.main'}
        >
          {displayData.formattedAmount}
        </Typography>
        {displayData.balanceAfterTransaction !== undefined && displayData.balanceAfterTransaction !== null && (
          <Typography variant="caption" color="text.secondary" display="block">
            Balance: ₹{displayData.balanceAfterTransaction.toLocaleString()}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {displayData.reference || displayData.transactionReference || displayData.transactionId || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell>
        <Button
          size="small"
          onClick={() => onDownloadReceipt(displayData.id)}
          disabled={displayData.status === 4}
          startIcon={userRole === 'Customer' || userRole === UserRole.Customer ? undefined : <Visibility />}
        >
          {userRole === 'Customer' || userRole === UserRole.Customer ? 'Receipt' : ''}
        </Button>
      </TableCell>
    </TableRow>
  );
});

const TransactionsPage: React.FC = () => {
  // Redux integration
  // Redux integration (currently unused but available for future enhancements)
  // const reduxDispatch = useDispatch<AppDispatch>();
  // const reduxTransactions = useSelector((state: RootState) => state.transactions);
  
  // useReducer for complex filter state
  const [filters, dispatchFilter] = useReducer(filterReducer, {
    type: '',
    status: '',
    search: '',
    accountType: '',
    fromDate: '',
    toDate: '',
    accountNumber: '',
  });
  
  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);
  const [transactionHistory, setTransactionHistory] = useState<UserTransactionHistoryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [hasApprovedAccount, setHasApprovedAccount] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('accountId');
  const accountNumber = searchParams.get('accountNumber');
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string | null>(null);
  
  // Try to get admin dashboard data if available
  let adminDashboardData = null;
  let customerData = null;
  try {
    adminDashboardData = useAdminDashboard();
  } catch {
    // Not in admin context, ignore
  }
  
  try {
    customerData = useCustomer();
  } catch {
    // Not in customer context, ignore
  }
  




  // Set account number from URL params (no API call needed here)
  useEffect(() => {
    if (accountNumber) {
      setSelectedAccountNumber(accountNumber);
    } else {
      setSelectedAccountNumber(null);
    }
  }, [accountNumber]);

  useEffect(() => {
    if ((user?.role as any) === 'Customer' || (user?.role as any) === UserRole.Customer) {
      checkAccountApprovalAndFetchTransactions();
    } else {
      fetchAllTransactions();
    }
  }, [user?.role, selectedAccountNumber, adminDashboardData?.data, adminDashboardData?.loading]);

  // Separate effect for filters to avoid excessive re-renders
  useEffect(() => {
    if (transactionHistory && (filters.fromDate || filters.toDate || filters.accountNumber)) {
      // Only refetch when date filters or account filters change
      if ((user?.role as any) === 'Customer' || (user?.role as any) === UserRole.Customer) {
        checkAccountApprovalAndFetchTransactions();
      } else {
        fetchAllTransactions();
      }
    }
  }, [filters.fromDate, filters.toDate, filters.accountNumber]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, adminDashboardData?.data]);

  const checkAccountApprovalAndFetchTransactions = async () => {
    // Wait for customer data to load
    if (customerData?.loading) {
      setLoading(true);
      return;
    }
    
    // If we have consolidated customer data, use it directly
    if (customerData?.data) {
      try {
        const accounts = customerData.data.accountDetails || [];
        const approved = accounts.some(acc => acc.status === AccountStatus.Active && acc.isActive);
        setHasApprovedAccount(approved);
        
        if (approved) {
          // Check if we need filtered data or can use consolidated data
          const hasDateFilters = filters.fromDate || filters.toDate;
          const hasAccountFilter = selectedAccountNumber || filters.accountNumber;
          
          if (!hasDateFilters && !hasAccountFilter && customerData.data.recentTransactions) {
            // Use consolidated data to avoid API call
            const consolidatedTransactions = customerData.data.recentTransactions;
            
            const data = {
              transactions: consolidatedTransactions.map(t => ({
                id: t.transactionId,
                transactionId: t.transactionId.toString(),
                transactionReference: t.transactionId.toString(),
                fromAccountId: null,
                fromAccountNumber: '',
                fromAccountHolderName: '',
                toAccountId: null,
                toAccountNumber: '',
                toAccountHolderName: '',
                amount: t.amount,
                transactionType: t.type === 'Deposit' ? 0 : t.type === 'Withdrawal' ? 1 : 2,
                status: t.status === 'Completed' ? 2 : 0,
                description: t.description || `${t.type} transaction`,
                reference: t.transactionId.toString(),
                transactionDate: t.date,
                direction: t.type.includes('Received') || t.type === 'Deposit' || t.type === 'Money Received' ? 1 : 0,
                displayDescription: t.type,
                otherPartyName: t.type === 'Deposit' ? 'Cash Deposit' : 
                                t.type === 'Withdrawal' ? 'Cash Withdrawal' : 
                                t.type.includes('Transfer') ? 'Money Transfer' : 
                                t.type.includes('Received') ? 'Money Received' : 'Transaction',
                otherPartyAccount: t.type.includes('Transfer') ? 'Internal Transfer' : '',
                balanceAfterTransaction: undefined
              })),
              currentBalance: customerData.data.personalInfo?.totalBalance || 0,
              totalCredits: 0,
              totalDebits: 0,
              totalTransactions: consolidatedTransactions.length,
              accountNumber: 'All Accounts',
              accountHolderName: customerData.data.personalInfo?.fullName || ''
            };
            setTransactionHistory(data);
          } else {
            // Only make API call when date/account filters are applied
            const fromDate = filters.fromDate ? new Date(filters.fromDate) : undefined;
            const toDate = filters.toDate ? new Date(filters.toDate) : undefined;
            const targetAccountNumber = selectedAccountNumber || filters.accountNumber || undefined;
            
            const data = await transactionService.getUserTransactionHistory(fromDate, toDate, targetAccountNumber);
            setTransactionHistory(data);
          }
        } else {
          setTransactionHistory(null);
        }
      } catch (error) {
        setHasApprovedAccount(false);
        setTransactionHistory(null);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // If no customer data available after loading, show empty state
    setLoading(false);
    setHasApprovedAccount(false);
    setTransactionHistory(null);
  };

  const fetchAllTransactions = async () => {
    try {
      if ((user?.role as any) === 'Admin' || (user?.role as any) === UserRole.Admin) {
        // Wait for admin dashboard to load
        if (adminDashboardData?.loading) {
          setLoading(true);
          return;
        }
        
        // For admin, use consolidated data only - no separate API calls
        if (adminDashboardData?.data?.transactions) {
          const allTransactions = adminDashboardData.data.transactions;

          // Convert to UserTransactionHistoryDto format for compatibility
          const adminData: UserTransactionHistoryDto = {
            transactions: allTransactions.map(t => {
              // Map transaction type from string to number
              let transactionTypeNum = 0;
              if (t.transactionType === 'Deposit') transactionTypeNum = 0;
              else if (t.transactionType === 'Withdrawal') transactionTypeNum = 1;
              else if (t.transactionType === 'Transfer') transactionTypeNum = 2;
              
              // Map status from string to number
              let statusNum = 2; // Default to completed
              if (t.status === 'Pending') statusNum = 0;
              else if (t.status === 'Processing') statusNum = 1;
              else if (t.status === 'Completed') statusNum = 2;
              
              return {
                id: t.id,
                transactionId: t.transactionId,
                transactionReference: t.transactionReference || t.transactionId,
                fromAccountId: t.fromAccountId,
                fromAccountNumber: t.fromAccountNumber || '',
                fromAccountHolderName: '',
                toAccountId: t.toAccountId,
                toAccountNumber: t.toAccountNumber || '',
                toAccountHolderName: '',
                amount: t.amount,
                transactionType: transactionTypeNum,
                status: statusNum,
                description: t.description,
                reference: t.reference || t.transactionReference || t.transactionId,
                transactionDate: t.transactionDate,
                direction: transactionTypeNum === 0 ? TransactionDirection.Credit : 
                          transactionTypeNum === 1 ? TransactionDirection.Debit :
                          TransactionDirection.Debit, // Default for transfers
                displayDescription: getTransactionTypeLabel(transactionTypeNum),
                otherPartyName: t.toAccountNumber || t.fromAccountNumber || (transactionTypeNum === 0 ? 'Cash Deposit' : transactionTypeNum === 1 ? 'Cash Withdrawal' : 'Internal Transfer'),
                otherPartyAccount: '',
                balanceAfterTransaction: undefined
              };
            }),
            currentBalance: 0,
            totalCredits: allTransactions.filter(t => t.transactionType === 'Deposit').reduce((sum, t) => sum + t.amount, 0),
            totalDebits: allTransactions.filter(t => t.transactionType === 'Withdrawal' || t.transactionType === 'Transfer').reduce((sum, t) => sum + t.amount, 0),
            totalTransactions: allTransactions.length,
            accountNumber: 'All Accounts',
            accountHolderName: 'System Wide'
          };
          setTransactionHistory(adminData);
          setLoading(false);
        } else {
          setTransactionHistory(null);
          setLoading(false);
        }
      } else {
        // For regular users, get their transaction history
        setLoading(true);
        const fromDate = filters.fromDate ? new Date(filters.fromDate) : undefined;
        const toDate = filters.toDate ? new Date(filters.toDate) : undefined;
        const data = await transactionService.getUserTransactionHistory(fromDate, toDate, filters.accountNumber || undefined);
        setTransactionHistory(data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setTransactionHistory(null);
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!transactionHistory?.transactions) {
      return [];
    }
    
    const filtered = transactionHistory.transactions.filter(transaction => {
      // Account number filter - ensure only transactions for selected account
      if (selectedAccountNumber) {
        const matchesAccount = 
          transaction.fromAccountNumber === selectedAccountNumber ||
          transaction.toAccountNumber === selectedAccountNumber;
        if (!matchesAccount) return false;
      }
      // Date filters
      if (filters.fromDate) {
        const transactionDate = new Date(transaction.transactionDate);
        const fromDate = new Date(filters.fromDate);
        if (transactionDate < fromDate) return false;
      }
      
      if (filters.toDate) {
        const transactionDate = new Date(transaction.transactionDate);
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        if (transactionDate > toDate) return false;
      }
      
      // Search filter using debounced value
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesSearch = 
          transaction.description?.toLowerCase().includes(searchLower) ||
          transaction.displayDescription?.toLowerCase().includes(searchLower) ||
          transaction.otherPartyName?.toLowerCase().includes(searchLower) ||
          transaction.amount.toString().includes(searchLower) ||
          transaction.reference?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Transaction type filter
      if (filters.type && filters.type !== '') {
        const filterType = Number(filters.type);
        const transactionType = Number(transaction.transactionType);
        if (filterType !== transactionType) {
          return false;
        }
      }
      
      // Direction filter
      if (filters.accountType) {
        if (filters.accountType === 'credit' && Number(transaction.direction) !== TransactionDirection.Credit) {
          return false;
        }
        if (filters.accountType === 'debit' && Number(transaction.direction) !== TransactionDirection.Debit) {
          return false;
        }
      }
      
      // Status filter
      if (filters.status) {
        const statusLabel = getStatusLabel(transaction.status);
        if (statusLabel !== filters.status) {
          return false;
        }
      }
      
      return true;
    });


    
    // For customers, implement real-world banking transaction logic
    if ((user?.role as any) === 'Customer' || (user?.role as any) === UserRole.Customer) {
      // Sort by date (oldest first) for proper running balance calculation
      const sortedTransactions = [...filtered].sort((a, b) => 
        new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
      );

      // Simple correct approach: Work backwards from current balance
      let currentBalance = transactionHistory.currentBalance;
      
      // Work backwards from newest to oldest (reverse chronological)
      for (let i = sortedTransactions.length - 1; i >= 0; i--) {
        const transaction = sortedTransactions[i];
        
        // This transaction shows the balance AFTER it was processed
        transaction.balanceAfterTransaction = currentBalance;
        
        // Calculate what the balance was BEFORE this transaction
        if (transaction.direction === TransactionDirection.Credit) {
          // Money came in, so before this transaction balance was less
          currentBalance -= transaction.amount;
        } else {
          // Money went out, so before this transaction balance was more
          currentBalance += transaction.amount;
        }
      }

      // Return in reverse chronological order (newest first) - real banking standard
      return sortedTransactions.reverse();
    } else {
      // For admin/branch manager, don't show balance (they see all accounts)
      return [...filtered].sort((a, b) => 
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      );
    }
  }, [transactionHistory?.transactions, transactionHistory?.currentBalance, debouncedSearch, filters.type, filters.status, filters.accountType, filters.fromDate, filters.toDate, user?.role]);

  // Calculate correct totals from filtered transactions
  const transactionSummary = useMemo(() => {
    if (!filteredTransactions.length) {
      return { totalCredits: 0, totalDebits: 0, totalTransactions: 0 };
    }

    let totalCredits = 0;
    let totalDebits = 0;

    filteredTransactions.forEach(transaction => {
      const displayData = getTransactionDisplayData(transaction, selectedAccountNumber || transactionHistory?.accountNumber);
      
      if (displayData.direction === TransactionDirection.Credit) {
        totalCredits += displayData.amount;
      } else {
        totalDebits += displayData.amount;
      }
    });

    return {
      totalCredits,
      totalDebits,
      totalTransactions: filteredTransactions.length
    };
  }, [filteredTransactions, selectedAccountNumber, transactionHistory?.accountNumber]);

  // useCallback for event handlers
  const downloadReceipt = useCallback(async (transactionId: number) => {
    try {
      const blob = await transactionService.downloadReceipt(transactionId);
      const url = window.URL.createObjectURL(blob);
      
      if ((user?.role as any) === 'Customer' || (user?.role as any) === UserRole.Customer) {
        // For customers, download the receipt
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${transactionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showNotification('Receipt downloaded successfully', NotificationType.SUCCESS);
      } else {
        // For Admin/BranchManager, open in new tab
        window.open(url, '_blank');
        showNotification('Receipt opened in new tab', NotificationType.SUCCESS);
      }
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showNotification('Failed to load receipt', NotificationType.ERROR);
    }
  }, [showNotification, user?.role]);

  const downloadStatement = useCallback(async () => {
    try {
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : undefined;
      const toDate = filters.toDate ? new Date(filters.toDate) : undefined;
      const blob = await transactionService.downloadPdfStatement(fromDate, toDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification('Statement downloaded successfully', NotificationType.SUCCESS);
    } catch (error) {
      showNotification('Failed to download statement', NotificationType.ERROR);
    }
  }, [showNotification, filters.fromDate, filters.toDate]);



  // Utility functions (available for future use)
  // const getTransactionIcon = (transaction: TransactionDetailDto) => {
  //   if (transaction.direction === TransactionDirection.Credit) {
  //     return <ArrowDownward sx={{ color: 'success.main', fontSize: 16 }} />;
  //   } else {
  //     return <ArrowUpward sx={{ color: 'error.main', fontSize: 16 }} />;
  //   }
  // };

  // const getTransactionColor = (transaction: TransactionDetailDto) => {
  //   return transaction.direction === TransactionDirection.Credit ? 'success.main' : 'error.main';
  // };

  // const formatAmount = (amount: number, direction: TransactionDirection) => {
  //   const sign = direction === TransactionDirection.Credit ? '+' : '-';
  //   return `${sign}₹${amount.toLocaleString()}`;
  // };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {selectedAccountNumber ? `Account Statement - ${String(selectedAccountNumber).replace(/[<>"'&]/g, '')}` : 'Transaction History'}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadStatement}
          >
            Download Statement
          </Button>
          {((user?.role as any) === 'Customer' || (user?.role as any) === UserRole.Customer) && hasApprovedAccount && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/transactions/transfer')}
            >
              New Transfer
            </Button>
          )}
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <FilterList />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            {((user?.role as any) === 'BranchManager' || (user?.role as any) === UserRole.BranchManager) && (
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Account Number"
                  value={filters.accountNumber}
                  onChange={(e) => dispatchFilter({ type: 'SET_FILTER', field: 'accountNumber', value: e.target.value })}
                  placeholder="Search by account..."
                />
              </Grid>
            )}
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) => dispatchFilter({ type: 'SET_FILTER', field: 'search', value: e.target.value })}
                placeholder="Description, amount..."
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                value={filters.fromDate}
                onChange={(e) => dispatchFilter({ type: 'SET_FILTER', field: 'fromDate', value: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                value={filters.toDate}
                onChange={(e) => dispatchFilter({ type: 'SET_FILTER', field: 'toDate', value: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Transaction Type"
                  onChange={(e) => dispatchFilter({ type: 'SET_FILTER', field: 'type', value: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="0">Deposit</MenuItem>
                  <MenuItem value="1">Withdrawal</MenuItem>
                  <MenuItem value="2">Transfer</MenuItem>
                  <MenuItem value="3">Bill Payment</MenuItem>
                  <MenuItem value="4">Loan Payment</MenuItem>
                  <MenuItem value="5">Investment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Direction</InputLabel>
                <Select
                  value={filters.accountType}
                  label="Direction"
                  onChange={(e) => dispatchFilter({ type: 'SET_FILTER', field: 'accountType', value: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="credit">Money In (Credits)</MenuItem>
                  <MenuItem value="debit">Money Out (Debits)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => dispatchFilter({ type: 'SET_FILTER', field: 'status', value: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Processing">Processing</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="Requires Approval">Requires Approval</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Reversed">Reversed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {!transactionHistory || transactionHistory.transactions.length === 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center" py={8}>
                  {((user?.role as any) === 'Customer' || (user?.role as any) === UserRole.Customer) && !hasApprovedAccount ? (
                    <>
                      <Typography variant="h6" color="error" gutterBottom>
                        Account Not Approved
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your account is still pending approval. Transaction history will be available once your account is verified.
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No transactions found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {hasApprovedAccount ? 'Start making transactions to see your history here' : 'Transaction history will be available once your account is verified'}
                      </Typography>
                    </>
                  )}
                </Box>
              ) : (
                <>
                  {/* Account Summary for Customer */}
                  {((user?.role as any) === 'Customer' || (user?.role as any) === UserRole.Customer) && transactionHistory && (
                    <Box mb={3} p={2} bgcolor="background.paper" borderRadius={1}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            {selectedAccountNumber ? `Account Balance (${selectedAccountNumber})` : 'Portfolio Balance'}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">₹{transactionHistory.currentBalance.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="body2" color="text.secondary">Total Credits</Typography>
                          <Typography variant="h6" color="success.main" fontWeight="bold">+₹{transactionSummary.totalCredits.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="body2" color="text.secondary">Total Debits</Typography>
                          <Typography variant="h6" color="error.main" fontWeight="bold">-₹{transactionSummary.totalDebits.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="body2" color="text.secondary">Total Transactions</Typography>
                          <Typography variant="h6" fontWeight="bold">{transactionSummary.totalTransactions}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Other Party</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Reference</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <Suspense fallback={<TableRow><TableCell colSpan={6}><CircularProgress /></TableCell></TableRow>}>
                          {filteredTransactions.slice((page - 1) * 10, page * 10).map((transaction) => (
                            <TransactionRow 
                              key={transaction.id} 
                              transaction={transaction}
                              onDownloadReceipt={downloadReceipt}
                              userRole={user?.role}
                              userAccountNumber={selectedAccountNumber || transactionHistory?.accountNumber}
                            />
                          ))}
                        </Suspense>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              {transactionHistory && filteredTransactions.length > 0 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={Math.ceil(filteredTransactions.length / 10)}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionsPage;
