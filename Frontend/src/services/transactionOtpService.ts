import api from '@/api/axios';
import { ApiResponse } from '@/types';

export const transactionOtpService = {
  async sendTransactionOtp(amount: number): Promise<void> {
    const formData = new FormData();
    formData.append('amount', amount.toString());

    const response = await api.post<ApiResponse<null>>('/transaction-otp/send', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send transaction OTP');
    }
  },

  async verifyTransactionOtp(otpCode: string): Promise<void> {
    const formData = new FormData();
    formData.append('otpCode', otpCode);

    const response = await api.post<ApiResponse<null>>('/transaction-otp/verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'OTP verification failed');
    }
  },
};
