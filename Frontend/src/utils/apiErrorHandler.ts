import { AxiosError } from 'axios';

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) {
      return 'Session expired. Please login again.';
    }
    
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    
    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    
    if (error.response?.status && error.response.status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    const responseMessage = error.response?.data?.message;
    if (responseMessage) {
      return responseMessage;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof AxiosError && !error.response;
};
