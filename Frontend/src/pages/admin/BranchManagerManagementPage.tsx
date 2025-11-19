import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
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
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as ResetPasswordIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService, BranchManager, UpdateEmployeeDto, ResetPasswordResponse } from '@/services/adminService';
import { NotificationType } from '@/types/notification';
import { useNotification } from '@/context/NotificationContext';

const BranchManagerManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [branchManagers, setBranchManagers] = useState<BranchManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState<BranchManager | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState<string>('');

  useEffect(() => {
    fetchBranchManagers();
  }, []);

  const fetchBranchManagers = async () => {
    try {
      setLoading(true);
      const managers = await adminService.getAllBranchManagers();
      setBranchManagers(managers);
    } catch (error) {
      showNotification('Failed to fetch branch managers', NotificationType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (manager: BranchManager) => {
    setSelectedManager(manager);
    setEditDialogOpen(true);
  };

  const handleDelete = (manager: BranchManager) => {
    setSelectedManager(manager);
    setDeleteDialogOpen(true);
  };

  const handleResetPassword = (manager: BranchManager) => {
    setSelectedManager(manager);
    setResetPasswordDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedManager) return;

    try {
      await adminService.deleteBranchManager(selectedManager.id);
      showNotification('Branch manager deactivated successfully', NotificationType.SUCCESS);
      fetchBranchManagers();
      setDeleteDialogOpen(false);
      setSelectedManager(null);
    } catch (error) {
      showNotification('Failed to deactivate branch manager', NotificationType.ERROR);
    }
  };

  const confirmResetPassword = async () => {
    if (!selectedManager) return;

    try {
      const result: ResetPasswordResponse = await adminService.resetBranchManagerPassword(selectedManager.id);
      setTempPassword(result.tempPassword);
      showNotification('Password reset successfully', NotificationType.SUCCESS);
    } catch (error) {
      showNotification('Failed to reset password', NotificationType.ERROR);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Branch Manager Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/create-branch-manager')}
        >
          Create Branch Manager
        </Button>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Managers
              </Typography>
              <Typography variant="h4">
                {branchManagers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                Active Managers
              </Typography>
              <Typography variant="h4">
                {branchManagers.filter(m => m.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                Inactive Managers
              </Typography>
              <Typography variant="h4">
                {branchManagers.filter(m => !m.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Branch ID</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {branchManagers.map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell>{manager.fullName}</TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>{manager.phoneNumber}</TableCell>
                    <TableCell>{manager.branchId}</TableCell>
                    <TableCell>{manager.designation}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(manager.isActive)}
                        color={getStatusColor(manager.isActive)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(manager.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(manager)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleResetPassword(manager)}
                        title="Reset Password"
                      >
                        <ResetPasswordIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(manager)}
                        title="Deactivate"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deactivation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate {selectedManager?.fullName}?
            This action will disable their access to the system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onClose={() => setResetPasswordDialogOpen(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {!tempPassword ? (
            <Typography>
              Are you sure you want to reset the password for {selectedManager?.fullName}?
              A new temporary password will be generated and sent via email.
            </Typography>
          ) : (
            <Alert severity="success">
              <Typography variant="h6" gutterBottom>
                Password Reset Successfully!
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                New Password: {tempPassword}
              </Typography>
              <Typography variant="caption" display="block" mt={1}>
                An email with the new password has been sent to the branch manager.
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(tempPassword);
                  showNotification('Password copied to clipboard', NotificationType.INFO);
                }}
                sx={{ mt: 1 }}
              >
                Copy Password
              </Button>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setResetPasswordDialogOpen(false);
            setTempPassword('');
          }}>
            {tempPassword ? 'Close' : 'Cancel'}
          </Button>
          {!tempPassword && (
            <Button onClick={confirmResetPassword} color="primary" variant="contained">
              Reset Password
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BranchManagerManagementPage;
