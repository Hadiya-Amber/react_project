import React from 'react';
import { Box, Grid, Typography, Avatar, Chip, alpha } from '@mui/material';
import { designTokens } from '@/theme/designTokens';
import ProfessionalCard from './ProfessionalCard';
import { TrendingUp, TrendingDown, AccountBalance, SwapHoriz } from '@mui/icons-material';

interface DashboardMetric {
  title: string;
  value: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'error';
}

interface ProfessionalDashboardProps {
  title: string;
  subtitle?: string;
  metrics: DashboardMetric[];
  children?: React.ReactNode;
}

export const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({
  title,
  subtitle,
  metrics,
  children,
}) => {
  const getMetricColor = (color: string) => {
    switch (color) {
      case 'primary':
        return designTokens.colors.primary[500];
      case 'secondary':
        return designTokens.colors.secondary[500];
      case 'success':
        return designTokens.colors.success[500];
      case 'error':
        return designTokens.colors.error[500];
      default:
        return designTokens.colors.primary[500];
    }
  };

  return (
    <Box>
      {/* Dashboard Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: designTokens.typography.fontWeight.bold,
            color: designTokens.colors.neutral[800],
            mb: 1,
            background: designTokens.gradients.primary,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="h6"
            sx={{
              color: designTokens.colors.neutral[600],
              fontWeight: designTokens.typography.fontWeight.normal,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <ProfessionalCard
              variant="glass"
              sx={{
                p: 3,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: `linear-gradient(90deg, ${getMetricColor(metric.color)}, ${alpha(getMetricColor(metric.color), 0.5)})`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: designTokens.colors.neutral[600],
                      fontWeight: designTokens.typography.fontWeight.medium,
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: designTokens.typography.fontSize.xs,
                    }}
                  >
                    {metric.title}
                  </Typography>
                  
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: designTokens.typography.fontWeight.bold,
                      color: designTokens.colors.neutral[800],
                      mb: 1,
                      lineHeight: 1.2,
                    }}
                  >
                    {metric.value}
                  </Typography>

                  {metric.change && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {metric.change.type === 'increase' ? (
                        <TrendingUp sx={{ fontSize: 16, color: designTokens.colors.success[500] }} />
                      ) : (
                        <TrendingDown sx={{ fontSize: 16, color: designTokens.colors.error[500] }} />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          color: metric.change.type === 'increase' 
                            ? designTokens.colors.success[600] 
                            : designTokens.colors.error[600],
                          fontWeight: designTokens.typography.fontWeight.semibold,
                        }}
                      >
                        {metric.change.value}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Avatar
                  sx={{
                    bgcolor: alpha(getMetricColor(metric.color), 0.1),
                    color: getMetricColor(metric.color),
                    width: 48,
                    height: 48,
                  }}
                >
                  {metric.icon}
                </Avatar>
              </Box>
            </ProfessionalCard>
          </Grid>
        ))}
      </Grid>

      {/* Dashboard Content */}
      {children && (
        <Box sx={{ mt: 4 }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

// Quick Actions Component
interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const getActionColor = (color: string = 'primary') => {
    switch (color) {
      case 'primary':
        return designTokens.colors.primary[500];
      case 'secondary':
        return designTokens.colors.secondary[500];
      case 'success':
        return designTokens.colors.success[500];
      case 'warning':
        return designTokens.colors.warning[500];
      default:
        return designTokens.colors.primary[500];
    }
  };

  return (
    <Grid container spacing={3}>
      {actions.map((action, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <ProfessionalCard
            variant="elevated"
            sx={{
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.easeInOut}`,
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: designTokens.shadows.xl,
              },
            }}
            onClick={action.onClick}
          >
            <Avatar
              sx={{
                bgcolor: alpha(getActionColor(action.color), 0.1),
                color: getActionColor(action.color),
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                fontSize: '2rem',
              }}
            >
              {action.icon}
            </Avatar>
            
            <Typography
              variant="h6"
              sx={{
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[800],
                mb: 1,
              }}
            >
              {action.title}
            </Typography>
            
            <Typography
              variant="body2"
              sx={{
                color: designTokens.colors.neutral[600],
                fontSize: designTokens.typography.fontSize.sm,
              }}
            >
              {action.description}
            </Typography>
          </ProfessionalCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProfessionalDashboard;