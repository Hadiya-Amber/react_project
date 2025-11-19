import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  TrendingDown,
  SwapHoriz,
  Add,
  ArrowUpward,
  ArrowDownward,
  Payment,
} from '@mui/icons-material';
import ProfessionalDashboard, { QuickActions } from '@/components/ui/ProfessionalDashboard';
import ProfessionalCard from '@/components/ui/ProfessionalCard';
import ProfessionalButton from '@/components/ui/ProfessionalButton';
import ProfessionalLoader from '@/components/ui/ProfessionalLoader';
import { designTokens } from '@/theme/designTokens';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';
import { UserRole } from '@/types';
import { useNavigate } from 'react-router-dom';
import { TransactionType, TransactionStatus, TransactionDirection } from '@/types';
import { 
  transactionService, 
  DashboardTransactionSummary, 
  TransactionDetailDto
} from '@/services/transactionService';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [dashboardData, setDashboardData] = useState<DashboardTransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect users to their specific dashboards
  useEffect(() => {
    if (user?.role === UserRole.Admin) {
      navigate('/admin/branches', { replace: true });
      return;
    }
    if (user?.role === UserRole.BranchManager) {
      navigate('/branch-manager/dashboard', { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getDashboardTransactionSummary();
      setDashboardData(data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      showNotification(error.message || 'Failed to load dashboard data', NotificationType.ERROR);
      setDashboardData({
        recentTransactions: [],
        currentBalance: 0,
        availableBalance: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number | undefined) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return <ProfessionalLoader message="Loading your dashboard..." variant="page" />;
  }

  if (!dashboardData) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          Unable to load dashboard data
        </Typography>
        <Button onClick={fetchDashboardData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  const dashboardMetrics = [
    {
      title: 'Available Balance',
      value: formatAmount(dashboardData.currentBalance),
      icon: <AccountBalance />,
      color: 'primary' as const,
    },
    {
      title: 'Total Transactions',
      value: dashboardData.recentTransactions?.length.toString() || '0',
      change: {
        value: '+12%',
        type: 'increase' as const,
      },
      icon: <SwapHoriz />,
      color: 'secondary' as const,
    },
    {
      title: 'Monthly Spending',
      value: '₹25,430',
      change: {
        value: '-8%',
        type: 'decrease' as const,
      },
      icon: <TrendingDown />,
      color: 'success' as const,
    },
    {
      title: 'Savings Goal',
      value: '78%',
      change: {
        value: '+5%',
        type: 'increase' as const,
      },
      icon: <TrendingUp />,
      color: 'error' as const,
    },
  ];

  const quickActions = [
    {
      title: 'Transfer Money',
      description: 'Send money instantly',
      icon: <SwapHoriz />,
      onClick: () => navigate('/transactions/transfer'),
      color: 'primary' as const,
    },
    {
      title: 'Deposit Funds',
      description: 'Add money to account',
      icon: <TrendingUp />,
      onClick: () => navigate('/transactions/deposit'),
      color: 'success' as const,
    },
    {
      title: 'Withdraw Cash',
      description: 'Withdraw from account',
      icon: <TrendingDown />,
      onClick: () => navigate('/transactions/withdraw'),
      color: 'warning' as const,
    },
    {
      title: 'View History',
      description: 'Transaction records',
      icon: <Payment />,
      onClick: () => navigate('/transactions'),
      color: 'secondary' as const,
    },
  ];

  return (
    <ProfessionalDashboard
      title={`Welcome back, ${user?.fullName || 'Customer'}!`}
      subtitle="Manage your banking operations with ease"
      metrics={dashboardMetrics}
    >
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: designTokens.typography.fontWeight.semibold,
              color: designTokens.colors.neutral[800],
            }}
          >
            Quick Actions
          </Typography>
          <ProfessionalButton
            variant="primary"
            startIcon={<Add />}
            onClick={() => navigate('/transactions/transfer')}
          >
            New Transaction
          </ProfessionalButton>
        </Box>
        
        <QuickActions actions={quickActions} />
      </Box>

      {/* Recent Transactions */}
      <ProfessionalCard variant="elevated">
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Recent Transactions
            </Typography>
            <Button onClick={() => navigate('/transactions')}>
              View All
            </Button>
          </Box>

          {!dashboardData.recentTransactions || dashboardData.recentTransactions.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                No recent transactions
              </Typography>
              <ProfessionalButton variant="primary" onClick={() => navigate('/transactions/transfer')}>
                Make Your First Transaction
              </ProfessionalButton>
            </Box>
          ) : (
            <List>
              {dashboardData.recentTransactions.slice(0, 5).map((transaction, index) => (
                <ListItem key={transaction?.id || index} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: transaction?.direction === TransactionDirection.Credit ? 'success.main' : 'error.main' 
                    }}>
                      {transaction?.direction === TransactionDirection.Credit ? <ArrowDownward /> : <ArrowUpward />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={transaction?.displayDescription || `Transaction ${index + 1}`}
                    secondary={`${transaction?.otherPartyName || 'Unknown'} • ${transaction?.transactionDate ? new Date(transaction.transactionDate).toLocaleDateString() : 'Today'}`}
                  />
                  <Box textAlign="right">
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={transaction?.direction === TransactionDirection.Credit ? 'success.main' : 'error.main'}
                    >
                      {transaction?.direction === TransactionDirection.Credit ? '+' : '-'}{formatAmount(transaction?.amount || 0)}
                    </Typography>
                    <Chip 
                      label={TransactionStatus[transaction?.status || 0] || 'Completed'} 
                      size="small" 
                      color="success"
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </ProfessionalCard>
    </ProfessionalDashboard>
  );
};

export default DashboardPage;
