import React, { useState, useEffect, useCallback, useMemo, use } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  VpnKey as PasswordIcon,
  AccountBalance as BranchIcon,
  People as CustomersIcon,
  Assessment as ReportsIcon,
  TrendingUp,
  PendingActions,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useBranchManagerWorkspace } from '@/hooks/useBranchManagerWorkspace';
import { useNotification } from '@/context/NotificationContext';
import { debugAuth } from '@/utils/authDebug';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const BranchManagerDashboard: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { showNotification, addToHistory } = useNotification();
  const { workspaceData, loading, error } = useBranchManagerWorkspace();
  const user = authService.getCurrentUser();

  // Debug authentication on component mount
  useEffect(() => {
    debugAuth();
  }, []);

  useEffect(() => {
    if (error) {
      showNotification(error, 'error' as any);
    }
  }, [error, showNotification]);

  useEffect(() => {
    if (workspaceData) {
      // Add notifications for pending items (only once per session)
      const notificationKey = `notifications-${workspaceData.branchInfo.branchId}`;
      const lastNotified = sessionStorage.getItem(notificationKey);
      
      const accountsCount = workspaceData.pendingItems.accounts?.length || 0;
      const transactionsCount = workspaceData.pendingItems.transactions?.length || 0;
      const currentHash = `${accountsCount}-${transactionsCount}`;
      
      if (lastNotified !== currentHash) {
        if (accountsCount > 0) {
          const message = `You have ${accountsCount} pending account${accountsCount > 1 ? 's' : ''}. Please use the dashboard for account management.`;
          addToHistory({
            id: `pending-accounts-${Date.now()}`,
            type: 'warning' as any,
            category: 'approval' as any,
            title: 'Pending Account Approvals',
            message: message,
            timestamp: new Date(),
            read: false
          });
        }
        
        if (transactionsCount > 0) {
          addToHistory({
            id: `pending-transactions-${Date.now()}`,
            type: 'warning' as any,
            category: 'approval' as any,
            title: 'Pending Transaction Approvals',
            message: `You have ${transactionsCount} pending transaction${transactionsCount > 1 ? 's' : ''}. Please use the dashboard for transaction management.`,
            timestamp: new Date(),
            read: false
          });
        }
        
        sessionStorage.setItem(notificationKey, currentHash);
      }
    }
  }, [workspaceData, addToHistory]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }> = React.memo(({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  ));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Branch Manager Dashboard
      </Typography>

      {/* Welcome Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              {user?.fullName?.charAt(0) || 'BM'}
            </Avatar>
            <Box>
              <Typography variant="h6">
                Welcome, {user?.fullName || 'Branch Manager'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {workspaceData?.branchInfo?.branchName || `Branch ID: ${user?.branchId || 'N/A'}`}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PasswordIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Update your account password
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/change-password')}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CustomersIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Manage Accounts
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Approve pending accounts
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  navigate('/accounts/pending');
                  showNotification('Opening pending account approvals', 'info' as any);
                }}
              >
                Pending Accounts
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BranchIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Transactions
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Approve pending transactions
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  navigate('/transactions/pending');
                  showNotification('Opening pending transaction approvals', 'info' as any);
                }}
              >
                Pending Transactions
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ReportsIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Reports
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                View branch reports
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  navigate('/branch-manager/reports');
                  showNotification('Opening branch reports', 'info' as any);
                }}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statistics */}
      <Typography variant="h6" gutterBottom>
        Branch Statistics
      </Typography>
      
      {workspaceData ? (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={3}>
              <StatCard
                title="Total Accounts"
                value={workspaceData.branchOverview.totalAccounts}
                icon={<BranchIcon />}
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard
                title="Active Accounts"
                value={workspaceData.branchOverview.activeAccounts}
                icon={<CustomersIcon />}
                color="#2e7d32"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard
                title="Pending Approvals"
                value={(workspaceData.pendingItems.accounts?.length || 0) + (workspaceData.pendingItems.transactions?.length || 0)}
                icon={<PendingActions />}
                color="#ed6c02"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard
                title="Total Balance"
                value={`₹${workspaceData.branchOverview.totalBalance.toLocaleString()}`}
                icon={<TrendingUp />}
                color="#2e7d32"
              />
            </Grid>
          </Grid>

          {/* Charts and Analytics */}
          <Grid container spacing={3} mb={4}>
            {/* Daily Activity Chart */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Daily Activity (Last 7 Days)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workspaceData.dailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="transactions" fill="#8884d8" name="Transactions" />
                      <Bar dataKey="volume" fill="#82ca9d" name="Volume (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Monthly Performance */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    This Month
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {workspaceData.branchOverview.todayTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Transactions
                  </Typography>
                  <Typography variant="h6" color="success.main" mt={2}>
                    {workspaceData.branchOverview.monthlyTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Customer Summary */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Customers
              </Typography>
              <Grid container spacing={2}>
                {workspaceData.customerSummary.slice(0, 6).map((customer, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {customer.customerName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {customer.accountCount} Account{customer.accountCount !== 1 ? 's' : ''}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          ₹{customer.totalBalance.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Types: {customer.accountTypes.join(', ')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">
                  Loading...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
});

export default BranchManagerDashboard;
