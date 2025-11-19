import React, { createContext, useContext, useState, useCallback, use, useEffect } from 'react';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { NotificationType, Notification, ConfirmationDialog } from '@/types/notification';
import { setGlobalNotificationHandler } from '@/utils/globalErrorHandler';

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType, options?: { persistent?: boolean; duration?: number }) => void;
  showConfirmation: (title: string, message: string, onConfirm: () => void, options?: { severity?: 'warning' | 'error' | 'info' }) => void;
  addToHistory: (notification: Notification) => void;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: NotificationType; duration?: number }>({
    open: false,
    message: '',
    type: NotificationType.INFO
  });
  
  const [confirmation, setConfirmation] = useState<ConfirmationDialog>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType, options?: { persistent?: boolean; duration?: number }) => {
    if (options?.persistent) {
      // Add to notification history for persistent notifications
      const notification: Notification = {
        id: Date.now().toString(),
        type,
        category: type === NotificationType.ERROR ? 'system' as any : 'transactional' as any,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message,
        timestamp: new Date(),
        read: false,
        persistent: true
      };
      addToHistory(notification);
    }
    
    setSnackbar({
      open: true,
      message,
      type,
      duration: options?.duration || (type === NotificationType.ERROR ? 6000 : 4000)
    });
  }, []);

  const showConfirmation = useCallback((title: string, message: string, onConfirm: () => void, options?: { severity?: 'warning' | 'error' | 'info' }) => {
    setConfirmation({
      open: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmation(prev => ({ ...prev, open: false }));
      },
      onCancel: () => setConfirmation(prev => ({ ...prev, open: false })),
      severity: options?.severity || 'warning'
    });
  }, []);

  const addToHistory = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep last 20
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Set up global error handler
  useEffect(() => {
    const globalHandler = (message: string, type: 'error' | 'warning' | 'info') => {
      const notificationType = type === 'error' ? NotificationType.ERROR : 
                              type === 'warning' ? NotificationType.WARNING : 
                              NotificationType.INFO;
      showNotification(message, notificationType);
    };
    
    setGlobalNotificationHandler(globalHandler);
  }, [showNotification]);

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showConfirmation,
      addToHistory,
      notifications,
      markAsRead,
      clearAll
    }}>
      {children}
      
      {/* Toast Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.duration}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.type} 
          variant="filled"
          sx={{
            '&.MuiAlert-filledSuccess': {
              backgroundColor: '#1565C0'
            },
            '&.MuiAlert-filledError': {
              backgroundColor: '#1565C0'
            },
            '&.MuiAlert-filledWarning': {
              backgroundColor: '#1565C0'
            },
            '&.MuiAlert-filledInfo': {
              backgroundColor: '#1565C0'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog open={confirmation.open} maxWidth="sm" fullWidth>
        <DialogTitle>{confirmation.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmation.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmation.onCancel} color="inherit">
            {confirmation.cancelText || 'Cancel'}
          </Button>
          <Button 
            onClick={confirmation.onConfirm} 
            color={confirmation.severity === 'error' ? 'error' : 'primary'}
            variant="contained"
          >
            {confirmation.confirmText || 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = use(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
