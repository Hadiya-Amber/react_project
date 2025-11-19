import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import { analyticsService, CustomerFinancialSummary, CustomerMonthlyTrend, CustomerExpenseCategory } from '@/services/analyticsService';
import { NotificationType } from '@/types/notification';
import { useNotification } from '@/context/NotificationContext';
import { useCustomer } from '@/context/CustomerContext';

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState(6);
  const [financialSummary, setFinancialSummary] = useState<CustomerFinancialSummary | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<CustomerMonthlyTrend[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CustomerExpenseCategory[]>([]);
  const { showNotification } = useNotification();
  const { data: customerData } = useCustomer();

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [summary, trends, categories] = await Promise.all([
        analyticsService.getCustomerFinancialSummary(selectedPeriod),
        analyticsService.getCustomerMonthlyTrends(selectedPeriod),
        analyticsService.getCustomerExpenseCategories(selectedPeriod)
      ]);
      
      setFinancialSummary(summary);
      setMonthlyTrends(trends);
      setExpenseCategories(categories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      showNotification(errorMessage, NotificationType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = (months: number) => {
    switch (months) {
      case 3: return 'Last 3 Months';
      case 6: return 'Last 6 Months';
      case 12: return 'Last Year';
      default: return `Last ${months} Months`;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !financialSummary) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Financial Analytics
        </Typography>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Financial Analytics
        </Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={selectedPeriod}
            label="Period"
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
          >
            <MenuItem value={3}>Last 3 Months</MenuItem>
            <MenuItem value={6}>Last 6 Months</MenuItem>
            <MenuItem value={12}>Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Monthly Trends */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Income vs Expenses
              </Typography>
              {monthlyTrends.length > 0 ? (
                <Box>
                  {monthlyTrends.map((trend, index) => {
                    const maxAmount = Math.max(...monthlyTrends.map(t => Math.max(t.income, t.expenses)));
                    return (
                      <Box key={`${trend.month}-${trend.year}`} mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2">{trend.month} {trend.year}</Typography>
                          <Box display="flex" gap={2}>
                            <Typography variant="body2" color="success.main">
                              Income: ₹{trend.income.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="error.main">
                              Expenses: ₹{trend.expenses.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={(trend.income / maxAmount) * 100}
                            sx={{ flex: 1, height: 8 }}
                            color="success"
                          />
                          <LinearProgress
                            variant="determinate"
                            value={(trend.expenses / maxAmount) * 100}
                            sx={{ flex: 1, height: 8 }}
                            color="error"
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No transaction data available for the selected period.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Categories */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense Categories
              </Typography>
              {expenseCategories.length > 0 ? (
                <List>
                  {expenseCategories.map((category, index) => (
                    <Box key={category.category}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">{category.category}</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                ₹{category.amount.toLocaleString()}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {category.transactionCount} transactions • {category.percentage.toFixed(1)}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={category.percentage}
                                sx={{ mt: 1, height: 6 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < expenseCategories.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No expense data available for the selected period.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Income ({getPeriodLabel(selectedPeriod)})
              </Typography>
              <Typography variant="h4" color="success.main">
                ₹{financialSummary?.totalIncome.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Avg Monthly: ₹{financialSummary?.averageMonthlyIncome.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Expenses ({getPeriodLabel(selectedPeriod)})
              </Typography>
              <Typography variant="h4" color="error.main">
                ₹{financialSummary?.totalExpenses.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Avg Monthly: ₹{financialSummary?.averageMonthlyExpenses.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Net Savings ({getPeriodLabel(selectedPeriod)})
              </Typography>
              <Typography variant="h4" color="primary.main">
                ₹{financialSummary?.netSavings.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Current Balance: ₹{financialSummary?.currentBalance.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
