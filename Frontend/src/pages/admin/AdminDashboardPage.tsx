import React, { useState, useEffect, useCallback, useMemo, use } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  AccountBalance,
  PendingActions,
} from '@mui/icons-material';
import { Branch, BranchType, branchService } from '@/services/branchService';
import { analyticsService, AdminDashboardData } from '@/services/analyticsService';
import { useAdminDashboard } from '@/context/AdminDashboardContext';
import { useNotification } from '@/context/NotificationContext';
import BranchDetailsModal from '@/components/admin/BranchDetailsModal';
import BranchFormModal from '@/components/admin/BranchFormModal';
import ProfessionalLoader from '@/components/ui/ProfessionalLoader';
import { useNavigate } from 'react-router-dom';
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
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboardPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { data, loading, error, loadData, clearData } = useAdminDashboard();
  

  
  const branches = data?.branches || [];
  const accounts = data?.accounts || [];
  const transactions = data?.transactions || [];
  const dashboardData = data?.analytics;
  const branchManagerStatuses = data?.branchManagerStatuses || [];
  const [selectedBranch] = useState<Branch | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; branch: Branch | null }>({
    open: false,
    branch: null,
  });

  const { showNotification } = useNotification();

  // Data is already loaded by AdminDashboardProvider on mount

  useEffect(() => {
    if (error) {
      showNotification(error, 'error' as any);
    }
  }, [error, showNotification]);

  const refreshData = useCallback(() => {
    loadData(true);
  }, [loadData]);


  const handleEdit = useCallback((branch: Branch, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    setEditingBranch(branch);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (branch: Branch) => {
    try {
      await branchService.deleteBranch(branch.id);
      clearData();
      showNotification('Branch deleted successfully', 'success' as any);
      refreshData();
      setDeleteDialog({ open: false, branch: null });
    } catch (error) {
      showNotification('Failed to delete branch', 'error' as any);
    }
  }, [clearData, refreshData, showNotification]);

  const handleToggleStatus = useCallback(async (branch: Branch) => {
    try {
      await branchService.toggleBranchStatus(branch.id);
      clearData();
      showNotification(`Branch ${branch.isActive ? 'deactivated' : 'activated'} successfully`, 'success' as any);
      refreshData();
    } catch (error) {
      showNotification('Failed to update branch status', 'error' as any);
    }
  }, [clearData, refreshData, showNotification]);

  const getBranchTypeLabel = useCallback((type: BranchType): string => {
    switch (type) {
      case BranchType.Main: return 'Main Branch';
      case BranchType.Sub: return 'Sub Branch';
      case BranchType.Regional: return 'Regional Branch';
      default: return 'Sub Branch';
    }
  }, []);

  const getBranchManagerStatus = useCallback((branchId: number): boolean => {
    const status = branchManagerStatuses.find(s => s.branchId === branchId);
    return status?.hasBranchManager || false;
  }, [branchManagerStatuses]);



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

  if (loading) return <ProfessionalLoader message="Loading admin dashboard..." variant="page" />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingBranch(null);
            setShowForm(true);
          }}
        >
          Add Branch
        </Button>
      </Box>

      {dashboardData && (
        <>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Overview Statistics
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
                title="Pending Approvals"
                value={dashboardData.overviewStats.pendingAccounts + dashboardData.overviewStats.pendingTransactions}
                icon={<PendingActions />}
                color="#d32f2f"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Transaction Trends (Last 30 Days)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.transactionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="transactionCount" stroke="#8884d8" name="Transactions" />
                      <Line type="monotone" dataKey="transactionVolume" stroke="#82ca9d" name="Volume" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Type Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData.accountTypeDistribution as any}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ accountType, percentage }) => `${accountType} (${(percentage as number).toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {dashboardData.accountTypeDistribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Branch Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.branchPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branchName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalAccounts" fill="#8884d8" name="Total Accounts" />
                      <Bar dataKey="activeAccounts" fill="#82ca9d" name="Active Accounts" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activities
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Activity</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Branch</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.recentActivities.map((activity: any, index: number) => {
                          const getTransactionTypeLabel = (activityType: string) => {
                            switch (activityType?.toLowerCase()) {
                              case 'deposit': return 'Cash Deposit';
                              case 'withdrawal': return 'Cash Withdrawal';
                              case 'transfer': return 'Money Transfer';
                              default: return activityType || 'Transaction';
                            }
                          };
                          
                          const getTransactionColor = (activityType: string) => {
                            switch (activityType?.toLowerCase()) {
                              case 'deposit': return 'success';
                              case 'withdrawal': return 'error';
                              case 'transfer': return 'warning';
                              default: return 'default';
                            }
                          };
                          
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Chip 
                                  label={getTransactionTypeLabel(activity.activityType)}
                                  size="small" 
                                  color={getTransactionColor(activity.activityType)}
                                />
                              </TableCell>
                              <TableCell>{activity.description || `${getTransactionTypeLabel(activity.activityType)} of ₹${activity.amount?.toLocaleString()}`}</TableCell>
                              <TableCell>{activity.userName || 'N/A'}</TableCell>
                              <TableCell>{activity.branchName || 'N/A'}</TableCell>
                              <TableCell>
                                {activity.amount ? `₹${Math.abs(activity.amount).toLocaleString()}` : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {new Date(activity.timestamp).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      <Typography variant="h5" fontWeight="bold" mb={2}>
        Branch Management
      </Typography>

      <Grid container spacing={3}>
        {branches.map((branch) => (
          <Grid item xs={12} md={6} lg={4} key={branch.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
              onClick={() => navigate(`/admin/branches/${branch.id}`)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BusinessIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      {branch.branchName}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={0.5} onClick={(e) => e.stopPropagation()}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/admin/branches/${branch.id}`);
                      }}
                    >
                      View
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(branch);
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Code: {branch.branchCode}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Type: {getBranchTypeLabel(branch.branchType)}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  {branch.city}, {branch.state}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  📞 {branch.phoneNumber || 'Not provided'}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  ✉️ {branch.email || 'Not provided'}
                </Typography>

                <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                  <Chip
                    label={branch.isActive ? 'Active' : 'Inactive'}
                    color={branch.isActive ? 'success' : 'error'}
                    size="small"
                    onClick={() => handleToggleStatus(branch)}
                    clickable
                  />
                  <Chip 
                    label={getBranchTypeLabel(branch.branchType)} 
                    color={branch.branchType === BranchType.Main ? 'primary' : 'default'} 
                    size="small" 
                  />
                  <Chip 
                    label={getBranchManagerStatus(branch.id) ? 'Has Manager' : 'No Manager'} 
                    color={getBranchManagerStatus(branch.id) ? 'success' : 'warning'} 
                    size="small" 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <BranchDetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        branch={selectedBranch}
      />

      <BranchFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        branch={editingBranch}
        onSuccess={() => {
          clearData();
          refreshData();
          setShowForm(false);
        }}
      />

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, branch: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete "{deleteDialog.branch?.branchName}"? This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, branch: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => deleteDialog.branch && handleDelete(deleteDialog.branch)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default AdminDashboardPage;
