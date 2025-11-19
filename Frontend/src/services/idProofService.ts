import api from '@/api/axios';
import { ApiResponse } from '@/types';

export interface IdProofTypeOption {
  value: number;
  label: string;
}

export interface ValidateIdProofRequest {
  idProofType: number;
  idProofNumber: string;
}

export interface ValidateIdProofResponse {
  isValid: boolean;
  message: string;
}

export const idProofService = {
  async getIdProofTypes(): Promise<IdProofTypeOption[]> {
    const response = await api.get<ApiResponse<IdProofTypeOption[]>>('/idproof/types');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch ID proof types');
  },

  async validateIdProof(data: ValidateIdProofRequest): Promise<ValidateIdProofResponse> {
    const response = await api.post<ApiResponse<ValidateIdProofResponse>>('/idproof/validate', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to validate ID proof');
  }
};
