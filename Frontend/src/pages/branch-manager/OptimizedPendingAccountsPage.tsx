import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Cancel, Refresh } from '@mui/icons-material';
import { useBranchManagerWorkspace } from '@/hooks/useBranchManagerWorkspace';
import { accountService } from '@/services/accountService';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';

const OptimizedPendingAccountsPage: React.FC = () => {
  const { pendingItems, loading, refreshData } = useBranchManagerWorkspace();
  
  // Debug logging
  console.log('OptimizedPendingAccountsPage - pendingItems:', pendingItems);
  console.log('OptimizedPendingAccountsPage - loading:', loading);
  const { showNotification } = useNotification();
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Use cached pending accounts data
  const pendingAccounts = useMemo(() => {
    return pendingItems?.accounts || [];
  }, [pendingItems]);

  const handleAction = async (accountId: number, isApproved: boolean, remarks?: string) => {
    try {
      setActionLoading(accountId);
      
      await accountService.verifyAccountByBranchManager(accountId, {
        isApproved,
        remarks: remarks || undefined
      });

      showNotification(
        `Account ${isApproved ? 'approved' : 'rejected'} successfully`,
        isApproved ? NotificationType.SUCCESS : NotificationType.INFO
      );

      // Refresh the workspace data to update the UI
      await refreshData();
      
      setSelectedAccount(null);
      setRemarks('');
      setActionType(null);
    } catch (error: any) {
      showNotification(error.message || 'Failed to process account', NotificationType.ERROR);
    } finally {
      setActionLoading(null);
    }
  };

  const openActionDialog = (account: any, type: 'approve' | 'reject') => {
    setSelectedAccount(account);
    setActionType(type);
    setRemarks('');
  };

  const closeActionDialog = () => {
    setSelectedAccount(null);
    setActionType(null);
    setRemarks('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading pending accounts...
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Pending Account Approvals</Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => refreshData()}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {pendingAccounts.length === 0 ? (
        <Alert severity="info">
          No pending accounts found. All accounts have been processed.
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {pendingAccounts.length} Pending Account{pendingAccounts.length !== 1 ? 's' : ''}
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Account Number</TableCell>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Account Type</TableCell>
                    <TableCell>Initial Balance</TableCell>
                    <TableCell>Application Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.accountNumber}</TableCell>
                      <TableCell>{account.userName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={account.accountType === 0 ? 'Savings' : account.accountType === 1 ? 'Current' : 'Minor'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>₹{account.balance.toLocaleString()}</TableCell>
                      <TableCell>{new Date(account.openedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip label="Pending" color="warning" size="small" />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => openActionDialog(account, 'approve')}
                            disabled={actionLoading === account.id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => openActionDialog(account, 'reject')}
                            disabled={actionLoading === account.id}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog open={!!selectedAccount} onClose={closeActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Account' : 'Reject Account'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to {actionType} the account for{' '}
            <strong>{selectedAccount?.userName}</strong>?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={`${actionType === 'approve' ? 'Approval' : 'Rejection'} Remarks (Optional)`}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            margin="normal"
            placeholder={`Enter ${actionType === 'approve' ? 'approval' : 'rejection'} remarks...`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog}>Cancel</Button>
          <Button
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            onClick={() => selectedAccount && handleAction(selectedAccount.id, actionType === 'approve', remarks)}
            disabled={actionLoading === selectedAccount?.id}
          >
            {actionLoading === selectedAccount?.id ? (
              <CircularProgress size={20} />
            ) : (
              `${actionType === 'approve' ? 'Approve' : 'Reject'} Account`
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OptimizedPendingAccountsPage;