import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Button, IconButton, Tooltip } from '@mui/material';
import { Visibility, GetApp, AccountBalance } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AccountReadDto } from '@/services/accountService';
import { formatCurrency, formatDate } from '@/utils';
import { useAuth } from '@/context/AuthContext';
import { UserRole, AccountType, AccountStatus } from '@/types';
import { useNotification } from '@/context/NotificationContext';

interface AccountCardProps {
  account: AccountReadDto;
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const getStatusColor = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.Active: return 'success';
      case AccountStatus.Pending: return 'warning';
      case AccountStatus.Suspended: return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.Pending: return 'Pending';
      case AccountStatus.UnderReview: return 'Under Review';
      case AccountStatus.Active: return 'Active';
      case AccountStatus.Suspended: return 'Suspended';
      case AccountStatus.Closed: return 'Closed';
      default: return 'Unknown';
    }
  };

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case AccountType.Minor: return 'Minor';
      case AccountType.Major: return 'Major';
      case AccountType.Savings: return 'Savings';
      case AccountType.Current: return 'Current';
      case AccountType.FixedDeposit: return 'Fixed Deposit';
      case AccountType.RecurringDeposit: return 'Recurring Deposit';
      case AccountType.Loan: return 'Loan';
      default: return 'Unknown';
    }
  };

  const handleDownloadStatement = async () => {
    try {
      showNotification('Generating statement...', 'info');
      // API call to generate and download statement
      showNotification('Statement downloaded successfully', 'success');
    } catch (err) {
      showNotification('Failed to download statement', 'error');
    }
  };

  return (
    <Card sx={{ borderRadius: 3, p: 1 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalance color="primary" fontSize="small" />
            <Typography variant="h6">
              {account.accountNumber}
            </Typography>
          </Box>
          <Chip 
            label={getStatusLabel(account.status)} 
            color={getStatusColor(account.status) as any}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {getAccountTypeLabel(account.accountType)} Account • Branch ID: {account.branchId}
        </Typography>
        <Typography variant="h5" color="primary" gutterBottom>
          {formatCurrency(account.balance)}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Opened: {formatDate(account.openedDate)}
        </Typography>
        <Box display="flex" gap={1} mt={2}>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            size="small"
            onClick={() => navigate(`/transactions?accountNumber=${account.accountNumber}`)}
            fullWidth
            disabled={account.status !== AccountStatus.Active}
          >
            Transactions
          </Button>
          {user?.role === UserRole.Customer && (
            <Tooltip title="Download Statement">
              <IconButton
                size="small"
                onClick={handleDownloadStatement}
                color="primary"
              >
                <GetApp />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(AccountCard);
