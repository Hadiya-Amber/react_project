import api from '@/api/axios';
import { ApiResponse } from '@/types';

export enum UserRole {
  Admin = 0,
  BranchManager = 1,
  Customer = 2
}

export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2
}

export interface CreateEmployeeDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth: string;
  gender: Gender;
  branchId: number;
  role: UserRole;
  designation: string;
  joinDate?: string;
}

export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  branchId: number;
  isActive: boolean;
  tempPassword?: string;
}

export const userService = {
  async createBranchManager(employeeData: CreateEmployeeDto): Promise<UserResponseDto> {
    try {
      const formData = new FormData();
      
      // Convert date to proper format
      const processedData = {
        ...employeeData,
        dateOfBirth: new Date(employeeData.dateOfBirth).toISOString(),
        joinDate: employeeData.joinDate ? new Date(employeeData.joinDate).toISOString() : new Date().toISOString()
      };
      
      Object.entries(processedData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Sending branch manager data

      const response = await api.post<ApiResponse<UserResponseDto>>('/registration/branch-manager', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create branch manager');
    } catch (error: any) {
      // Branch manager creation error occurred
      
      // Handle validation errors specifically
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle validation problem details
        if (errorData?.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          throw new Error(`Validation failed: ${validationErrors}`);
        }
        
        if (errorData?.title) {
          throw new Error(`${errorData.title}: ${errorData.detail || 'Please check your input'}`);
        }
        
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        
        throw new Error('Branch manager creation validation failed. Please check all required fields.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to create branch manager');
    }
  },

  async getAllUsers(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/admin/users');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch users');
  },

  async getUserById(id: number): Promise<UserResponseDto> {
    try {
      const response = await api.get<ApiResponse<UserResponseDto>>(`/user/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'User not found');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to fetch user');
    }
  },
};
