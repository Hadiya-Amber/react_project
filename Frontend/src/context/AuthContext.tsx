import React, { createContext, useContext, useState, useEffect, ReactNode, use } from 'react';
import { User, LoginDto } from '@/types/user';
import { authService } from '@/services/authService';
import { apiOptimizer } from '@/utils/apiOptimizer';
import { clearCustomerDashboardCache } from '@/services/analyticsService';
import { STORAGE_KEYS } from '@/constants';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const authenticatedTabId = localStorage.getItem('authenticatedTabId');
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    
    // Check if this tab has session data (indicates refresh, not new tab)
    const existingTabId = sessionStorage.getItem('tabId');
    
    let currentTabId: string;
    let isAuthenticated = false;
    
    if (existingTabId) {
      // This tab already has an ID (refresh case)
      currentTabId = existingTabId;
      
      // Only authenticate if this tab's ID matches the authenticated tab ID
      if (authenticatedTabId === currentTabId && storedToken && storedUser) {
        isAuthenticated = true;
      }
    } else {
      // This is a new tab (no existing tabId in sessionStorage)
      currentTabId = Date.now().toString();
      sessionStorage.setItem('tabId', currentTabId);
      
      // New tabs are NEVER authenticated, even if localStorage has data
      isAuthenticated = false;
    }
    
    // Only set authentication state if this is the authenticated tab
    if (isAuthenticated && storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        
        // Restore session storage for this tab
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, storedToken);
        sessionStorage.setItem(STORAGE_KEYS.USER, storedUser);
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem('authenticatedTabId');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginDto): Promise<void> => {
    try {
      const response = await apiOptimizer.dedupe(
        `login-${credentials.email}`,
        () => authService.login(credentials)
      );
      
      setToken(response.token);
      setUser(response.user as unknown as User);
      
      // Get current tab ID
      const currentTabId = sessionStorage.getItem('tabId') || Date.now().toString();
      
      // Store authentication data and mark this tab as authenticated
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem('authenticatedTabId', currentTabId);
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);

    // Clear authentication data
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('authenticatedTabId');
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    
    // Clear API cache and pending requests
    apiOptimizer.clearCache();
    apiOptimizer.cancelPending();
    
    // Clear analytics service cache
    clearCustomerDashboardCache();
    
    // Clear customer context cache
    if ((window as any).__customerContextInvalidate) {
      (window as any).__customerContextInvalidate();
    }
    
    authService.logout();
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = use(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
