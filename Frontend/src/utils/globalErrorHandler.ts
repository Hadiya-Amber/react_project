// Global error handler for displaying errors in UI
let showNotificationCallback: ((message: string, type: 'error' | 'warning' | 'info') => void) | null = null;

export const setGlobalNotificationHandler = (callback: (message: string, type: 'error' | 'warning' | 'info') => void) => {
  showNotificationCallback = callback;
};

export const showGlobalError = (message: string) => {
  if (showNotificationCallback) {
    showNotificationCallback(message, 'error');
  }
};

export const showGlobalWarning = (message: string) => {
  if (showNotificationCallback) {
    showNotificationCallback(message, 'warning');
  }
};

export const showGlobalInfo = (message: string) => {
  if (showNotificationCallback) {
    showNotificationCallback(message, 'info');
  }
};