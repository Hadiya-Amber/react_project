import React, { Suspense, ReactNode } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import ErrorBoundary from '@/components/ErrorBoundary';

interface AsyncBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

const DefaultFallback = () => (
  <Box display="flex" flexDirection="column" alignItems="center" py={4}>
    <CircularProgress />
    <Typography variant="body2" sx={{ mt: 2 }}>
      Loading...
    </Typography>
  </Box>
);

export const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
  children,
  fallback = <DefaultFallback />,
}) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};
