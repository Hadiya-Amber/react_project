import React, { createContext, useContext, useState, useEffect, ReactNode, use } from 'react';
import { User, LoginDto } from '@/types/user';
import { authService } from '@/services/authService';
import { apiOptimizer } from '@/utils/apiOptimizer';
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
    // Generate a unique tab ID for this session
    const tabId = sessionStorage.getItem('tabId') || Date.now().toString();
    sessionStorage.setItem('tabId', tabId);
    
    // Check if this tab was previously authenticated
    const sessionToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    const sessionUser = sessionStorage.getItem(STORAGE_KEYS.USER);
    const authenticatedTabId = localStorage.getItem('authenticatedTabId');
    
    if (sessionToken && sessionUser && authenticatedTabId === tabId) {
      // User is authenticated in this specific tab
      setToken(sessionToken);
      setUser(JSON.parse(sessionUser));
    } else if (!sessionToken && authenticatedTabId === tabId) {
      // This tab was authenticated but lost session data (page refresh)
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        sessionStorage.setItem(STORAGE_KEYS.TOKEN, storedToken);
        sessionStorage.setItem(STORAGE_KEYS.USER, storedUser);
      }
    }
    // If this is a new tab (different tabId), user remains unauthenticated
    
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
      const tabId = sessionStorage.getItem('tabId') || Date.now().toString();
      
      // Store authentication data and mark this tab as authenticated
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem('authenticatedTabId', tabId);
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);

    // Clear all authentication data
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('authenticatedTabId');
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
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
