import React, { useState, useEffect } from 'react';
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
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { accountService, AccountReadDto, VerifyAccountDto } from '@/services/accountService';
import { AccountStatus, AccountType, UserRole } from '@/types';
import { NotificationType } from '@/types/notification';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { useBranchManagerStore } from '@/hooks/useBranchManagerStore';

const PendingAccountsPage: React.FC = () => {
  const { user } = useAuth();
  
  // Use store for branch managers, null for admins
  const storeData = user?.role === UserRole.BranchManager ? useBranchManagerStore() : { data: null, loading: false, refreshData: () => {} };
  const workspaceData = storeData.data;
  const contextLoading = storeData.loading;
  const refreshData = (storeData as any).refreshData || (() => {});
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<AccountReadDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [accountFilter, setAccountFilter] = useState('');
  const { showNotification } = useNotification();

  const getAccountTypeLabel = (type: any) => {
    const typeLabels: { [key: number]: string } = {
      0: 'Savings',
      1: 'Current', 
      2: 'Fixed Deposit',
      3: 'Recurring Deposit',
      4: 'Major',
      5: 'Minor',
      6: 'Girl Child Investment'
    };
    return typeLabels[Number(type)] || 'Unknown';
  };

  const getStatusLabel = (status: any) => {
    const statusLabels: { [key: number]: string } = {
      0: 'Pending',
      1: 'Verified',
      2: 'Active',
      3: 'Dormant',
      4: 'Closed',
      5: 'Rejected'
    };
    return statusLabels[Number(status)] || 'Unknown';
  };

  const getStatusColor = (status: any) => {
    const numStatus = Number(status);
    switch (numStatus) {
      case 0: return 'warning';  // Pending
      case 1: return 'info';     // Verified
      case 2: return 'success';  // Active
      case 3: return 'default';  // Dormant
      case 4: return 'default';  // Closed
      case 5: return 'error';    // Rejected
      default: return 'default';
    }
  };

  useEffect(() => {
    if (user?.role === UserRole.BranchManager) {
      // For branch managers, use workspace data if available
      if (workspaceData?.pendingItems?.accounts) {
        setAccounts(workspaceData.pendingItems.accounts);
      }
    } else {
      // For admins, fetch all pending accounts
      fetchPendingAccounts();
    }
  }, [user?.role, workspaceData?.pendingItems?.accounts]);

  const fetchPendingAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getPendingAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (account: AccountReadDto, action: 'approve' | 'reject') => {
    setSelectedAccount(account);
    setActionType(action);
    setRemarks('');
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedAccount) return;

    try {
      setIsApproving(true);
      await accountService.verifyAccountByBranchManager(selectedAccount.id, {
        isApproved: actionType === 'approve',
        remarks: remarks || undefined
      });
      
      showNotification(
        `Account ${actionType === 'approve' ? 'approved' : 'rejected'} successfully. Customer will be notified via email.`,
        NotificationType.SUCCESS
      );
      
      setDialogOpen(false);
      if (user?.role === UserRole.BranchManager && refreshData) {
        refreshData(); // Refresh workspace data
      } else {
        fetchPendingAccounts(); // Refresh the list for admins
      }
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : `Failed to ${actionType} account`,
        NotificationType.ERROR
      );
    } finally {
      setIsApproving(false);
    }
  };

  const handleStatusChange = async (accountId: number, action: 'dormant' | 'close') => {
    try {
      if (action === 'dormant') {
        await accountService.markAccountDormant(accountId);
        showNotification('Account marked as dormant', NotificationType.SUCCESS);
      } else if (action === 'close') {
        await accountService.closeAccount(accountId);
        showNotification('Account closed successfully', NotificationType.SUCCESS);
      }
      if (user?.role === UserRole.BranchManager && refreshData) {
        refreshData(); // Refresh workspace data
      } else {
        fetchPendingAccounts(); // Refresh the list for admins
      }
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : `Failed to ${action} account`,
        NotificationType.ERROR
      );
    }
  };

  if (loading || contextLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pending Account Approvals
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Filter by Account Number"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            placeholder="Enter account number to filter..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {accounts.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No pending accounts found.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Account Number</TableCell>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Account Type</TableCell>
                    <TableCell>Initial Deposit</TableCell>
                    <TableCell>Branch Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts
                    .filter(account => 
                      !accountFilter || 
                      account.accountNumber.toLowerCase().includes(accountFilter.toLowerCase())
                    )
                    .map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.accountNumber}</TableCell>
                      <TableCell>{account.userName || `User ${account.userId}`}</TableCell>
                      <TableCell>{getAccountTypeLabel(account.accountType)}</TableCell>
                      <TableCell>₹{account.balance.toLocaleString()}</TableCell>
                      <TableCell>{account.branchName || `Branch ${account.branchId}`}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(account.status)}
                          color={getStatusColor(account.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {account.status === 0 && ( // Pending
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckCircle />}
                                onClick={() => handleAction(account, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                startIcon={<Cancel />}
                                onClick={() => handleAction(account, 'reject')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {account.status === 2 && ( // Active
                            <>
                              <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                onClick={() => handleStatusChange(account.id, 'dormant')}
                              >
                                Mark Dormant
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleStatusChange(account.id, 'close')}
                              >
                                Close Account
                              </Button>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {accounts.filter(account => 
                    !accountFilter || 
                    account.accountNumber.toLowerCase().includes(accountFilter.toLowerCase())
                  ).length === 0 && accountFilter && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">
                          No accounts found matching "{accountFilter}"
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Account' : 'Reject Account'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to {actionType} this account?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks (Optional)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isApproving}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            disabled={isApproving}
          >
            {isApproving ? <CircularProgress size={20} /> : `${actionType === 'approve' ? 'Approve' : 'Reject'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingAccountsPage;
