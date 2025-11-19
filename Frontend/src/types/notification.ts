export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export enum NotificationCategory {
  TRANSACTIONAL = 'transactional',
  SYSTEM = 'system',
  COMPLIANCE = 'compliance',
  SECURITY = 'security'
}

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  autoClose?: boolean;
  duration?: number;
  userId?: number;
  role?: string;
}

export interface ConfirmationDialog {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'error' | 'info';
}
