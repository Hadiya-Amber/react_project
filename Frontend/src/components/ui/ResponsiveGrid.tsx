import { memo } from 'react'
import { Grid, GridProps } from '@mui/material'

interface ResponsiveGridProps extends Omit<GridProps, 'spacing'> {
  children: React.ReactNode
  spacing?: number | object
}

export const ResponsiveGrid = memo(({ 
  children, 
  spacing = { xs: 1, sm: 2, md: 3 },
  ...props 
}: ResponsiveGridProps) => {
  return (
    <Grid 
      container 
      spacing={spacing as any}
      sx={{
        '& .MuiGrid-item': {
          display: 'flex',
          flexDirection: 'column',
        },
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Grid>
  )
})

ResponsiveGrid.displayName = 'ResponsiveGrid'

interface ResponsiveGridItemProps extends GridProps {
  children: React.ReactNode
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
}

export const ResponsiveGridItem = memo(({ 
  children, 
  xs = 12,
  sm,
  md,
  lg,
  xl,
  ...props 
}: ResponsiveGridItemProps) => {
  return (
    <Grid 
      item 
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Grid>
  )
})

ResponsiveGridItem.displayName = 'ResponsiveGridItem'
