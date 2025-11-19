import api from '@/api/axios';
import { ApiResponse } from '@/types';

export const accountActivationService = {
  async sendActivationOtp(email: string): Promise<void> {
    const formData = new FormData();
    formData.append('email', email);

    const response = await api.post<ApiResponse<null>>('/account-activation/send-otp', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send activation OTP');
    }
  },

  async activateAccount(email: string, otpCode: string, accountId: number): Promise<void> {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('otpCode', otpCode);
    formData.append('accountId', accountId.toString());

    const response = await api.post<ApiResponse<null>>('/account-activation/activate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Account activation failed');
    }
  },
};
