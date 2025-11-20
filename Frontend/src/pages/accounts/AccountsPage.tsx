import React, { useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  Box,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Add, Warning, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { accountService } from '@/services/accountService';
import { UserRole } from '@/types';
import { NotificationType } from '@/types/notification';
import { AccountReadDto } from '@/services/accountService';
import { AccountCard, ProfessionalLoader } from '@/components';
import StatusDropdown from '@/components/StatusDropdown';
import { useAdminDashboard } from '@/context/AdminDashboardContext';
import { useCustomer } from '@/context/CustomerContext';
import { useNotification } from '@/context/NotificationContext';


const AccountsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AccountReadDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userAge, setUserAge] = useState<number | null>(null);
  const [hasMinorAccounts, setHasMinorAccounts] = useState(false);
  
  // Try to get admin dashboard data if available
  let adminDashboardData = null;
  let customerData = null;
  try {
    adminDashboardData = useAdminDashboard();
  } catch {
    // Not in admin context, ignore
  }
  
  // Only use customer context for customer users
  try {
    if (user?.role === UserRole.Customer) {
      customerData = useCustomer();
    }
  } catch {
  }
  
  const isAdmin = (user?.role as any) === 'Admin' || user?.role === UserRole.Admin;
  const isCustomer = (user?.role as any) === 'Customer' || user?.role === UserRole.Customer;
  const { showNotification } = useNotification();

  const handleRefresh = async () => {
    if (isCustomer && customerData?.refreshData) {
      try {
        setIsLoading(true);
        await customerData.refreshData();
        showNotification('Accounts refreshed successfully', 'success' as any);
      } catch (error) {
        showNotification('Failed to refresh accounts', 'error' as any);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchAccountsData = async () => {
      if (!user) return;
      
      // Debug logging
      console.log('AccountsPage - User role:', user.role);
      console.log('AccountsPage - Customer data:', customerData?.data);
      console.log('AccountsPage - Customer loading:', customerData?.loading);
      
      try {
        setError('');
        
        if (isCustomer) {
          if (customerData?.loading) {
            setIsLoading(true);
            return;
          }
          
          if (customerData?.data?.accountDetails && customerData.data.accountDetails.length > 0) {
            setAccounts(customerData.data.accountDetails);
       
            if (customerData.data.minorAccountCheck) {
              setUserAge(customerData.data.minorAccountCheck.userAge);
              setHasMinorAccounts(customerData.data.minorAccountCheck.hasMinorAccounts);
            }
            setIsLoading(false);
          } else {
            // Fallback: fetch accounts directly if context data is not available
            try {
              setIsLoading(true);
              const data = await accountService.getMyAccounts();
              setAccounts(data);
              setIsLoading(false);
            } catch (err) {
              console.error('Failed to fetch customer accounts:', err);
              setAccounts([]);
              setIsLoading(false);
            }
          }
        } else if (isAdmin) {
          if (adminDashboardData?.loading) {
            setIsLoading(true);
            return;
          }
          
          if (adminDashboardData?.data?.accounts && adminDashboardData.data.accounts.length > 0) {
            setAccounts(adminDashboardData.data.accounts);
            setIsLoading(false);
          } else if (!adminDashboardData?.loading) {
            setAccounts([]);
            setIsLoading(false);
          }
        } else {
          setIsLoading(true);
          const data = await accountService.getAllAccounts();
          setAccounts(data);
          setIsLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setIsLoading(false);
      }
    };

    fetchAccountsData();
  }, [user, adminDashboardData?.data, adminDashboardData?.loading, customerData?.data, customerData?.loading]);

  if (isLoading) {
    return <ProfessionalLoader message="Loading accounts..." variant="inline" />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          {isCustomer ? 'My Accounts' : 'All Accounts'}
        </Typography>
        {isCustomer && (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/accounts/create')}
            >
              Create Account
            </Button>
          </Box>
        )}
      </Box>

      {userAge !== null && userAge >= 18 && hasMinorAccounts && (
        <Alert 
          severity="warning" 
          icon={<Warning />}
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => navigate('/accounts/create')}
            >
              Upgrade Now
            </Button>
          }
        >
          <span>
            <strong>Account Upgrade Required:</strong> You have Minor accounts but are now {userAge} years old. 
            Please upgrade to a Major account to continue enjoying full banking services.
          </span>
        </Alert>
      )}

      {((user?.role as any) === 'Admin' || user?.role === UserRole.Admin) ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Number</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Account Type</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Opened Date</TableCell>

              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell>
                    {account.userName || account.userEmail || (account.userId ? `User ${account.userId}` : 'N/A')}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const type = account.accountType;
                      switch (Number(type)) {
                        case 0: return 'Minor';
                        case 1: return 'Savings';
                        case 2: return 'Savings';
                        case 3: return 'Current';
                        case 4: return 'Major';
                        case 5: return 'Fixed Deposit';
                        case 6: return 'Recurring Deposit';
                        default: return 'Unknown';
                      }
                    })()} 
                  </TableCell>
                  <TableCell>{account.branchName || `Branch ${account.branchId}`}</TableCell>
                  <TableCell>₹{account.balance.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusDropdown
                      accountId={account.id}
                      value={account.status}
                      onStatusChange={async (newStatus) => {
                        try {
                          const statusLabels = {
                            0: 'Pending',
                            1: 'Under Review', 
                            2: 'Active',
                            3: 'Dormant',
                            4: 'Closed',
                            5: 'Suspended'
                          };
                          
                          const statusLabel = statusLabels[newStatus as keyof typeof statusLabels] || 'Unknown';
                          
                          // Show success notification
                          showNotification(
                            `Account ${account.accountNumber} has been successfully updated to ${statusLabel} status.`,
                            NotificationType.SUCCESS
                          );
                          
                          // Update local state immediately for instant feedback
                          setAccounts(prev => prev.map(acc => 
                            acc.id === account.id ? {...acc, status: newStatus} : acc
                          ));
                        } catch (error) {
                          showNotification('Failed to update account status. Please try again.', NotificationType.ERROR);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {account.openedDate ? 
                      new Date(account.openedDate).toLocaleDateString() : 
                      'N/A'
                    }
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} md={6} lg={4} key={account.id}>
              <AccountCard account={account} />
            </Grid>
          ))}
        </Grid>
      )}

      {accounts.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No accounts found
          </Typography>
          {isCustomer && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/accounts/create')}
              sx={{ mt: 2 }}
            >
              Create Your First Account
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AccountsPage;
