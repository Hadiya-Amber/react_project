import { Component, ReactNode, ErrorInfo } from 'react'
import { Box, Typography, Button, Alert, Stack } from '@mui/material'
import { Refresh, BugReport } from '@mui/icons-material'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

// React 19 enhanced ErrorBoundary with better error reporting
class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // React 19 enhanced error state derivation
    return { 
      hasError: true, 
      error,
      errorInfo: undefined
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enhanced error logging for React 19
    this.setState({ errorInfo })
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
    
    // Enhanced error reporting (avoid console.error in production)
    if (import.meta.env.DEV) {
      console.group('🚨 ErrorBoundary caught an error')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.groupEnd()
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
          p={3}
          bgcolor="background.default"
        >
          <Alert 
            severity="error" 
            icon={<BugReport />}
            sx={{ mb: 3, maxWidth: 600, width: '100%' }}
          >
            <Typography variant="h6" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
            </Typography>
            {import.meta.env.DEV && this.state.errorInfo && (
              <Typography variant="caption" component="pre" sx={{ 
                mt: 1, 
                p: 1, 
                bgcolor: 'grey.100', 
                borderRadius: 1,
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: 200
              }}>
                {this.state.errorInfo.componentStack}
              </Typography>
            )}
          </Alert>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={this.handleRetry}
            >
              Try Again
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={this.handleReload}
            >
              Reload Page
            </Button>
          </Stack>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
