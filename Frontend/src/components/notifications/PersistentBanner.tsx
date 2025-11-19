import React from 'react';
import { Alert, AlertTitle, Box, Button, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

interface PersistentBannerProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  closable?: boolean;
}

const PersistentBanner: React.FC<PersistentBannerProps> = ({
  type,
  title,
  message,
  action,
  onClose,
  closable = true
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity={type}
sx={{
          '&.MuiAlert-standardSuccess': {
            backgroundColor: 'rgba(21, 101, 192, 0.1)',
            color: '#1565C0',
            borderColor: '#1565C0'
          },
          '&.MuiAlert-standardError': {
            backgroundColor: 'rgba(21, 101, 192, 0.1)',
            color: '#1565C0',
            borderColor: '#1565C0'
          },
          '&.MuiAlert-standardWarning': {
            backgroundColor: 'rgba(21, 101, 192, 0.1)',
            color: '#1565C0',
            borderColor: '#1565C0'
          },
          '&.MuiAlert-standardInfo': {
            backgroundColor: 'rgba(21, 101, 192, 0.1)',
            color: '#1565C0',
            borderColor: '#1565C0'
          }
        }}
        action={
          <Box display="flex" alignItems="center" gap={1}>
            {action && (
              <Button color="inherit" size="small" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
            {closable && onClose && (
              <IconButton size="small" color="inherit" onClick={onClose}>
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default PersistentBanner;
