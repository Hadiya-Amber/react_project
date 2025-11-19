import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';

export const useBankingNotifications = () => {
  const { showNotification, showConfirmation } = useNotification();

  const notifyTransaction = (type: 'deposit' | 'withdrawal' | 'transfer', amount: number, success: boolean) => {
    const message = success 
      ? `₹${amount.toLocaleString()} ${type} completed successfully`
      : `₹${amount.toLocaleString()} ${type} failed`;
    
    showNotification(message, success ? NotificationType.SUCCESS : NotificationType.ERROR);
  };

  const notifyBalance = (balance: number, threshold: number) => {
    if (balance < threshold) {
      showNotification(
        `Low balance: ₹${balance.toLocaleString()} remaining`,
        NotificationType.WARNING,
        { persistent: true }
      );
    }
  };

  const confirmTransaction = (type: string, amount: number, onConfirm: () => void) => {
    showConfirmation(
      `Confirm ${type}`,
      `Are you sure you want to ${type.toLowerCase()} ₹${amount.toLocaleString()}? This action cannot be undone.`,
      onConfirm,
      { severity: 'warning' }
    );
  };

  const notifyAccountStatus = (status: string, accountNumber: string) => {
    const message = `Account ${accountNumber} is now ${status}`;
    const type = status === 'Active' ? NotificationType.SUCCESS : NotificationType.WARNING;
    showNotification(message, type, { persistent: true });
  };

  const notifyKYC = (status: 'pending' | 'approved' | 'rejected') => {
    const messages = {
      pending: 'Your KYC verification is pending. Please complete your documentation.',
      approved: 'Your KYC verification has been approved.',
      rejected: 'Your KYC verification was rejected. Please contact support.'
    };
    
    const types = {
      pending: NotificationType.WARNING,
      approved: NotificationType.SUCCESS,
      rejected: NotificationType.ERROR
    };

    showNotification(messages[status], types[status], { persistent: true });
  };

  return {
    notifyTransaction,
    notifyBalance,
    confirmTransaction,
    notifyAccountStatus,
    notifyKYC,
    showNotification,
    showConfirmation
  };
};
