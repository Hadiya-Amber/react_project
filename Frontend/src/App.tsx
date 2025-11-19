import { Suspense, memo, use } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ProfileProvider } from './context/ProfileContext'
import ErrorBoundary from './components/ErrorBoundary'
import { theme } from './theme'
import AppRoutes from './routes/AppRoutes'
import ProfessionalLoader from './components/ui/ProfessionalLoader'

// Optimized QueryClient to prevent multiple API calls per action
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once
      retryDelay: 1000, // 1 second delay
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      staleTime: 2 * 60 * 1000, // 2 minutes - data stays fresh
      gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 0, // No retries for mutations
      networkMode: 'offlineFirst',
    },
  },
  // Global query cache to prevent duplicate requests
  queryCache: new QueryCache({
    onError: (error) => {
      console.warn('Query error:', error);
    },
  }),
  // Global mutation cache
  mutationCache: new MutationCache({
    onError: (error) => {
      console.warn('Mutation error:', error);
    },
  }),
})

// React 19 enhanced loading fallback with professional design
const AppLoadingFallback = () => (
  <ProfessionalLoader 
    message="Initializing Perfect Bank..."
    variant="page"
    size="large"
  />
)

// React 19 enhanced App component with use() hook support
const App = memo(() => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <NotificationProvider>
              <ProfileProvider>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <AuthProvider>
                    <Suspense fallback={<AppLoadingFallback />}>
                      <AppRoutes />
                    </Suspense>
                  </AuthProvider>
                </BrowserRouter>
              </ProfileProvider>
            </NotificationProvider>
          </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
})

App.displayName = 'BankEaseApp'

export default App
