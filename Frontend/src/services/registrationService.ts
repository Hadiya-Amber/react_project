import api from '@/api/axios';
import { SimpleCustomerRegistrationDto, ApiResponse } from '@/types';

export const registrationService = {
  async registerCustomer(registrationData: SimpleCustomerRegistrationDto): Promise<any> {
    try {
      const formData = new FormData();
      
      // Send all data including confirmPassword as backend expects it
      const dataToSend = registrationData;
      
      Object.entries(dataToSend).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await api.post<ApiResponse<any>>('/registration/customer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Registration failed');
    } catch (error: any) {
      // Registration error occurred - log for debugging
      console.error('Registration error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message
      });
      
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
        
        throw new Error('Registration validation failed. Please check all required fields.');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Registration failed');
    }
  },
};
