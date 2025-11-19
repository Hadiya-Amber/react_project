import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  AccountBalance as AccountIcon,
  TrendingUp as TrendingIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { Branch, BranchDetails, BranchType, branchService } from '@/services/branchService';
import ProfessionalLoader from '@/components/ui/ProfessionalLoader';
import { useNotification } from '@/context/NotificationContext';

interface BranchDetailsModalProps {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
}

const BranchDetailsModal: React.FC<BranchDetailsModalProps> = ({ open, onClose, branch }) => {
  const [details, setDetails] = useState<BranchDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && branch) {
      loadBranchDetails();
    }
  }, [open, branch]);

  const loadBranchDetails = async () => {
    if (!branch) return;
    
    try {
      setLoading(true);
      const data = await branchService.getBranchDetails(branch.id);
      setDetails(data);
    } catch (error) {
      showNotification('Failed to load branch details', 'error' as any);
    } finally {
      setLoading(false);
    }
  };

  const getBranchTypeLabel = (type: BranchType): string => {
    switch (type) {
      case BranchType.Main: return 'Main Branch';
      case BranchType.Sub: return 'Sub Branch';
      case BranchType.Regional: return 'Regional Branch';
      default: return 'Sub Branch';
    }
  };

  if (!branch) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <BusinessIcon color="primary" />
          <Box>
            <Typography variant="h6">{branch.branchName}</Typography>
            <Typography variant="body2" color="text.secondary">
              Branch Code: {branch.branchCode}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <ProfessionalLoader message="Loading branch details..." variant="inline" />
          </Box>
        ) : details ? (
          <Box>
            {/* Branch Status */}
            <Box display="flex" gap={1} mb={3}>
              <Chip
                label={details.isActive ? 'Active' : 'Inactive'}
                color={details.isActive ? 'success' : 'error'}
              />
              <Chip 
                label={getBranchTypeLabel(details.branchType)} 
                color={details.branchType === BranchType.Main ? 'primary' : 'default'} 
              />
            </Box>

            {/* Contact Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {details.address}, {details.city}, {details.state} - {details.postalCode}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{details.phoneNumber}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{details.email}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Branch Manager */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Branch Manager
                </Typography>
                {details.branchManager ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">{details.branchManager.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {details.branchManager.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {details.branchManager.phoneNumber}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="warning">
                    No branch manager assigned to this branch
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Branch Statistics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <PersonIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" color="primary">
                        {details.statistics.totalCustomers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Employees
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <PersonIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" color="secondary">
                        {details.statistics.totalCustomers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Customers
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <AccountIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" color="info.main">
                        {details.statistics.totalAccounts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accounts
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <TrendingIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" color="success.main">
                        ₹{details.statistics.totalDeposits.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Balance
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Alert severity="error">Failed to load branch details</Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BranchDetailsModal;
