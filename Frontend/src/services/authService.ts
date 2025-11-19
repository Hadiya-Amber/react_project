import api from '@/api/axios';
import { ApiResponse } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { validationGuard } from '@/utils/validationGuard';
import { getErrorMessage } from '@/utils/errorHandler';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
    branchId?: number;
  };
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const authService = {
  async login(credentials: LoginDto): Promise<LoginResponse> {
    // Frontend validation - NO API call if this fails
    validationGuard.rules.loginCredentials(credentials.email, credentials.password);

    try {
      const formData = new FormData();
      formData.append('email', credentials.email);
      formData.append('password', credentials.password);

      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success && response.data.data) {
        // Store token in localStorage
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.data.user));
        return response.data.data;
      }
      throw new Error('Invalid email or password. Please check your credentials and try again.');
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  },

  async changePassword(data: ChangePasswordDto): Promise<void> {
    // Frontend validation - NO API call if this fails
    validationGuard.rules.required(data.currentPassword, 'Current password');
    validationGuard.rules.required(data.newPassword, 'New password');
    validationGuard.rules.required(data.confirmPassword, 'Confirm password');
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('New password and confirm password do not match');
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await api.post<ApiResponse<null>>('/registration/change-password', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Password change failed');
    }
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getCurrentUser(): any {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },


};
