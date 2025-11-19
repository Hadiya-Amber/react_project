import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  alpha,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  TrendingDown,
  SwapHoriz,
  Add,
  ArrowUpward,
  ArrowDownward,
  Person,
  Email,
  AccountBalanceWallet,
  Savings,
  CreditCard,
  History,
  PhotoCamera,
} from '@mui/icons-material';
import { colors } from '@/theme';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NotificationType } from '@/types/notification';
import { useNotification } from '@/context/NotificationContext';
import { useCustomer } from '@/context/CustomerContext';
import { useProfile } from '@/context/ProfileContext';

import PersistentBanner from '@/components/notifications/PersistentBanner';

import { useMinorAccountCheck } from '@/hooks/useMinorAccountCheck';

const CHART_COLORS = [colors.primary, colors.secondary, colors.accent, '#E57373'];

const CustomerDashboard: React.FC = React.memo(() => {
  const [showKycBanner, setShowKycBanner] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification, addToHistory } = useNotification();
  const { data: dashboardData, loading } = useCustomer();
  const { isMinorAccountBlocked, userAge } = useMinorAccountCheck();
  const { profileImage, setProfileImage } = useProfile();

  useEffect(() => {
    if (dashboardData) {
      checkAccountStatus();
      checkTransactionStatus();
    }
  }, [dashboardData]);
  
  useEffect(() => {
    // Check for updates every 30 seconds
    const interval = setInterval(() => {
      checkAccountStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAccountStatus = useCallback(async () => {
    if (!dashboardData?.accountDetails) return;
    
    try {
      const accounts = dashboardData.accountDetails;
      
      // Check for pending accounts
      const pendingAccounts = accounts.filter(acc => acc.status === 0); // Pending
      if (pendingAccounts.length > 0) {
        addToHistory({
          id: `customer-pending-${Date.now()}`,
          type: 'warning' as any,
          category: 'account' as any,
          title: 'Account Pending Approval',
          message: `Your account application is under review by branch manager`,
          timestamp: new Date(),
          read: false
        });
      }
      
      // Check for recently approved accounts (within last 24 hours)
      const recentlyApproved = accounts.filter(acc => {
        if (acc.status === 2) { // Active
          const dateValue = acc.updatedAt || acc.createdAt;
          if (!dateValue) return false;
          const updateDate = new Date(dateValue);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return updateDate > dayAgo;
        }
        return false;
      });
      
      if (recentlyApproved.length > 0) {
        recentlyApproved.forEach(account => {
          addToHistory({
            id: `customer-approved-${account.id}-${Date.now()}`,
            type: 'success' as any,
            category: 'account' as any,
            title: 'Account Approved! 🎉',
            message: `Congratulations! Your account ${account.accountNumber} has been approved by the branch manager and is now active`,
            timestamp: new Date(),
            read: false
          });
        });
        
        showNotification(
          `🎉 Great news! Your account has been approved and is now active!`,
          NotificationType.SUCCESS
        );
      }

    } catch (error) {
      console.error('Failed to check account status:', error);
    }
  }, [dashboardData?.accountDetails, addToHistory, showNotification]);

  const checkTransactionStatus = useCallback(() => {
    if (!dashboardData?.recentTransactions) return;

    // Only show pending notifications for high-value transactions (≥₹1,00,000)
    const highValuePendingTransactions = dashboardData.recentTransactions.filter(t => 
      (t.status === 'Pending' || t.status === 'PendingApproval') && t.amount >= 100000
    );
    
    if (highValuePendingTransactions.length > 0) {
      addToHistory({
        id: `customer-pending-txn-${Date.now()}`,
        type: 'info' as any,
        category: 'transaction' as any,
        title: 'High-Value Transaction Pending',
        message: `You have ${highValuePendingTransactions.length} high-value transaction${highValuePendingTransactions.length > 1 ? 's' : ''} (≥₹1,00,000) awaiting approval`,
        timestamp: new Date(),
        read: false
      });
    }
    
    const recentlyCompleted = dashboardData.recentTransactions.filter(t => {
      if (t.status === 'Completed' || t.status === 'Approved') {
        const txnDate = new Date(t.date);
        const hourAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        return txnDate > hourAgo;
      }
      return false;
    });
    
    if (recentlyCompleted.length > 0) {
      recentlyCompleted.forEach(txn => {
        addToHistory({
          id: `customer-completed-txn-${txn.transactionId}-${Date.now()}`,
          type: 'success' as any,
          category: 'transaction' as any,
          title: 'Transaction Completed ✅',
          message: `Your ${txn.type} of ₹${txn.amount.toLocaleString()} has been processed successfully`,
          timestamp: new Date(),
          read: false
        });
      });
      
      showNotification(
        `✅ Transaction completed! Your ${recentlyCompleted[0].type} has been processed.`,
        NotificationType.SUCCESS
      );
    }
  }, [dashboardData, addToHistory, showNotification]);



  const formatAmount = useCallback((amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboardData && !loading) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          Unable to load dashboard data
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Minor Account Upgrade Banner */}
      {isMinorAccountBlocked && (
        <PersistentBanner
          type="info"
          title="Minor Account Upgrade Available"
          message={`You have Minor accounts that are restricted for users ${userAge}+. You can continue using your other accounts for transactions, or upgrade your Minor account to unlock all features.`}
          action={{
            label: "Upgrade Minor Account",
            onClick: () => {
              navigate('/accounts/create');
              showNotification('Redirecting to create Major account', NotificationType.INFO);
            }
          }}
          onClose={() => {}}
        />
      )}
      
      {/* KYC Compliance Banner */}
      {showKycBanner && !isMinorAccountBlocked && (
        <PersistentBanner
          type="info"
          title="Complete Your KYC"
          message="Please ensure your KYC documents are up to date for seamless banking services."
          action={{
            label: "Update KYC",
            onClick: () => {
              navigate('/customer/profile');
              showNotification('Redirecting to profile for KYC update', NotificationType.INFO);
            }
          }}
          onClose={() => setShowKycBanner(false)}
        />
      )}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        borderRadius: 3,
        p: 4,
        mb: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center" gap={3}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={profileImage || undefined}
                  sx={{
                    width: 80,
                    height: 80,
                    border: '3px solid white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  {!profileImage && <Person sx={{ fontSize: 40 }} />}
                </Avatar>
                <Button
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    minWidth: 'auto',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: colors.accent,
                    color: 'white',
                    '&:hover': { backgroundColor: '#E6A052' },
                  }}
                >
                  <PhotoCamera sx={{ fontSize: 16 }} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setProfileImage(reader.result as string);
                          showNotification('Profile picture updated in dashboard and navbar!', NotificationType.SUCCESS);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Button>
              </Box>
              <Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  mb: 1,
                  color: 'white'
                }}>
                  Welcome back!
                </Typography>
                <Typography variant="h5" sx={{ 
                  opacity: 0.9,
                  fontWeight: 400,
                  color: 'white'
                }}>
                  {user?.fullName || 'Customer'}
                </Typography>
                <Typography variant="body1" sx={{ 
                  opacity: 0.8,
                  mt: 1,
                  color: 'white'
                }}>
                  Ready to manage your finances today?
                </Typography>
              </Box>
            </Box>
            <AccountBalanceWallet sx={{ 
              fontSize: 80,
              opacity: 0.2,
              position: 'absolute',
              right: 20,
              top: 20,
            }} />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => {
                navigate('/transactions/transfer');
                showNotification('Redirecting to transfer page', 'info' as any);
              }}
              sx={{
                backgroundColor: colors.accent,
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#E6A052',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(255, 178, 92, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              New Transaction
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Personal Info & Balance Card */}
      {dashboardData && (
        <>
          <Card sx={{ 
            mb: 3, 
            background: `linear-gradient(135deg, ${colors.surface} 0%, ${alpha(colors.primary, 0.02)} 100%)`,
            border: `2px solid ${colors.border}`,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body1" sx={{ 
                    color: colors.textSecondary,
                    fontWeight: 500,
                    mb: 1,
                  }}>
                    Total Portfolio Balance
                  </Typography>
                  <Typography variant="h2" sx={{
                    fontWeight: 700,
                    color: colors.textPrimary,
                    mb: 1,
                  }}>
                    {formatAmount(dashboardData.personalInfo?.totalBalance || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={`${dashboardData.personalInfo?.totalAccounts || 0} Account${(dashboardData.personalInfo?.totalAccounts || 0) !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(colors.secondary, 0.1),
                        color: colors.secondary,
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Active & Growing
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  borderRadius: '50%',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AccountBalance sx={{ fontSize: 40, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card sx={{ 
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                color: colors.textPrimary,
                fontWeight: 600,
                mb: 3,
              }}>
                Account Holder Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(colors.primary, 0.04),
                    border: `1px solid ${alpha(colors.primary, 0.1)}`,
                  }}>
                    <Avatar sx={{ 
                      backgroundColor: colors.primary,
                      width: 40,
                      height: 40,
                    }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ 
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: 0.5,
                      }}>
                        Full Name
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: colors.textPrimary,
                        fontWeight: 500,
                      }}>
                        {dashboardData.personalInfo?.fullName || user?.fullName || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(colors.secondary, 0.04),
                    border: `1px solid ${alpha(colors.secondary, 0.1)}`,
                  }}>
                    <Avatar sx={{ 
                      backgroundColor: colors.secondary,
                      width: 40,
                      height: 40,
                    }}>
                      <Email />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ 
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: 0.5,
                      }}>
                        Email Address
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: colors.textPrimary,
                        fontWeight: 500,
                      }}>
                        {dashboardData.personalInfo?.email || user?.email || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          color: colors.textPrimary,
          fontWeight: 600,
          mb: 2,
        }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ 
              textAlign: 'center', 
              cursor: 'pointer',
              borderRadius: 3,
              border: `1px solid ${colors.border}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${alpha(colors.primary, 0.15)}`,
                borderColor: colors.primary,
              }
            }} onClick={() => {
              navigate('/transactions/transfer');
              showNotification('Opening transfer form', 'info' as any);
            }}>
              <CardContent sx={{ p: 3 }}>
                <Avatar sx={{ 
                  bgcolor: colors.primary,
                  mx: 'auto', 
                  mb: 2,
                  width: 56,
                  height: 56,
                }}>
                  <SwapHoriz fontSize="large" />
                </Avatar>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600,
                  color: colors.textPrimary,
                }}>
                  Transfer
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: colors.textSecondary,
                }}>
                  Send money instantly
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ 
              textAlign: 'center', 
              cursor: 'pointer',
              borderRadius: 3,
              border: `1px solid ${colors.border}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${alpha(colors.secondary, 0.15)}`,
                borderColor: colors.secondary,
              }
            }} onClick={() => {
              navigate('/transactions/deposit');
              showNotification('Opening deposit form', 'info' as any);
            }}>
              <CardContent sx={{ p: 3 }}>
                <Avatar sx={{ 
                  bgcolor: colors.secondary,
                  mx: 'auto', 
                  mb: 2,
                  width: 56,
                  height: 56,
                }}>
                  <Savings fontSize="large" />
                </Avatar>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600,
                  color: colors.textPrimary,
                }}>
                  Deposit
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: colors.textSecondary,
                }}>
                  Add funds securely
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ 
              textAlign: 'center', 
              cursor: 'pointer',
              borderRadius: 3,
              border: `1px solid ${colors.border}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${alpha(colors.error, 0.15)}`,
                borderColor: colors.error,
              }
            }} onClick={() => {
              navigate('/transactions/withdraw');
            }}>
              <CardContent sx={{ p: 3 }}>
                <Avatar sx={{ 
                  bgcolor: colors.error,
                  mx: 'auto', 
                  mb: 2,
                  width: 56,
                  height: 56,
                }}>
                  <CreditCard fontSize="large" />
                </Avatar>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600,
                  color: colors.textPrimary,
                }}>
                  Withdraw
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: colors.textSecondary,
                }}>
                  Access your funds
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ 
              textAlign: 'center', 
              cursor: 'pointer',
              borderRadius: 3,
              border: `1px solid ${colors.border}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${alpha(colors.accent, 0.15)}`,
                borderColor: colors.accent,
              }
            }} onClick={() => navigate('/transactions')}>
              <CardContent sx={{ p: 3 }}>
                <Avatar sx={{ 
                  bgcolor: colors.accent,
                  color: colors.textPrimary,
                  mx: 'auto', 
                  mb: 2,
                  width: 56,
                  height: 56,
                }}>
                  <History fontSize="large" />
                </Avatar>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600,
                  color: colors.textPrimary,
                }}>
                  History
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: colors.textSecondary,
                }}>
                  View all transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Stats Cards */}
      {dashboardData && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            color: colors.textPrimary,
            fontWeight: 600,
            mb: 2,
          }}>
            Monthly Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(colors.secondary, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(colors.secondary, 0.05)} 0%, ${colors.surface} 100%)`,
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ 
                      color: colors.textSecondary,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      Money Received
                    </Typography>
                    <TrendingUp sx={{ color: colors.secondary }} />
                  </Box>
                  <Typography variant="h4" sx={{
                    color: colors.secondary,
                    fontWeight: 700,
                  }}>
                    +{formatAmount(dashboardData.monthlyStats?.receivedThisMonth || 0)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    This month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(colors.error, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(colors.error, 0.05)} 0%, ${colors.surface} 100%)`,
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ 
                      color: colors.textSecondary,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      Money Spent
                    </Typography>
                    <TrendingDown sx={{ color: colors.error }} />
                  </Box>
                  <Typography variant="h4" sx={{
                    color: colors.error,
                    fontWeight: 700,
                  }}>
                    -{formatAmount(dashboardData.monthlyStats?.spentThisMonth || 0)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    This month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(colors.primary, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(colors.primary, 0.05)} 0%, ${colors.surface} 100%)`,
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ 
                      color: colors.textSecondary,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      Total Transactions
                    </Typography>
                    <SwapHoriz sx={{ color: colors.primary }} />
                  </Box>
                  <Typography variant="h4" sx={{
                    color: colors.primary,
                    fontWeight: 700,
                  }}>
                    {dashboardData.monthlyStats?.transactionsThisMonth || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    This month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Account Summary & Recent Transactions */}
      {dashboardData && (
        <Grid container spacing={3} mb={3}>
          {/* Account Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Accounts
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Account</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Balance</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.accountSummary.map((account) => (
                        <TableRow key={account.accountId}>
                          <TableCell>{account.accountNumber}</TableCell>
                          <TableCell>{account.accountType}</TableCell>
                          <TableCell align="right">{formatAmount(account.balance)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={account.status} 
                              size="small" 
                              color={account.status === 'Active' ? 'success' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} md={6}>
            <Card>
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
                    <Button variant="contained" onClick={() => {
                      navigate('/transactions/transfer');
                      showNotification('Let\'s create your first transaction!', 'success' as any);
                    }}>
                      Make Your First Transaction
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {dashboardData.recentTransactions.slice(0, 5).map((transaction) => (
                      <ListItem key={transaction.transactionId} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: (transaction.type.toLowerCase().includes('deposit') || transaction.type.toLowerCase().includes('received') || transaction.type.toLowerCase().includes('transfer')) ? 'success.main' : 'error.main' 
                          }}>
                            {(transaction.type.toLowerCase().includes('deposit') || transaction.type.toLowerCase().includes('received') || transaction.type.toLowerCase().includes('transfer')) ? <ArrowDownward /> : <ArrowUpward />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={transaction.description || transaction.type}
                          secondary={new Date(transaction.date).toLocaleDateString()}
                        />
                        <Box textAlign="right">
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={(transaction.type.toLowerCase().includes('deposit') || transaction.type.toLowerCase().includes('received') || transaction.type.toLowerCase().includes('transfer')) ? 'success.main' : 'error.main'}
                          >
                            {(transaction.type.toLowerCase().includes('deposit') || transaction.type.toLowerCase().includes('received') || transaction.type.toLowerCase().includes('transfer')) ? '+' : '-'}{formatAmount(transaction.amount)}
                          </Typography>
                          <Chip 
                            label={transaction.status} 
                            size="small" 
                            color={transaction.status === 'Completed' ? 'success' : 'warning'}
                          />
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

    </Box>
  );
});

export default CustomerDashboard;
