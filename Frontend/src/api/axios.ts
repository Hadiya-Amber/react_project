import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants';
import { showGlobalError, showGlobalWarning } from '@/utils/globalErrorHandler';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

const pending = new Map<string, AbortController>();

function getRequestKey(config: InternalAxiosRequestConfig) {
  const { method, url, params, data } = config;
  const p = params ? JSON.stringify(params) : '';
  const d = typeof data === 'string' ? data : data ? JSON.stringify(data) : '';
  return [method, url, p, d].join('|');
}

function addPending(config: InternalAxiosRequestConfig) {
  const key = getRequestKey(config);
  if (pending.has(key)) {
    const prev = pending.get(key)!;
    prev.abort();
    pending.delete(key);
  }
  const controller = new AbortController();
  config.signal = controller.signal;
  pending.set(key, controller);
}

function removePending(config: InternalAxiosRequestConfig) {
  const key = getRequestKey(config);
  if (pending.has(key)) pending.delete(key);
}

api.interceptors.request.use(
  (config) => {
    addPending(config as InternalAxiosRequestConfig);
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.USER); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

function getErrorMessage(status: number): string {
  switch (status) {
    case 400: return 'Bad request. Please check your input.';
    case 401: return 'Authentication required.';
    case 403: return 'Access denied.';
    case 404: return 'Resource not found.';
    case 409: return 'Conflict occurred.';
    case 422: return 'Validation failed.';
    case 500: return 'Internal server error.';
    case 502: return 'Bad gateway.';
    case 503: return 'Service unavailable.';
    default: return 'An error occurred.';
  }
}

api.interceptors.response.use(
  (response: AxiosResponse) => {
    removePending(response.config as InternalAxiosRequestConfig);
    return response;
  },
  (error: AxiosError) => {
    if (error.config) removePending(error.config as InternalAxiosRequestConfig);
    
    if (error.name === 'CanceledError' || 
        error.code === 'ERR_CANCELED' ||
        error.config?.url?.includes('bank-stats') ||
        error.message?.includes('bank stats')) {
      return Promise.reject(error);
    }
    
    if (error.response) {
      if (error.response.status === 401 && !window.location.pathname.includes('/login')) {
        showGlobalWarning('Session expired. Please login again.');
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem('authenticatedTabId');
        sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.USER);
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response.status === 403) {
        showGlobalError('Access denied. You do not have permission to perform this action.');
      } else if (error.response.status >= 500) {
        showGlobalError('Server error. Please try again later.');
      }
 
      return Promise.resolve({
        ...error.response,
        status: 200,
        statusText: 'OK',
        data: {
          success: false,
          message: (error.response.data as any)?.message || getErrorMessage(error.response.status),
          data: null,
          errors: (error.response.data as any)?.errors || null,
          originalStatus: error.response.status
        }
      });
    }
    
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      showGlobalError('Unable to connect to server. Please check your internet connection.');
    }
    return Promise.reject(error);
  }
);

export default api;
