import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { Branch, BranchType, branchService } from '@/services/branchService';
import { NotificationType } from '@/types/notification';
import { useNotification } from '@/context/NotificationContext';
import { useAdminDashboard } from '@/context/AdminDashboardContext';
import BranchFormModal from '@/components/admin/BranchFormModal';
import ProfessionalLoader from '@/components/ui/ProfessionalLoader';
import { useNavigate } from 'react-router-dom';

const BranchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { getBranches, loading, loadData } = useAdminDashboard();
  const branches = getBranches();
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const { showNotification } = useNotification();

  const handleEdit = (branch: Branch, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setEditingBranch(branch);
    setShowForm(true);
  };

  const handleToggleStatus = async (branch: Branch) => {
    try {
      await branchService.toggleBranchStatus(branch.id);
      showNotification(`Branch ${branch.isActive ? 'deactivated' : 'activated'} successfully`, NotificationType.SUCCESS);
      loadData(true); // Refresh admin dashboard data
    } catch (error) {
      showNotification('Failed to update branch status', NotificationType.ERROR);
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

  if (loading) return <ProfessionalLoader message="Loading branches..." variant="page" />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Branch Management
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
                  Code: {branch.branchCode || 'Not assigned'}
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
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Branch Form Modal */}
      <BranchFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        branch={editingBranch}
        onSuccess={async () => {
          await loadData(true); // Force refresh admin dashboard data
          setShowForm(false);
          setEditingBranch(null);
        }}
      />
    </Box>
  );
};

export default BranchesPage;
