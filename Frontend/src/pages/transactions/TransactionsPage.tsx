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
import { getTransactionDisplayData, getTransactionDirection } from '@/utils/transactionUtils';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { responsiveMixins } from '@/theme/responsive';

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
  // Use pre-calculated display data if available, otherwise calculate it
  const displayData = transaction.displayData || getTransactionDisplayData(transaction, userAccountNumber);
  
  return (
    <TableRow>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          {(userRole !== 'Admin' && userRole !== UserRole.Admin) && (
            displayData.direction === TransactionDirection.Credit ? 
              <ArrowDownward sx={{ color: 'success.main', fontSize: 16 }} /> :
              <ArrowUpward sx={{ color: 'error.main', fontSize: 16 }} />
          )}
          <Typography variant="body2">
            {(() => {
              if (!displayData.transactionDate) return 'N/A';
              const date = new Date(displayData.transactionDate);
              if (isNaN(date.getTime())) return 'N/A';
              return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
              });
            })()}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {displayData.displayDescription || getTransactionTypeLabel(displayData.transactionType)}
        </Typography>
        {displayData.description && displayData.description !== displayData.displayDescription && (
          <Typography variant="caption" color="text.secondary" display="block">
            {displayData.description}
          </Typography>
        )}
      </TableCell>
      {(userRole === 'Admin' || userRole === UserRole.Admin) ? (
        <>
          <TableCell>
            <Typography variant="body2" fontWeight="medium">
              {displayData.fromAccountNumber || 'N/A'}
            </Typography>
            {displayData.fromAccountNumber && (
              <Typography variant="caption" color="error.main" display="block">
                -₹{displayData.amount.toLocaleString()}
              </Typography>
            )}
          </TableCell>
          <TableCell>
            <Typography variant="body2" fontWeight="medium">
              {displayData.toAccountNumber || 'N/A'}
            </Typography>
            {displayData.toAccountNumber && (
              <Typography variant="caption" color="success.main" display="block">
                +₹{displayData.amount.toLocaleString()}
              </Typography>
            )}
          </TableCell>
        </>
      ) : (
        <>
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
          </TableCell>
        </>
      )}
      <TableCell>
        <Typography variant="body2">
          {displayData.reference || displayData.transactionReference || displayData.transactionId || 'N/A'}
        </Typography>
      </TableCell>
      {(userRole !== 'Admin' && userRole !== UserRole.Admin) && (
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
      )}
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
  const [autoRefresh, setAutoRefresh] = useState(true);

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
  }
  
  // Only use customer context for customer users
  try {
    if (user?.role === UserRole.Customer) {
      customerData = useCustomer();
    }
  } catch {
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
    // Clear transaction history when user changes to prevent cross-user contamination
    setTransactionHistory(null);
    setLoading(true);
    
    if ((user?.role as any) === 'Customer' || (user?.role as any) === UserRole.Customer) {
      checkAccountApprovalAndFetchTransactions();
    } else {
      fetchAllTransactions();
    }
  }, [user?.id, user?.role, selectedAccountNumber, adminDashboardData?.data, adminDashboardData?.loading, customerData?.data?.personalInfo]);

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

  // Auto-refresh transactions every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !user?.id) return;
    
    const interval = setInterval(() => {
      // Only refresh if user is still authenticated
      if (!user?.id) {
        setAutoRefresh(false);
        return;
      }
      
      if ((user?.role as any) === 'Customer' || (user?.role as any) === UserRole.Customer) {
        checkAccountApprovalAndFetchTransactions();
      } else {
        fetchAllTransactions();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, user?.id, user?.role]);

  const checkAccountApprovalAndFetchTransactions = async () => {
    try {
      // Check if user is still authenticated
      if (!user?.id) {
        // User not authenticated, skipping transaction fetch
        return;
      }
      
      // Use consolidated customer data if available (no additional API calls)
      if (customerData?.data?.recentTransactions && !filters.fromDate && !filters.toDate && !selectedAccountNumber) {
        // Using consolidated customer data for transactions
        const consolidatedData: UserTransactionHistoryDto = {
          transactions: customerData.data.recentTransactions as unknown as TransactionDetailDto[],
          currentBalance: customerData.data.personalInfo?.totalBalance || 0,
          totalCredits: 0, // Will be calculated by frontend
          totalDebits: 0, // Will be calculated by frontend
          totalTransactions: customerData.data.recentTransactions?.length || 0,
          accountNumber: 'All Accounts',
          accountHolderName: customerData.data.personalInfo?.fullName || 'Customer'
        };
        setTransactionHistory(consolidatedData);
        setHasApprovedAccount(true);
        setLoading(false);
        return;
      }
      
      // Only make API call if filters are applied or consolidated data not available
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : undefined;
      const toDate = filters.toDate ? new Date(filters.toDate) : undefined;
      const targetAccountNumber = selectedAccountNumber || filters.accountNumber || undefined;
      
      // Making API call for filtered transactions
      const data = await transactionService.getUserTransactionHistory(fromDate, toDate, targetAccountNumber);
      setTransactionHistory(data);
      setHasApprovedAccount(true);
    } catch (error: any) {
      console.error('Failed to fetch user transactions:', error);
      
      // If it's an authentication error, don't show error notification
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        // Authentication error, user will be redirected to login
        setAutoRefresh(false);
        return;
      }
      
      setHasApprovedAccount(false);
      setTransactionHistory(null);
    } finally {
      setLoading(false);
    }
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
              // Use transaction type directly as it's already a number
              const transactionTypeNum = Number(t.transactionType);
              
              // Map status from string to number
              let statusNum = 2; // Default to completed
              if (t.status === 'Pending') statusNum = 0;
              else if (t.status === 'Processing') statusNum = 1;
              else if (t.status === 'Completed') statusNum = 2;
              
              // For admin view, show proper transaction details
              let otherPartyName = '';
              let description = t.description || '';
              
              switch (transactionTypeNum) {
                case 0: // Deposit
                  otherPartyName = 'Cash Deposit';
                  if (!description) description = `Cash Deposit to ${t.toAccountNumber || 'Account'}`;
                  break;
                case 1: // Withdrawal
                  otherPartyName = 'Cash Withdrawal';
                  if (!description) description = `Cash Withdrawal from ${t.fromAccountNumber || 'Account'}`;
                  break;
                case 2: // Transfer
                  otherPartyName = `Transfer: ${t.fromAccountNumber || 'Unknown'} → ${t.toAccountNumber || 'Unknown'}`;
                  if (!description) description = `Money Transfer from ${t.fromAccountNumber || 'Account'} to ${t.toAccountNumber || 'Account'}`;
                  break;
                default:
                  otherPartyName = getTransactionTypeLabel(transactionTypeNum);
                  if (!description) description = `${getTransactionTypeLabel(transactionTypeNum)} - ₹${t.amount}`;
              }
              
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
                amount: Math.abs(t.amount), // Always positive for display
                transactionType: transactionTypeNum,
                status: statusNum,
                description: description,
                reference: t.reference || t.transactionReference || t.transactionId,
                transactionDate: t.transactionDate,
                direction: TransactionDirection.Credit, // For admin view, don't show direction signs
                displayDescription: getTransactionTypeLabel(transactionTypeNum),
                otherPartyName: otherPartyName,
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
      // Date filters - normalize dates to avoid timezone issues
      if (filters.fromDate) {
        if (!transaction.transactionDate) return false;
        const transactionDate = new Date(transaction.transactionDate);
        if (isNaN(transactionDate.getTime())) return false;
        const fromDate = new Date(filters.fromDate + 'T00:00:00');
        if (transactionDate < fromDate) return false;
      }
      
      if (filters.toDate) {
        if (!transaction.transactionDate) return false;
        const transactionDate = new Date(transaction.transactionDate);
        if (isNaN(transactionDate.getTime())) return false;
        const toDate = new Date(filters.toDate + 'T23:59:59.999Z');
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
      const sortedTransactions = [...filtered].sort((a, b) => {
        const dateA = new Date(a.transactionDate);
        const dateB = new Date(b.transactionDate);
        
        // Handle invalid dates - put them at the end
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        return dateA.getTime() - dateB.getTime();
      });

      // Simple correct approach: Work backwards from current balance
      let currentBalance = transactionHistory.currentBalance;
      
      // Pre-calculate display data for all transactions to avoid repeated calculations
      const transactionsWithDisplayData = sortedTransactions.map(transaction => {
        const displayData = getTransactionDisplayData(transaction, selectedAccountNumber || transactionHistory?.accountNumber);
        return {
          ...transaction,
          displayData,
          // Override with enhanced display data for better UX
          displayDescription: displayData.displayDescription,
          otherPartyName: displayData.otherPartyName
        };
      });
      
      // Don't calculate balance - use backend provided balance or hide it
      // The balance calculation should come from backend for accuracy
      for (let i = 0; i < transactionsWithDisplayData.length; i++) {
        const transaction = transactionsWithDisplayData[i];
        // Only show balance if it's the user's own account transaction
        // For now, hide balance to avoid confusion until backend provides correct balance
        transaction.balanceAfterTransaction = undefined;
      }

      // Return in reverse chronological order (newest first) - real banking standard
      return transactionsWithDisplayData.reverse();
    } else {
      // For admin/branch manager, don't show balance (they see all accounts)
      return [...filtered].sort((a, b) => {
        const dateA = new Date(a.transactionDate);
        const dateB = new Date(b.transactionDate);
        
        // Handle invalid dates - put them at the end
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        return dateB.getTime() - dateA.getTime();
      });
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
      const displayData = (transaction as any).displayData || getTransactionDisplayData(transaction, selectedAccountNumber || transactionHistory?.accountNumber);
      
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
    <ResponsiveLayout>
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2} mb={3}>
        <Typography variant="h4" sx={{ wordBreak: 'break-word', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {selectedAccountNumber ? `Account Statement - ${String(selectedAccountNumber).replace(/[<>"'&]/g, '')}` : 'Transaction History'}
        </Typography>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadStatement}
            size="small"
          >
            Download Statement
          </Button>
          {((user?.role as any) === 'Customer' || (user?.role as any) === UserRole.Customer) && hasApprovedAccount && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/transactions/transfer')}
              size="small"
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
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <TextField
                  fullWidth
                  label="Account Number"
                  value={filters.accountNumber}
                  onChange={(e) => dispatchFilter({ type: 'SET_FILTER', field: 'accountNumber', value: e.target.value })}
                  placeholder="Search by account..."
                  size="small"
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) => dispatchFilter({ type: 'SET_FILTER', field: 'search', value: e.target.value })}
                placeholder="Description, amount..."
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                value={filters.fromDate}
                onChange={(e) => dispatchFilter({ type: 'SET_FILTER', field: 'fromDate', value: e.target.value })}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                value={filters.toDate}
                onChange={(e) => dispatchFilter({ type: 'SET_FILTER', field: 'toDate', value: e.target.value })}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <FormControl fullWidth size="small">
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
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Direction</InputLabel>
                <Select
                  value={filters.accountType}
                  label="Direction"
                  onChange={(e) => dispatchFilter({ type: 'SET_FILTER', field: 'accountType', value: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="credit">Money In</MenuItem>
                  <MenuItem value="debit">Money Out</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <FormControl fullWidth size="small">
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
                  <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: { xs: 600, sm: 750 } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 100 }}>Date</TableCell>
                          <TableCell sx={{ minWidth: 150 }}>Description</TableCell>
                          {((user?.role as any) === 'Admin' || (user?.role as any) === UserRole.Admin) ? (
                            <>
                              <TableCell sx={{ minWidth: 120 }}>From Account</TableCell>
                              <TableCell sx={{ minWidth: 120 }}>To Account</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell sx={{ minWidth: 120 }}>Other Party</TableCell>
                              <TableCell sx={{ minWidth: 100 }}>Amount</TableCell>
                            </>
                          )}
                          <TableCell sx={{ minWidth: 100 }}>Reference</TableCell>
                          {((user?.role as any) !== 'Admin' && (user?.role as any) !== UserRole.Admin) && (
                            <TableCell sx={{ minWidth: 80 }}>Actions</TableCell>
                          )}
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
    </ResponsiveLayout>
  );
};

export default TransactionsPage;
