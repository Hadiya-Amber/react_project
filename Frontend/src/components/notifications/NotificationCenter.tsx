import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Button,
  Divider,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Error,
  Warning,
  Info,
  MarkEmailRead
} from '@mui/icons-material';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';

const NotificationCenter: React.FC = () => {
  const { notifications, markAsRead, clearAll } = useNotification();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <CheckCircle sx={{ color: '#1565C0' }} />;
      case NotificationType.ERROR:
        return <Error sx={{ color: '#1565C0' }} />;
      case NotificationType.WARNING:
        return <Warning sx={{ color: '#1565C0' }} />;
      default:
        return <Info sx={{ color: '#1565C0' }} />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="primary">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 400, maxHeight: 500 } }}
      >
        <Box p={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Notifications</Typography>
            {notifications.length > 0 && (
              <Button size="small" onClick={clearAll}>Clear All</Button>
            )}
          </Box>
          
          {notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              No notifications
            </Typography>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      mb: 0.5,
                      cursor: 'pointer'
                    }}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="body2" fontWeight={notification.read ? 'normal' : 'bold'}>
                            {notification.message}
                          </Typography>
                          {!notification.read && (
                            <Chip size="small" color="primary" label="•" sx={{ ml: 1, minWidth: 'auto', width: 20, height: 20 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(notification.timestamp)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationCenter;
