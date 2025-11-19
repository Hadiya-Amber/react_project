import React from 'react';
import { Button, CircularProgress, ButtonProps } from '@mui/material';

interface LoadingButtonProps extends Omit<ButtonProps, 'onClick'> {
  loading?: boolean;
  onClick: () => void | Promise<void>;
  loadingText?: string;
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  onClick,
  loadingText = 'Processing...',
  children,
  disabled,
  ...buttonProps
}) => {
  return (
    <Button
      {...buttonProps}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? <CircularProgress size={16} /> : buttonProps.startIcon}
    >
      {loading ? loadingText : children}
    </Button>
  );
};

export default LoadingButton;
