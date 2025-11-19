import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  CircularProgress,
} from '@mui/material';
import { AccountStatus, AccountType } from '@/types';
import { NotificationType } from '@/types/notification';
import { accountService, AccountReadDto, VerifyAccountDto } from '@/services/accountService';
import { authService } from '@/services/authService';
import { useNotification } from '@/context/NotificationContext';
import { useBranchManagerStore } from '@/hooks/useBranchManagerStore';

const PendingAccountsPage: React.FC = () => {
  const { showNotification, addToHistory } = useNotification();
  const { pendingAccounts, loading: workspaceLoading } = useBranchManagerStore();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountReadDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Only use cached data - no API calls
    if (pendingAccounts.length > 0) {
      setAccounts(pendingAccounts);
    }
  }, [pendingAccounts]);

  const handleApprove = (account: AccountReadDto) => {
    setSelectedAccount(account);
    setRemarks('');
    setDialogOpen(true);
  };

  const handleReject = (account: AccountReadDto) => {
    setSelectedAccount(account);
    setRemarks('');
    setDialogOpen(true);
  };

  const processAccount = async (isApproved: boolean) => {
    if (!selectedAccount) return;

    setProcessing(true);
    try {
      // Optimistic update - remove from local state immediately
      setAccounts(prev => prev.filter(acc => acc.id !== selectedAccount.id));
      
      const data: VerifyAccountDto = {
        isApproved,
        remarks: remarks || undefined
      };

      await accountService.verifyAccountByBranchManager(selectedAccount.id, data);
      showNotification(
        `Account ${isApproved ? 'approved' : 'rejected'} successfully`,
        NotificationType.SUCCESS
      );
      
      addToHistory({
        id: Date.now().toString(),
        type: 'success' as any,
        category: 'approval' as any,
        title: `Account ${isApproved ? 'Approved' : 'Rejected'}`,
        message: `Account ${selectedAccount.accountNumber} has been ${isApproved ? 'approved' : 'rejected'}`,
        timestamp: new Date(),
        read: false
      });
      
      // No need to refresh - optimistic update handles UI
      setDialogOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      // Revert optimistic update on error
      setAccounts(prev => [...prev, selectedAccount]);
      showNotification('Failed to process account', NotificationType.ERROR);
    } finally {
      setProcessing(false);
    }
  };

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

  if (workspaceLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Pending Account Approvals
      </Typography>

      <Card>
        <CardContent>
          {accounts.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No pending accounts for approval
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
                  {accounts.map((account) => (
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
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleApprove(account)}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleReject(account)}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Approval/Rejection Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAccount ? `Process Account ${selectedAccount.accountNumber}` : 'Process Account'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Remarks (Optional)"
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={() => processAccount(false)}
            color="error"
            variant="contained"
            disabled={processing}
          >
            Reject
          </Button>
          <Button
            onClick={() => processAccount(true)}
            color="success"
            variant="contained"
            disabled={processing}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingAccountsPage;