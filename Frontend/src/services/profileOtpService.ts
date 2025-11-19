import api from '@/api/axios';
import { ApiResponse } from '@/types';

export const profileOtpService = {
  async sendProfileUpdateOtp(): Promise<void> {
    const response = await api.post<ApiResponse<null>>('/profile-otp/send', {}, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send profile update OTP');
    }
  },

  async verifyProfileUpdateOtp(otpCode: string): Promise<void> {
    const formData = new FormData();
    formData.append('otpCode', otpCode);

    const response = await api.post<ApiResponse<null>>('/profile-otp/verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'OTP verification failed');
    }
  },
};
