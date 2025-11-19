import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useBranchManagerWorkspace } from '@/hooks/useBranchManagerWorkspace';
import { TransactionType, TransactionStatus } from '@/types';
import { NotificationType } from '@/types/notification';
import { useNotification } from '@/context/NotificationContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const BranchManagerReportsPage: React.FC = () => {
  const { workspaceData, loading, error } = useBranchManagerWorkspace();
  const { showNotification } = useNotification();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [filteredData, setFilteredData] = useState<any>(null);

  useEffect(() => {
    if (error) {
      showNotification(error, NotificationType.ERROR);
    }
  }, [error, showNotification]);

  // Prevent unnecessary re-fetching when component mounts
  useEffect(() => {
    // Only show notification if we already have data (coming from cache)
    if (workspaceData) {
      console.log('Reports page loaded with cached data');
    }
  }, []);

  // Filter data based on date range
  useEffect(() => {
    if (workspaceData) {
      const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const filtered = {
        ...workspaceData,
        dailyActivity: workspaceData.dailyActivity.filter(day => 
          new Date(day.date) >= cutoffDate
        ),
        customerSummary: workspaceData.customerSummary.filter(customer => 
          new Date(customer.lastActivity) >= cutoffDate
        )
      };
      
      setFilteredData(filtered);
    }
  }, [workspaceData, dateRange]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!filteredData) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Branch Reports
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              No data available for reports
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Prepare chart data from filtered data
  const transactionTypeData = [
    { name: 'Deposits', value: filteredData.dailyActivity.reduce((sum: number, day: any) => sum + day.deposits, 0) },
    { name: 'Withdrawals', value: filteredData.dailyActivity.reduce((sum: number, day: any) => sum + day.withdrawals, 0) },
    { name: 'Transfers', value: filteredData.dailyActivity.reduce((sum: number, day: any) => sum + day.transfers, 0) },
  ];

  return (
    <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Branch Reports
        </Typography>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRange}
                    label="Date Range"
                    onChange={(e) => setDateRange(e.target.value as any)}
                  >
                    <MenuItem value="week">Last Week</MenuItem>
                    <MenuItem value="month">Last Month</MenuItem>
                    <MenuItem value="quarter">Last Quarter</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Showing data for: {dateRange === 'week' ? 'Last 7 days' : dateRange === 'month' ? 'Last 30 days' : 'Last 90 days'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                {/* Future: Add custom date range picker */}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Accounts
                </Typography>
                <Typography variant="h4">
                  {filteredData.branchOverview.totalAccounts}
                </Typography>
                <Typography variant="body2" color="success.main">
                  {filteredData.branchOverview.activeAccounts} Active
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Branch: {filteredData.branchInfo.branchName}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Balance
                </Typography>
                <Typography variant="h4">
                  ₹{filteredData.branchOverview.totalBalance.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Branch-specific balance
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Today's Transactions
                </Typography>
                <Typography variant="h4">
                  {filteredData.branchOverview.todayTransactions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Transactions
                </Typography>
                <Typography variant="h4">
                  {filteredData.branchOverview.monthlyTransactions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} mb={4}>
          {/* Daily Activity Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Transaction Activity
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredData.dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="deposits" fill="#4caf50" name="Deposits" />
                    <Bar dataKey="withdrawals" fill="#f44336" name="Withdrawals" />
                    <Bar dataKey="transfers" fill="#2196f3" name="Transfers" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Transaction Type Distribution */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transaction Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={transactionTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {transactionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Customer Summary Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Customers by Balance (Branch: {filteredData.branchInfo.branchName})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Account Count</TableCell>
                    <TableCell>Total Balance</TableCell>
                    <TableCell>Account Types</TableCell>
                    <TableCell>Last Activity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.customerSummary.slice(0, 10).map((customer: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{customer.customerName}</TableCell>
                      <TableCell>{customer.accountCount}</TableCell>
                      <TableCell>₹{customer.totalBalance.toLocaleString()}</TableCell>
                      <TableCell>
                        {customer.accountTypes.map((type: any, idx: number) => (
                          <Chip
                            key={idx}
                            label={type}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        {new Date(customer.lastActivity).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
  );
};

export default BranchManagerReportsPage;