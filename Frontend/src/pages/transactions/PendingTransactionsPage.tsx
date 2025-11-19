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
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import { CheckCircle, Cancel, Refresh } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { useBranchManagerStore } from '@/hooks/useBranchManagerStore';
import { transactionService, TransactionReadDto } from '@/services/transactionService';
import { TransactionType } from '@/types';

const PendingTransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const storeData = user?.role === 'BranchManager' ? useBranchManagerStore() : { data: null, loading: false, refreshData: null };
  const [transactions, setTransactions] = useState<TransactionReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionReadDto | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [isApproving, setIsApproving] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user?.role === 'BranchManager') {
      // For branch managers, don't make API calls - direct to dashboard
      setTransactions([]);
      setLoading(false);
    } else {
      fetchPendingTransactions();
    }
  }, [user?.role]);

  const fetchPendingTransactions = async () => {
    setLoading(true);
    try {
      let data: TransactionReadDto[];
      if (user?.branchId) {
        data = await transactionService.getPendingTransactionsByBranch(user.branchId);
      } else {
        data = await transactionService.getPendingTransactions();
      }
      setTransactions(data);
    } catch (error: any) {
      showNotification(error.message || 'Failed to fetch pending transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = (transaction: TransactionReadDto, approve: boolean) => {
    setSelectedTransaction(transaction);
    setIsApproving(approve);
    setRemarks('');
    setApprovalDialog(true);
  };

  const processApproval = async () => {
    if (!selectedTransaction) return;
    
    if (!isApproving && !remarks.trim()) {
      showNotification('Rejection reason is required', 'error');
      return;
    }
    
    setActionLoading(selectedTransaction.id);
    try {
      console.log('Approving transaction:', selectedTransaction.id, {
        isApproved: isApproving,
        remarks: remarks || undefined
      });
      
      await transactionService.approveTransaction(selectedTransaction.id, {
        isApproved: isApproving,
        remarks: remarks || undefined
      });
      
      showNotification(
        `Transaction ${isApproving ? 'approved' : 'rejected'} successfully`,
        'success'
      );
      
      setApprovalDialog(false);
      if (user?.role === 'BranchManager' && storeData.refreshData) {
        storeData.refreshData();
      } else {
        fetchPendingTransactions();
      }
    } catch (error: any) {
      console.error('Approval error:', error);
      showNotification(error.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getTransactionTypeLabel = (type: TransactionType | number): string => {
    switch (Number(type)) {
      case 0: return 'Deposit';
      case 1: return 'Withdrawal';
      case 2: return 'Transfer';
      case 3: return 'Bill Payment';
      case 4: return 'Loan Payment';
      default: return 'Transaction';
    }
  };

  const getTransactionTypeColor = (type: TransactionType | number) => {
    switch (Number(type)) {
      case 0: return 'success';
      case 1: return 'warning';
      case 2: return 'info';
      case 3: return 'secondary';
      case 4: return 'primary';
      default: return 'default';
    }
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Pending Transaction Approvals
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchPendingTransactions}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {user?.role === 'BranchManager' ? 'Branch Manager Transactions' : 'No Pending Transactions'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role === 'BranchManager' 
                  ? `You have ${storeData.data?.pendingItems?.transactions || 0} pending transactions. Please use the dashboard for transaction management.`
                  : 'All transactions have been processed'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            You have {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} pending approval
          </Alert>
          
          <Card>
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>From Account</TableCell>
                      <TableCell>To Account</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Reference</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(transaction.transactionDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getTransactionTypeLabel(transaction.transactionType)}
                            color={getTransactionTypeColor(transaction.transactionType)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.fromAccountNumber || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.toAccountNumber || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {formatAmount(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.reference || transaction.transactionReference || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.description || 'No description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Approve">
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleApprovalAction(transaction, true)}
                                disabled={actionLoading === transaction.id}
                              >
                                {actionLoading === transaction.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <CheckCircle />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleApprovalAction(transaction, false)}
                                disabled={actionLoading === transaction.id}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isApproving ? 'Approve Transaction' : 'Reject Transaction'}
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">
                    {getTransactionTypeLabel(selectedTransaction.transactionType)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Amount</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatAmount(selectedTransaction.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Reference</Typography>
                  <Typography variant="body1">
                    {selectedTransaction.reference || selectedTransaction.transactionReference || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">
                    {formatDate(selectedTransaction.transactionDate)}
                  </Typography>
                </Grid>
              </Grid>
              
              {selectedTransaction.description?.toLowerCase().includes('cheque') && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Cheque Verification:</Typography>
                  <Typography variant="body2">
                    ✓ Verify cheque number: {selectedTransaction.reference}<br/>
                    ✓ Check date validity<br/>
                    ✓ Confirm amount matches<br/>
                    ✓ Verify signature
                  </Typography>
                </Alert>
              )}
              
              {selectedTransaction.amount >= 100000 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">High Value Transaction (≥₹1,00,000)</Typography>
                  <Typography variant="body2">
                    Additional verification required for large amounts.
                  </Typography>
                </Alert>
              )}
              
              <TextField
                fullWidth
                label={`${isApproving ? 'Approval' : 'Rejection'} Remarks ${!isApproving ? '(Required)' : '(Optional)'}`}
                multiline
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={isApproving ? 'Enter approval notes...' : 'Enter rejection reason (required)...'}
                required={!isApproving}
                error={!isApproving && !remarks.trim()}
                helperText={!isApproving && !remarks.trim() ? 'Rejection reason is required' : ''}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button
            onClick={processApproval}
            variant="contained"
            color={isApproving ? 'success' : 'error'}
            disabled={actionLoading !== null}
          >
            {actionLoading !== null ? (
              <CircularProgress size={20} />
            ) : (
              `${isApproving ? 'Approve' : 'Reject'} Transaction`
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingTransactionsPage;
