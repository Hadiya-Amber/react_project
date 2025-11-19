import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  AccountBalance,
  TrendingUp,
  Assessment,
  PendingActions,
  MonetizationOn,
  Group,
} from '@mui/icons-material';
import { analyticsService } from '@/services/analyticsService';
import { NotificationType } from '@/types/notification';
import { useNotification } from '@/context/NotificationContext';
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const EnhancedAdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [transactionTrends, setTransactionTrends] = useState<any[]>([]);
  const [accountDistribution, setAccountDistribution] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      const [
        dashboard,
        trends,
        distribution,
        revenue,
        growth,
        customers,
        branches
      ] = await Promise.all([
        analyticsService.getAdminDashboardData(),
        analyticsService.getAdminTransactionTrends(30),
        analyticsService.getAdminAccountDistribution(),
        analyticsService.getAdminMonthlyRevenue(12),
        analyticsService.getAdminUserGrowth(12),
        analyticsService.getAdminTopCustomers(10),
        analyticsService.getAdminBranchPerformance()
      ]);

      setDashboardData(dashboard);
      setTransactionTrends(trends);
      setAccountDistribution(distribution);
      setMonthlyRevenue(revenue);
      setUserGrowth(growth);
      setTopCustomers(customers);
      setBranchPerformance(branches);
    } catch (error: any) {
      showNotification(error.message || 'Failed to load analytics data', NotificationType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
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
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Admin Analytics Dashboard
      </Typography>

      {/* Overview Stats */}
      {dashboardData && (
        <>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            System Overview
          </Typography>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Branches"
                value={dashboardData.overviewStats.totalBranches}
                icon={<BusinessIcon />}
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Customers"
                value={dashboardData.overviewStats.totalCustomers}
                icon={<PersonIcon />}
                color="#2e7d32"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Accounts"
                value={dashboardData.overviewStats.totalAccounts}
                icon={<AccountBalance />}
                color="#ed6c02"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending Items"
                value={dashboardData.overviewStats.pendingAccounts + dashboardData.overviewStats.pendingTransactions}
                icon={<PendingActions />}
                color="#d32f2f"
                subtitle="Accounts & Transactions"
              />
            </Grid>
          </Grid>
        </>
      )}

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        {/* Transaction Trends */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transaction Trends (Last 30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={transactionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="totalTransactions" stackId="1" stroke="#8884d8" fill="#8884d8" name="Transactions" />
                  <Area type="monotone" dataKey="totalAmount" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Amount (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Type Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={accountDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ accountType, percentage }: any) => `${accountType} (${(percentage as number).toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {accountDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Revenue */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Revenue Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (₹)" />
                  <Line type="monotone" dataKey="transactionCount" stroke="#82ca9d" name="Transactions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* User Growth */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Growth (Last 12 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newUsers" fill="#8884d8" name="New Users" />
                  <Bar dataKey="customerCount" fill="#82ca9d" name="Customers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Branch Performance */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Branch Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={branchPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="branchName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalAccounts" fill="#8884d8" name="Total Accounts" />
                  <Bar dataKey="activeAccounts" fill="#82ca9d" name="Active Accounts" />
                  <Bar dataKey="totalBalance" fill="#ffc658" name="Total Balance (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Customers by Balance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer Name</TableCell>
                      <TableCell align="right">Total Balance</TableCell>
                      <TableCell align="center">Accounts</TableCell>
                      <TableCell align="center">Transactions</TableCell>
                      <TableCell>Last Activity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topCustomers.map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip label={`#${index + 1}`} size="small" color="primary" />
                            {customer.customerName}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            ₹{customer.totalBalance.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{customer.accountCount}</TableCell>
                        <TableCell align="center">{customer.transactionCount}</TableCell>
                        <TableCell>
                          {customer.lastTransactionDate 
                            ? new Date(customer.lastTransactionDate).toLocaleDateString()
                            : 'No transactions'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedAdminDashboard;
