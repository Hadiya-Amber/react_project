import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Person,
  AccountBalance,
  TrendingUp,
  Assessment,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { branchService } from '@/services/branchService';
import { adminService } from '@/services/adminService';
import { ProfessionalLoader } from '@/components';
import { useNotification } from '@/context/NotificationContext';
import { useAdminDashboard } from '@/context/AdminDashboardContext';
import { Gender } from '@/services/userService';

interface BranchManager {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  designation?: string;
  employeeCode?: string;
  joinDate?: string;
  status: number;
  isActive: boolean;
  lastLoginDate?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  branchId?: number;
}

interface BranchStatistics {
  totalAccounts: number;
  activeAccounts: number;
  pendingAccounts: number;
  totalDeposits: number;
  totalCustomers: number;
  pendingTransactions: number;
  monthlyTransactionVolume: number;
  transactionsThisMonth: number;
}

interface BranchDetail {
  id: number;
  branchCode: string;
  branchName: string;
  address: string;
  city: string;
  state: string;
  ifscCode: string;
  phoneNumber?: string;
  email?: string;
  postalCode?: string;
  branchType: number;
  isMainBranch: boolean;
  isActive: boolean;
  createdAt: string;
  branchManager?: BranchManager;
  statistics: BranchStatistics;
}

const BranchDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { getBranchDetails, loading: dashboardLoading, loadData } = useAdminDashboard();
  const [branchDetail, setBranchDetail] = useState<BranchDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editManagerOpen, setEditManagerOpen] = useState(false);
  const [removeManagerOpen, setRemoveManagerOpen] = useState(false);
  const [managerForm, setManagerForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    designation: '',
    employeeCode: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    branchId: 0,
    isActive: true,
  });

  const fetchBranchDetails = useCallback(async (branchId: number) => {
    // Force refresh if no data available
    const branchData = getBranchDetails(branchId);
    if (!branchData) {
      await loadData(true);
    }
    const refreshedBranchData = getBranchDetails(branchId);
    if (refreshedBranchData) {
      setBranchDetail(refreshedBranchData);
      
      if (branchData.branchManager) {
        setManagerForm({
          fullName: branchData.branchManager.fullName,
          email: branchData.branchManager.email,
          phoneNumber: branchData.branchManager.phoneNumber,
          designation: branchData.branchManager.designation || '',
          employeeCode: branchData.branchManager.employeeCode || '',
          address: branchData.branchManager.address || '',
          dateOfBirth: branchData.branchManager.dateOfBirth || '',
          gender: branchData.branchManager.gender || 'Male',
          branchId: branchData.branchManager.branchId || branchData.id,
          isActive: branchData.branchManager.isActive,
        });
      }
    }
  }, [getBranchDetails]);

  useEffect(() => {
    if (id) {
      fetchBranchDetails(parseInt(id));
    }
  }, [id, fetchBranchDetails]);

  // Re-fetch when dashboard data changes
  useEffect(() => {
    if (id && !dashboardLoading) {
      const branchData = getBranchDetails(parseInt(id));
      if (branchData) {
        setBranchDetail(branchData);
      }
    }
  }, [id, getBranchDetails, dashboardLoading]);

  const handleEditManager = () => {
    console.log('Edit manager clicked');
    setEditManagerOpen(true);
  };

  const handleUpdateManager = async () => {
    if (!branchDetail?.branchManager) return;
    
    try {
      const updateData = {
        fullName: managerForm.fullName,
        email: managerForm.email,
        phoneNumber: managerForm.phoneNumber,
        address: managerForm.address || '',
        dateOfBirth: branchDetail.branchManager.dateOfBirth || new Date().toISOString().split('T')[0],
        gender: Gender.Male,
        branchId: branchDetail.branchManager.branchId || branchDetail.id,
        designation: managerForm.designation || 'Branch Manager',
        isActive: true,
      };
      
      console.log('Sending update data:', updateData);
      await adminService.updateBranchManager(branchDetail.branchManager.id, updateData);
      showNotification('Branch manager updated successfully', 'success');
      setEditManagerOpen(false);
      await loadData(true); // Force refresh admin dashboard data
    } catch (error: any) {
      console.error('Update manager error:', error);
      showNotification(error.response?.data?.message || 'Failed to update branch manager', 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!branchDetail?.branchManager) return;
    
    try {
      console.log('Resetting password for manager ID:', branchDetail.branchManager.id);
      const result = await adminService.resetBranchManagerPassword(branchDetail.branchManager.id);
      console.log('Reset password result:', result);
      showNotification(`New temporary password: ${result.tempPassword}`, 'success');
    } catch (error: any) {
      console.error('Reset password error:', error);
      showNotification(error.response?.data?.message || 'Failed to reset password', 'error');
    }
  };

  const handleRemoveManager = () => {
    setRemoveManagerOpen(true);
  };

  const confirmRemoveManager = async () => {
    if (!branchDetail?.branchManager) return;
    
    try {
      await adminService.removeBranchManager(branchDetail.branchManager.id);
      showNotification('Branch manager removed successfully', 'success');
      setRemoveManagerOpen(false);
      await loadData(true); // Force refresh admin dashboard data
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to remove branch manager', 'error');
    }
  };

  const getBranchTypeText = (type: number) => {
    switch (type) {
      case 0: return 'Main Branch';
      case 1: return 'Sub Branch';
      case 2: return 'Regional Branch';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string | number) => {
    const statusNum = typeof status === 'number' ? status : parseInt(String(status));
    switch (statusNum) {
      case 1: return 'success'; // Approved
      case 0: return 'warning'; // Pending
      case 2: return 'error';   // Rejected
      default: return 'default';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Approved';
      case 0: return 'Pending';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  };

  if (loading || dashboardLoading) {
    return <ProfessionalLoader message="Loading branch details..." variant="inline" />;
  }

  if (!branchDetail) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6">Branch not found</Typography>
        <Button onClick={() => navigate('/admin/branches')} sx={{ mt: 2 }}>
          Back to Branches
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/admin/branches')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {branchDetail.branchName}
        </Typography>
        <Chip 
          label={branchDetail.isActive ? 'Active' : 'Inactive'} 
          color={branchDetail.isActive ? 'success' : 'error'}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Branch Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Branch Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" color="textSecondary">
                      Branch Code: {branchDetail.branchCode}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      {branchDetail.address}, {branchDetail.city}, {branchDetail.state}
                    </Typography>
                  </Box>
                  {branchDetail.phoneNumber && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <Phone sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">{branchDetail.phoneNumber}</Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    IFSC Code: {branchDetail.ifscCode}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Type: {getBranchTypeText(branchDetail.branchType)}
                  </Typography>
                  {branchDetail.email && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <Email sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">{branchDetail.email}</Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Branch Statistics
              </Typography>
              <Box mb={2}>
                <Typography variant="h4" color="primary">
                  {branchDetail.statistics.totalAccounts}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Accounts
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="h4" color="success.main">
                  ₹{branchDetail.statistics.totalDeposits.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Deposits
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" color="info.main">
                  {branchDetail.statistics.totalCustomers}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Customers
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Branch Manager */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Branch Manager</Typography>
                <Box display="flex" gap={1}>
                  {branchDetail.branchManager ? (
                    <>
                      <Button
                        startIcon={<Edit />}
                        onClick={handleEditManager}
                        variant="outlined"
                        size="small"
                      >
                        Edit Manager
                      </Button>
                      <Button
                        onClick={handleResetPassword}
                        variant="outlined"
                        size="small"
                        color="warning"
                      >
                        Reset Password
                      </Button>
                      <Button
                        onClick={handleRemoveManager}
                        variant="outlined"
                        size="small"
                        color="error"
                      >
                        Remove Manager
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => navigate('/admin/create-branch-manager', { 
                        state: { branchId: branchDetail.id, branchName: branchDetail.branchName } 
                      })}
                      size="small"
                    >
                      Assign Manager
                    </Button>
                  )}
                </Box>
              </Box>
              
              {branchDetail.branchManager ? (
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">
                      {branchDetail.branchManager.fullName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {branchDetail.branchManager.designation || 'Branch Manager'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {branchDetail.branchManager.email} • {branchDetail.branchManager.phoneNumber}
                    </Typography>
                    <Chip 
                      label={getStatusText(branchDetail.branchManager.status)} 
                      color={getStatusColor(branchDetail.branchManager.status) as any}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="textSecondary" mb={2}>
                    No branch manager assigned to this branch
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={3}>
                    Assign a branch manager to oversee operations and manage customer accounts.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Account Status Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Status Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {branchDetail.statistics.activeAccounts}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Accounts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {branchDetail.statistics.pendingAccounts}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pending Approval
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {branchDetail.statistics.pendingTransactions}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pending Transactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary.main">
                      {branchDetail.statistics.transactionsThisMonth}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      This Month's Transactions
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Remove Manager Confirmation Dialog */}
      <Dialog open={removeManagerOpen} onClose={() => setRemoveManagerOpen(false)}>
        <DialogTitle>Remove Branch Manager</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{branchDetail?.branchManager?.fullName}</strong> as the branch manager?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action will unassign the manager from this branch. The user account will remain active but will no longer have branch management privileges.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveManagerOpen(false)}>Cancel</Button>
          <Button onClick={confirmRemoveManager} color="error" variant="contained">
            Remove Manager
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Manager Dialog */}
      <Dialog open={editManagerOpen} onClose={() => setEditManagerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Branch Manager</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={managerForm.fullName}
                onChange={(e) => setManagerForm({ ...managerForm, fullName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={managerForm.email}
                onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={managerForm.phoneNumber}
                onChange={(e) => setManagerForm({ ...managerForm, phoneNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Designation"
                value={managerForm.designation}
                onChange={(e) => setManagerForm({ ...managerForm, designation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employee Code"
                value={managerForm.employeeCode}
                onChange={(e) => setManagerForm({ ...managerForm, employeeCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={managerForm.address}
                onChange={(e) => setManagerForm({ ...managerForm, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditManagerOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateManager} variant="contained">
            Update Manager
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BranchDetailsPage;
