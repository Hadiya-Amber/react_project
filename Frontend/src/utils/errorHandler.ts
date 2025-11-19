export const getErrorMessage = (error: any): string => {
  // If it's already a user-friendly message, return it
  if (error?.name === 'ValidationError') {
    return error.message;
  }

  // Handle axios errors
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Use backend message if available and user-friendly
    if (data?.message && !data.message.includes('status code')) {
      return data.message;
    }

    // Map status codes to user-friendly messages
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Invalid email or password. Please check your credentials.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data. Please try again.';
      case 422:
        return 'Invalid data provided. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  // Handle network errors
  if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
    return 'Unable to connect to server. Please check your internet connection.';
  }

  // Handle timeout errors
  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  // Return the error message if it's user-friendly, otherwise default
  if (error?.message && !error.message.includes('status code') && !error.message.includes('Request failed')) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};