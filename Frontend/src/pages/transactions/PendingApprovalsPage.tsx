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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user';
import { transactionService, TransactionReadDto } from '@/services/transactionService';
import { TransactionType, TransactionStatus } from '@/types';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';

const PendingApprovalsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    transaction: TransactionReadDto | null;
    isApproving: boolean;
  }>({ open: false, transaction: null, isApproving: true });
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user?.role === UserRole.BranchManager || user?.role === UserRole.Admin) {
      fetchPendingTransactions();
    }
  }, [user]);

  const fetchPendingTransactions = async () => {
    setLoading(true);
    try {
      const data = await transactionService.getPendingTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch pending transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalClick = (transaction: TransactionReadDto, isApproving: boolean) => {
    setApprovalDialog({ open: true, transaction, isApproving });
    setRemarks('');
  };

  const handleApprovalSubmit = async () => {
    if (!approvalDialog.transaction) return;

    setProcessing(true);
    try {
      await transactionService.approveTransaction(approvalDialog.transaction.id, {
        isApproved: approvalDialog.isApproving,
        remarks: remarks || undefined
      });

      const action = approvalDialog.isApproving ? 'approved' : 'rejected';
      showNotification(`Transaction ${action} successfully!`, NotificationType.SUCCESS);
      
      setApprovalDialog({ open: false, transaction: null, isApproving: true });
      setRemarks('');
      fetchPendingTransactions();
    } catch (error: any) {
      showNotification(error.message || 'Failed to process approval', NotificationType.ERROR);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.Pending: return 'warning';
      case TransactionStatus.Pending: return 'info';
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

  if (user?.role !== UserRole.BranchManager && user?.role !== UserRole.Admin) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="error">
          Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Only Branch Managers and Admins can access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pending Transaction Approvals
      </Typography>

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Pending Transactions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All transactions have been processed.
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
                      <TableCell>
                        <Typography fontWeight="bold">
                          ₹{transaction.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={TransactionStatus[transaction.status]}
                          color={getStatusColor(transaction.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleApprovalClick(transaction, true)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleApprovalClick(transaction, false)}
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

      <Dialog open={approvalDialog.open} onClose={() => setApprovalDialog({ open: false, transaction: null, isApproving: true })}>
        <DialogTitle>
          {approvalDialog.isApproving ? 'Approve' : 'Reject'} Transaction
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Transaction Amount: ₹{approvalDialog.transaction?.amount.toLocaleString()}
          </Typography>
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
          <Button onClick={() => setApprovalDialog({ open: false, transaction: null, isApproving: true })}>
            Cancel
          </Button>
          <Button
            onClick={handleApprovalSubmit}
            variant="contained"
            color={approvalDialog.isApproving ? 'success' : 'error'}
            disabled={processing}
          >
            {processing ? <CircularProgress size={20} /> : (approvalDialog.isApproving ? 'Approve' : 'Reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingApprovalsPage;
