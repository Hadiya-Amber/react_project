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
import { transactionService } from '@/services/transactionService';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';

const OptimizedPendingTransactionsPage: React.FC = () => {
  const { pendingItems, loading, refreshData } = useBranchManagerWorkspace();
  const { showNotification } = useNotification();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Use cached pending transactions data
  const pendingTransactions = useMemo(() => {
    return pendingItems?.transactions || [];
  }, [pendingItems]);

  const getTransactionTypeLabel = (type: number) => {
    switch (type) {
      case 0: return 'Deposit';
      case 1: return 'Withdrawal';
      case 2: return 'Transfer';
      default: return 'Unknown';
    }
  };

  const handleAction = async (transactionId: number, isApproved: boolean, remarks?: string) => {
    try {
      setActionLoading(transactionId);
      
      await transactionService.approveTransaction(transactionId, {
        isApproved,
        remarks: remarks || undefined
      });

      showNotification(
        `Transaction ${isApproved ? 'approved' : 'rejected'} successfully`,
        isApproved ? NotificationType.SUCCESS : NotificationType.INFO
      );

      // Refresh the workspace data to update the UI
      await refreshData();
      
      setSelectedTransaction(null);
      setRemarks('');
      setActionType(null);
    } catch (error: any) {
      showNotification(error.message || 'Failed to process transaction', NotificationType.ERROR);
    } finally {
      setActionLoading(null);
    }
  };

  const openActionDialog = (transaction: any, type: 'approve' | 'reject') => {
    setSelectedTransaction(transaction);
    setActionType(type);
    setRemarks('');
  };

  const closeActionDialog = () => {
    setSelectedTransaction(null);
    setActionType(null);
    setRemarks('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading pending transactions...
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Pending Transaction Approvals</Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => refreshData()}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {pendingTransactions.length === 0 ? (
        <Alert severity="info">
          No pending transactions found. All transactions have been processed.
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {pendingTransactions.length} Pending Transaction{pendingTransactions.length !== 1 ? 's' : ''}
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>From Account</TableCell>
                    <TableCell>To Account</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getTransactionTypeLabel(transaction.transactionType)} 
                          size="small"
                          color={transaction.transactionType === 0 ? 'success' : transaction.transactionType === 1 ? 'error' : 'info'}
                        />
                      </TableCell>
                      <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>{transaction.fromAccountId || 'N/A'}</TableCell>
                      <TableCell>{transaction.toAccountId || 'N/A'}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{new Date(transaction.transactionDate).toLocaleDateString()}</TableCell>
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
                            onClick={() => openActionDialog(transaction, 'approve')}
                            disabled={actionLoading === transaction.id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => openActionDialog(transaction, 'reject')}
                            disabled={actionLoading === transaction.id}
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
      <Dialog open={!!selectedTransaction} onClose={closeActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Transaction' : 'Reject Transaction'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to {actionType} this transaction of{' '}
            <strong>₹{selectedTransaction?.amount.toLocaleString()}</strong>?
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
            onClick={() => selectedTransaction && handleAction(selectedTransaction.id, actionType === 'approve', remarks)}
            disabled={actionLoading === selectedTransaction?.id}
          >
            {actionLoading === selectedTransaction?.id ? (
              <CircularProgress size={20} />
            ) : (
              `${actionType === 'approve' ? 'Approve' : 'Reject'} Transaction`
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OptimizedPendingTransactionsPage;