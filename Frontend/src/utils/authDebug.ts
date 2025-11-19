import { STORAGE_KEYS } from '@/constants';

export const debugAuth = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  const sessionToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  const sessionUser = sessionStorage.getItem(STORAGE_KEYS.USER);
  const authenticatedTabId = localStorage.getItem('authenticatedTabId');
  const currentTabId = sessionStorage.getItem('tabId');

  return {
    hasToken: !!token,
    hasUser: !!user,
    hasSessionToken: !!sessionToken,
    hasSessionUser: !!sessionUser,
    tabMatch: authenticatedTabId === currentTabId,
    user: user ? JSON.parse(user) : null
  };
};

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
}