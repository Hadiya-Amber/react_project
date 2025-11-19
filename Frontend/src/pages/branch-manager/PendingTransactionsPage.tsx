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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { transactionService, TransactionReadDto } from '@/services/transactionService';
import { TransactionStatus, TransactionType } from '@/types';
import { NotificationType } from '@/types/notification';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { useBranchManagerStore } from '@/hooks/useBranchManagerStore';

const PendingTransactionsPage: React.FC = () => {
  const { pendingTransactions, loading: workspaceLoading } = useBranchManagerStore();
  const [transactions, setTransactions] = useState<TransactionReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionReadDto | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const { showNotification, addToHistory } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    // Use cached data only - no API calls
    if (pendingTransactions.length > 0) {
      setTransactions(pendingTransactions as any);
      setLoading(false);
    } else if (!workspaceLoading) {
      setLoading(false);
    }
  }, [pendingTransactions, workspaceLoading]);

  const handleAction = (transaction: TransactionReadDto, action: 'approve' | 'reject') => {
    setSelectedTransaction(transaction);
    setActionType(action);
    setRemarks('');
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedTransaction) return;

    setActionLoading(selectedTransaction.id);
    try {
      await transactionService.approveTransaction(selectedTransaction.id, {
        isApproved: actionType === 'approve',
        remarks: remarks || undefined
      });
      
      showNotification(
        `Transaction ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`,
        NotificationType.SUCCESS
      );
      
      // Add to notification history
      addToHistory({
        id: Date.now().toString(),
        type: 'success' as any,
        category: 'approval' as any,
        title: `Transaction ${actionType === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `Transaction of ₹${selectedTransaction.amount.toLocaleString()} has been ${actionType === 'approve' ? 'approved' : 'rejected'}`,
        timestamp: new Date(),
        read: false
      });
      
      setDialogOpen(false);
      // Remove from local state for immediate UI update - NO REFRESH NEEDED
      setTransactions(prev => prev.filter(t => t.id !== selectedTransaction.id));
      
      // Don't trigger workspace refresh to avoid multiple API calls
      // The transaction is already removed from local state
    } catch (error: any) {
      showNotification(error.message || `Failed to ${actionType} transaction`, NotificationType.ERROR);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.Pending: return 'warning';
      case TransactionStatus.Completed: return 'success';
      case TransactionStatus.Failed: return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.Deposit: return 'success';
      case TransactionType.Withdrawal: return 'error';
      case TransactionType.Transfer: return 'info';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Pending Transactions
      </Typography>

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No pending transactions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All transactions have been processed
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>From Account</TableCell>
                    <TableCell>To Account</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={TransactionType[transaction.transactionType]}
                          color={getTypeColor(transaction.transactionType) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{transaction.fromAccountNumber || 'N/A'}</TableCell>
                      <TableCell>{transaction.toAccountNumber || 'N/A'}</TableCell>
                      <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={TransactionStatus[transaction.status]}
                          color={getStatusColor(transaction.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{transaction.description || 'N/A'}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleAction(transaction, 'approve')}
                            disabled={actionLoading === transaction.id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleAction(transaction, 'reject')}
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
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Transaction' : 'Reject Transaction'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Transaction: {selectedTransaction?.transactionId}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Amount: ₹{selectedTransaction?.amount.toLocaleString()}
          </Typography>
          <TextField
            fullWidth
            label="Remarks (Optional)"
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            margin="normal"
            placeholder={`Add remarks for ${actionType}ing this transaction...`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmAction}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            disabled={actionLoading === selectedTransaction?.id}
          >
            {actionLoading === selectedTransaction?.id ? (
              <CircularProgress size={20} />
            ) : (
              actionType === 'approve' ? 'Approve' : 'Reject'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingTransactionsPage;
