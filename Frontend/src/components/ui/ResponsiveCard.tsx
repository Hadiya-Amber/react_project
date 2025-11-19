import { memo } from 'react'
import { Card, CardProps, CardContent, CardActions, useTheme, useMediaQuery } from '@mui/material'

interface ResponsiveCardProps extends CardProps {
  children: React.ReactNode
  padding?: 'small' | 'medium' | 'large'
  elevation?: number
}

export const ResponsiveCard = memo(({ 
  children, 
  padding = 'medium',
  elevation = 1,
  ...props 
}: ResponsiveCardProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const getPadding = () => {
    if (isMobile) {
      return padding === 'large' ? 2 : padding === 'medium' ? 1.5 : 1
    }
    return padding === 'large' ? 4 : padding === 'medium' ? 3 : 2
  }

  return (
    <Card
      elevation={isMobile ? Math.max(1, elevation - 1) : elevation}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        ...props.sx,
      }}
      {...props}
    >
      <CardContent sx={{ p: getPadding() }}>
        {children}
      </CardContent>
    </Card>
  )
})

ResponsiveCard.displayName = 'ResponsiveCard'

interface ResponsiveCardWithActionsProps extends CardProps {
  children: React.ReactNode
  actions?: React.ReactNode
  padding?: 'small' | 'medium' | 'large'
}

export const ResponsiveCardWithActions = memo(({ 
  children, 
  actions,
  padding = 'medium',
  ...props 
}: ResponsiveCardWithActionsProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const getPadding = () => {
    if (isMobile) {
      return padding === 'large' ? 2 : padding === 'medium' ? 1.5 : 1
    }
    return padding === 'large' ? 4 : padding === 'medium' ? 3 : 2
  }

  return (
    <Card
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        ...props.sx,
      }}
      {...props}
    >
      <CardContent sx={{ p: getPadding() }}>
        {children}
      </CardContent>
      {actions && (
        <CardActions 
          sx={{ 
            px: getPadding(),
            pb: getPadding(),
            pt: 0,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          }}
        >
          {actions}
        </CardActions>
      )}
    </Card>
  )
})

ResponsiveCardWithActions.displayName = 'ResponsiveCardWithActions'
