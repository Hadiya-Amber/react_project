import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  Avatar,
  alpha,
  Fab,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountBalance,
  SwapHoriz,
  Analytics,
  Security,
  Star,
  LinkedIn,
  Twitter,
  Facebook,
  AccountBalanceWallet,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { designTokens } from '@/theme/designTokens';
import HeroSection from '@/components/ui/HeroSection';
import ProfessionalCard from '@/components/ui/ProfessionalCard';
import ProfessionalButton from '@/components/ui/ProfessionalButton';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import TestimonialCarousel from '@/components/ui/TestimonialCarousel';
import FloatingElements from '@/components/ui/FloatingElements';
import { statsService, BankStats } from '@/services/statsService';

const HomePage: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bankStats, setBankStats] = useState<BankStats | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleScroll = () => {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    
    setIsAtBottom(scrollTop + windowHeight >= docHeight - 100);
  };

  const handleScrollToggle = () => {
    if (isAtBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const features = [
    {
      icon: <AccountBalance sx={{ fontSize: 40, color: designTokens.colors.primary[500] }} />,
      title: 'Easy Account Management',
      description: 'Manage all your accounts seamlessly with our intuitive dashboard'
    },
    {
      icon: <SwapHoriz sx={{ fontSize: 40, color: designTokens.colors.primary[500] }} />,
      title: 'Instant Money Transfers',
      description: 'Transfer money instantly to any account with just a few clicks'
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: designTokens.colors.primary[500] }} />,
      title: 'Smart Analytics',
      description: 'Get detailed insights into your spending patterns and financial health'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: designTokens.colors.primary[500] }} />,
      title: 'Bank-Grade Security',
      description: 'Your data is protected with enterprise-level security measures'
    },
  ];

  const services = [
    {
      title: 'Account Management',
      description: 'Create and manage Minor, Major, Savings, and Current accounts with role-based access',
      image: '🏦'
    },
    {
      title: 'Money Transfers',
      description: 'Instant deposits, withdrawals, and transfers with real-time processing',
      image: '💸'
    },
    {
      title: 'Transaction Analytics',
      description: 'Detailed transaction history, PDF statements, and spending insights',
      image: '📊'
    },
    {
      title: 'Multi-Role Dashboard',
      description: 'Customer, Branch Manager, and Admin dashboards with approval workflows',
      image: '👥'
    },
  ];

  const testimonials = [
    {
      name: 'Amit Sharma',
      role: 'Business Owner',
      content: 'Perfect Bank has made my business banking effortless. The analytics feature helps me track my finances better.',
      rating: 5
    },
    {
      name: 'Priya Patel',
      role: 'Software Engineer',
      content: 'The instant transfers and user-friendly interface make this the best banking app I\'ve used.',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      role: 'Entrepreneur',
      content: 'Excellent customer service and robust security features. Highly recommended for business banking.',
      rating: 5
    },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await statsService.getBankStats();
        setBankStats(stats);
      } catch (error) {
        setBankStats({
          totalAccounts: 1250,
          totalTransactions: 8500,
          activeUsers: 950,
          totalBranches: 12
        });
      }
    };
    
    fetchStats();
  }, []);

  const stats = bankStats ? [
    { label: 'Total Accounts', value: bankStats.totalAccounts, suffix: '+' },
    { label: 'Total Transactions', value: bankStats.totalTransactions, suffix: '+' },
    { label: 'Active Users', value: bankStats.activeUsers, suffix: '+' },
    { label: 'Branches', value: bankStats.totalBranches, suffix: '+' },
  ] : [
    { label: 'Total Accounts', value: 0, suffix: '+' },
    { label: 'Total Transactions', value: 0, suffix: '+' },
    { label: 'Active Users', value: 0, suffix: '+' },
    { label: 'Branches', value: 0, suffix: '+' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
        <AccountBalanceWallet sx={{ color: designTokens.colors.primary[500], fontSize: 32, mr: 1 }} />
        <Typography variant="h6" sx={{ color: designTokens.colors.primary[600], fontWeight: 'bold' }}>
          Perfect Bank
        </Typography>
      </Box>
      <List>
        <ListItem>
          <ProfessionalButton
            variant="primary"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Login to Dashboard
          </ProfessionalButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: designTokens.colors.neutral[100], minHeight: '100vh' }}>
      {/* Navigation */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: alpha('#FFFFFF', 0.95),
          backdropFilter: 'blur(20px)',
          boxShadow: designTokens.shadows.md,
          color: designTokens.colors.neutral[800],
          borderBottom: `1px solid ${alpha(designTokens.colors.neutral[300], 0.3)}`,
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <AccountBalanceWallet sx={{ color: designTokens.colors.primary[500], fontSize: 28, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{ 
                color: designTokens.colors.primary[600],
                fontWeight: designTokens.typography.fontWeight.bold,
                fontFamily: designTokens.typography.fontFamily.primary,
                '&:hover': {
                  color: designTokens.colors.primary[700]
                }
              }}
            >
              Perfect Bank
            </Typography>
          </Box>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ProfessionalButton
                variant="outline"
                onClick={() => navigate('/login')}
              >
                Login
              </ProfessionalButton>
              
              <ProfessionalButton
                variant="primary"
                onClick={() => navigate('/register')}
              >
                Get Started
              </ProfessionalButton>
            </Box>
          )}
          
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ color: designTokens.colors.neutral[700] }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Professional Hero Section */}
      <Box sx={{ pt: 8 }}>
        <HeroSection
          title="Your Perfect Banking Partner"
          subtitle="Experience next-generation banking with enterprise-grade security, instant transactions, and intelligent financial insights."
          primaryAction={{
            text: "Open Account Today",
            onClick: () => navigate('/register')
          }}
          secondaryAction={{
            text: "Login to Dashboard",
            onClick: () => navigate('/login')
          }}
          showFeatures={false}
        />
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }} id="about">
        <Typography
          variant="h3"
          align="center"
          sx={{
            mb: 6,
            fontWeight: designTokens.typography.fontWeight.bold,
            color: designTokens.colors.neutral[800],
            fontFamily: designTokens.typography.fontFamily.primary,
            background: designTokens.gradients.primary,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Why Choose Perfect Bank?
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ProfessionalCard
                variant="elevated"
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: designTokens.typography.fontWeight.semibold,
                      color: designTokens.colors.neutral[800],
                      fontFamily: designTokens.typography.fontFamily.primary
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: designTokens.colors.neutral[600],
                      fontFamily: designTokens.typography.fontFamily.primary
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </ProfessionalCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Statistics Section with Animated Counters */}
      <Box sx={{ 
        backgroundColor: '#FFFFFF', 
        py: 8,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <FloatingElements />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: 6,
              fontWeight: designTokens.typography.fontWeight.bold,
              color: designTokens.colors.neutral[800],
              fontFamily: designTokens.typography.fontFamily.primary,
              background: designTokens.gradients.primary,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Trusted by Thousands
          </Typography>
          
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <ProfessionalCard
                  variant="glass"
                  sx={{
                    textAlign: 'center',
                    p: 4,
                    background: `linear-gradient(145deg, ${alpha('#FFFFFF', 0.8)} 0%, ${alpha('#FFFFFF', 0.6)} 100%)`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(designTokens.colors.primary[300], 0.2)}`,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: designTokens.shadows.xl,
                    },
                  }}
                >
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}

                    duration={2500 + index * 200}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      mt: 1,
                      color: designTokens.colors.neutral[600],
                      fontFamily: designTokens.typography.fontFamily.primary,
                      fontWeight: designTokens.typography.fontWeight.medium,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </ProfessionalCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 8 }} id="services">
        <Typography
          variant="h3"
          align="center"
          sx={{
            mb: 6,
            fontWeight: designTokens.typography.fontWeight.bold,
            color: designTokens.colors.neutral[800],
            fontFamily: designTokens.typography.fontFamily.primary,
            background: designTokens.gradients.primary,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Our Services
        </Typography>
        
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ProfessionalCard
                variant="elevated"
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                }}
              >
                <CardContent>
                  <Typography sx={{ fontSize: '60px', mb: 2 }}>
                    {service.image}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: designTokens.typography.fontWeight.semibold,
                      color: designTokens.colors.neutral[800],
                      fontFamily: designTokens.typography.fontFamily.primary
                    }}
                  >
                    {service.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 3,
                      color: designTokens.colors.neutral[600],
                      fontFamily: designTokens.typography.fontFamily.primary
                    }}
                  >
                    {service.description}
                  </Typography>
                  <ProfessionalButton variant="outline">
                    Learn More
                  </ProfessionalButton>
                </CardContent>
              </ProfessionalCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Professional Testimonials Carousel */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${designTokens.colors.neutral[50]} 0%, ${alpha('#FFFFFF', 0.9)} 100%)`,
        py: 10,
        position: 'relative',
      }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: 8,
              fontWeight: designTokens.typography.fontWeight.bold,
              color: designTokens.colors.neutral[800],
              fontFamily: designTokens.typography.fontFamily.primary,
              background: designTokens.gradients.primary,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            What Our Customers Say
          </Typography>
          
          <TestimonialCarousel
            testimonials={testimonials}
            autoPlay={true}
            interval={6000}
          />
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          background: designTokens.gradients.primary,
          color: 'white',
          py: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWallet sx={{ fontSize: 32, mr: 1 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: designTokens.typography.fontWeight.bold,
                    fontFamily: designTokens.typography.fontFamily.primary,
                  }}
                >
                  Perfect Bank
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: designTokens.typography.fontFamily.primary,
                  lineHeight: 1.6,
                  opacity: 0.9
                }}
              >
                Your trusted partner for all banking needs. Safe, secure, and reliable banking services.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  fontFamily: designTokens.typography.fontFamily.primary,
                }}
              >
                Follow Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton 
                  sx={{ 
                    color: 'white', 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': { 
                      color: designTokens.colors.accent[500],
                      backgroundColor: 'rgba(255,193,7,0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(255,193,7,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <LinkedIn />
                </IconButton>
                <IconButton 
                  sx={{ 
                    color: 'white', 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': { 
                      color: designTokens.colors.accent[500],
                      backgroundColor: 'rgba(255,193,7,0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(255,193,7,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Twitter />
                </IconButton>
                <IconButton 
                  sx={{ 
                    color: 'white', 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': { 
                      color: designTokens.colors.accent[500],
                      backgroundColor: 'rgba(255,193,7,0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(255,193,7,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Facebook />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
          
          <Box
            sx={{
              borderTop: '1px solid rgba(255,255,255,0.2)',
              mt: 4,
              pt: 4,
              textAlign: 'center'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                opacity: 0.8,
                fontFamily: designTokens.typography.fontFamily.primary
              }}
            >
              © 2025 Perfect Bank - All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Scroll Toggle Button */}
      <Fab
        onClick={handleScrollToggle}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: designTokens.colors.primary[500],
          color: 'white',
          '&:hover': {
            backgroundColor: designTokens.colors.primary[600],
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
          zIndex: 1000,
        }}
      >
        {isAtBottom ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </Fab>
    </Box>
  );
};

export default HomePage;