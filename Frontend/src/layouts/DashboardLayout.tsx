import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  AccountBalance,
  SwapHoriz,
  Person,
  ExitToApp,
  Add,
  Settings,
  Business,
  AccountBalanceWallet,
  ArrowBack,
} from '@mui/icons-material';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user';
import { AdminDashboardProvider } from '@/context/AdminDashboardContext';
import { useProfile } from '@/context/ProfileContext';
import { designTokens } from '@/theme/designTokens';

const drawerWidth = 280;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { profileImage } = useProfile();
  
  // Wrap admin users with AdminDashboardProvider to share consolidated data
  const wrappedChildren = ((user?.role as any) === 'Admin' || (user?.role as any) === UserRole.Admin || (user?.role as any) === 0) ? (
    <AdminDashboardProvider>
      {children}
    </AdminDashboardProvider>
  ) : children;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isBranchManager = (user?.role as any) === UserRole.BranchManager || (user?.role as any) === 'BranchManager' || (user?.role as any) === 1;
  const currentPath = window.location.pathname;
  const isOnDashboard = currentPath === '/dashboard';
  const showBackButton = isBranchManager && !isOnDashboard;
  const showHamburger = !isBranchManager;

  const getMenuItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { text: 'Transactions', icon: <SwapHoriz />, path: '/transactions' },
    ];

    if ((user?.role as any) === UserRole.Customer || (user?.role as any) === 'Customer' || (user?.role as any) === 2) {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'My Accounts', icon: <AccountBalance />, path: '/accounts' },
        { text: 'Create Account', icon: <Add />, path: '/accounts/create' },
        { text: 'Deposit', icon: <SwapHoriz />, path: '/transactions/deposit' },
        { text: 'Withdraw', icon: <SwapHoriz />, path: '/transactions/withdraw' },
        { text: 'Transfer', icon: <SwapHoriz />, path: '/transactions/transfer' },
        { text: 'Profile Settings', icon: <Settings />, path: '/customer/profile' },
      ];
    }

    if ((user?.role as any) === UserRole.Admin || (user?.role as any) === 'Admin' || (user?.role as any) === 0) {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Accounts', icon: <AccountBalance />, path: '/accounts' },
        { text: 'Transactions', icon: <SwapHoriz />, path: '/transactions' },
        { text: 'Branch Management', icon: <Business />, path: '/admin/branches' },
        { text: 'Create Branch Manager', icon: <Add />, path: '/admin/create-branch-manager' },
      ];
    }

    if (isBranchManager) {
      return [];
    }

    return baseItems;
  };

  const theme = useTheme();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        background: designTokens.gradients.primary,
        borderBottom: `1px solid ${designTokens.colors.neutral[300]}`,
        color: 'white',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWallet sx={{ color: designTokens.colors.accent[500], fontSize: 28 }} />
          <Box>
            <Typography variant="h6" noWrap component="div" sx={{ 
              color: '#FFFFFF', 
              fontWeight: 700,
              fontSize: '1.1rem',
            }}>
              Perfect Bank
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.7rem',
            }}>
              Trust & Excellence
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      
      <Box sx={{ p: 2, backgroundColor: designTokens.colors.neutral[100] }}>
        <Chip 
          label={(() => {
            const role = user?.role as any;
            if (role === 'Admin' || role === 0 || role === UserRole.Admin) return 'Admin';
            if (role === 'BranchManager' || role === 1 || role === UserRole.BranchManager) return 'Branch Manager';
            if (role === 'Customer' || role === 2 || role === UserRole.Customer) return 'Customer';
            return `Unknown: ${role}`;
          })()} 
          size="small" 
          sx={{ 
            backgroundColor: designTokens.colors.primary[500],
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.75rem',
          }} 
        />
      </Box>
      
      <List sx={{ flexGrow: 1, px: 1, backgroundColor: '#FFFFFF' }}>
        {getMenuItems().map((item) => {
          const isActive = currentPath === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false); // Close mobile drawer on navigation
                }}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  color: designTokens.colors.neutral[800],
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? designTokens.colors.primary[500] : designTokens.colors.neutral[500],
                  minWidth: 40,
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isActive ? designTokens.colors.primary[500] : designTokens.colors.neutral[800],
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.9rem',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ p: 2, borderTop: `1px solid ${designTokens.colors.neutral[300]}`, backgroundColor: '#FFFFFF' }}>
        <Typography variant="caption" sx={{ 
          color: designTokens.colors.neutral[500],
          fontSize: '0.7rem',
        }}>
          Welcome, {user?.fullName}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { 
            xs: '100%',
            sm: showHamburger && sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' 
          },
          ml: { 
            xs: 0,
            sm: showHamburger && sidebarOpen ? `${drawerWidth}px` : 0 
          },
          transition: 'width 0.3s, margin 0.3s',
          background: designTokens.gradients.primary,
          borderBottom: `1px solid ${designTokens.colors.neutral[300]}`,
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', px: { xs: 1, sm: 3 } }}>
          {showBackButton ? (
            <IconButton
              color="inherit"
              aria-label="back to dashboard"
              edge="start"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                mr: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ArrowBack />
            </IconButton>
          ) : showHamburger ? (
            <>
              <IconButton
                color="inherit"
                aria-label="toggle mobile drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 2,
                  display: { sm: 'none' },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="toggle desktop drawer"
                edge="start"
                onClick={handleSidebarToggle}
                sx={{ 
                  mr: 2,
                  display: { xs: 'none', sm: 'block' },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            </>
          ) : null}
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" noWrap component="div" sx={{ 
              fontWeight: 600,
              color: '#FFFFFF',
            }}>
              {(() => {
                const role = user?.role as any;
                if (role === 'Admin' || role === 0 || role === UserRole.Admin) return 'Admin';
                if (role === 'BranchManager' || role === 1 || role === UserRole.BranchManager) return 'Branch Manager';
                if (role === 'Customer' || role === 2 || role === UserRole.Customer) return 'Customer';
                return 'User';
              })()} Dashboard
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.85rem',
            }}>
              Manage your banking operations
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2}>
            <NotificationCenter />
            
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ 
                p: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <Avatar 
                src={profileImage || undefined}
                sx={{ 
                  width: 40, 
                  height: 40,
                  backgroundColor: designTokens.colors.accent[500],
                  color: designTokens.colors.neutral[800],
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {!profileImage && (user?.fullName?.charAt(0) || 'U')}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(41, 91, 158, 0.15)',
                border: `1px solid ${designTokens.colors.neutral[300]}`,
                minWidth: 200,
              }
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${designTokens.colors.neutral[300]}` }}>
              <Typography variant="subtitle2" sx={{ color: designTokens.colors.neutral[800], fontWeight: 600 }}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" sx={{ color: designTokens.colors.neutral[500] }}>
                {user?.email}
              </Typography>
            </Box>
            
            <MenuItem 
              onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(41, 91, 158, 0.04)',
                }
              }}
            >
              <ListItemIcon>
                <Person fontSize="small" sx={{ color: designTokens.colors.primary[500] }} />
              </ListItemIcon>
              <Typography variant="body2">Profile Settings</Typography>
            </MenuItem>
            
            <MenuItem 
              onClick={handleLogout}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(217, 83, 79, 0.04)',
                }
              }}
            >
              <ListItemIcon>
                <ExitToApp fontSize="small" sx={{ color: designTokens.colors.error[500] }} />
              </ListItemIcon>
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      {showHamburger && (
        <Box
          component="nav"
          sx={{ 
            width: { 
              xs: 0,
              sm: sidebarOpen ? drawerWidth : 0 
            }, 
            flexShrink: { sm: 0 },
            transition: 'width 0.3s',
          }}
        >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#FFFFFF',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              transform: sidebarOpen ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
              transition: 'transform 0.3s',
              backgroundColor: '#FFFFFF',
              borderRight: `1px solid ${designTokens.colors.neutral[300]}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
        </Box>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          width: { 
            xs: '100%',
            sm: showHamburger && sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' 
          },
          transition: 'width 0.3s',
          backgroundColor: designTokens.colors.neutral[100],
          minHeight: '100vh',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }} />
        <Box sx={{ 
          maxWidth: '1400px',
          mx: 'auto',
          mt: 2,
        }}>
          {wrappedChildren}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
