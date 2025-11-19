import { memo, useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  AccountBalance,
  Send,
  Receipt,
  Settings,
  Logout,
  Close,
} from '@mui/icons-material'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  title?: string
}

const drawerWidth = 280

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Accounts', icon: <AccountBalance />, path: '/accounts' },
  { text: 'Transfer', icon: <Send />, path: '/transfer' },
  { text: 'Transactions', icon: <Receipt />, path: '/transactions' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
]

export const ResponsiveLayout = memo(({ children, title = 'Perfect Bank' }: ResponsiveLayoutProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          minHeight: 64,
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary">
          Perfect Bank
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <Close />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(41, 91, 158, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontSize: isMobile ? '0.9rem' : '1rem',
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 'auto' }} />
      <List>
        <ListItem
          sx={{
            mx: 1,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'rgba(217, 83, 79, 0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText 
            primary="Logout"
            primaryTypographyProps={{
              fontSize: isMobile ? '0.9rem' : '1rem',
            }}
          />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ 
          width: { md: drawerWidth }, 
          flexShrink: { md: 0 } 
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
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Container
          maxWidth={false}
          sx={{
            py: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  )
})

ResponsiveLayout.displayName = 'ResponsiveLayout'
