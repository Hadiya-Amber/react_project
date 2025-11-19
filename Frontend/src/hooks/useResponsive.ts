import { useTheme, useMediaQuery, Breakpoint } from '@mui/material'
import { useMemo } from 'react'

// React 19 enhanced responsive hook
export const useResponsive = () => {
  const theme = useTheme()
  
  const isXs = useMediaQuery(theme.breakpoints.only('xs'))
  const isSm = useMediaQuery(theme.breakpoints.only('sm'))
  const isMd = useMediaQuery(theme.breakpoints.only('md'))
  const isLg = useMediaQuery(theme.breakpoints.only('lg'))
  const isXl = useMediaQuery(theme.breakpoints.only('xl'))
  
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'))
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'))
  const isXlUp = useMediaQuery(theme.breakpoints.up('xl'))
  
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'))
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'))
  const isLgDown = useMediaQuery(theme.breakpoints.down('lg'))
  const isXlDown = useMediaQuery(theme.breakpoints.down('xl'))

  const isMobile = isXs || isSm
  const isTablet = isMd
  const isDesktop = isLg || isXl

  const currentBreakpoint: Breakpoint = useMemo(() => {
    if (isXs) return 'xs'
    if (isSm) return 'sm'
    if (isMd) return 'md'
    if (isLg) return 'lg'
    return 'xl'
  }, [isXs, isSm, isMd, isLg])

  return {
    // Individual breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Up breakpoints
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
    
    // Down breakpoints
    isSmDown,
    isMdDown,
    isLgDown,
    isXlDown,
    
    // Device categories
    isMobile,
    isTablet,
    isDesktop,
    
    // Current breakpoint
    currentBreakpoint,
    
    // Utility functions
    getResponsiveValue: <T>(values: Partial<Record<Breakpoint, T>>) => {
      return values[currentBreakpoint] || values.xs || Object.values(values)[0]
    },
    
    getSpacing: (mobile: number, tablet?: number, desktop?: number) => ({
      xs: mobile,
      sm: mobile,
      md: tablet || mobile * 1.5,
      lg: desktop || tablet || mobile * 2,
      xl: desktop || tablet || mobile * 2,
    }),
    
    getFontSize: (mobile: string, tablet?: string, desktop?: string) => ({
      xs: mobile,
      sm: mobile,
      md: tablet || mobile,
      lg: desktop || tablet || mobile,
      xl: desktop || tablet || mobile,
    }),
  }
}

// Hook for responsive values based on breakpoints
export const useBreakpointValue = <T>(values: Partial<Record<Breakpoint, T>>) => {
  const { currentBreakpoint } = useResponsive()
  
  return useMemo(() => {
    // Try to get exact match first
    if (values[currentBreakpoint]) {
      return values[currentBreakpoint]
    }
    
    // Fallback logic: find the closest smaller breakpoint
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl']
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
    
    for (let i = currentIndex; i >= 0; i--) {
      if (values[breakpointOrder[i]]) {
        return values[breakpointOrder[i]]
      }
    }
    
    // Final fallback: return any available value
    return Object.values(values)[0]
  }, [values, currentBreakpoint])
}

// Hook for responsive grid columns
export const useResponsiveColumns = (
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3
) => {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  
  return useMemo(() => {
    if (isMobile) return mobile
    if (isTablet) return tablet
    if (isDesktop) return desktop
    return mobile
  }, [isMobile, isTablet, isDesktop, mobile, tablet, desktop])
}
