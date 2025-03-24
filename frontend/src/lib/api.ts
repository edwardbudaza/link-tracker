import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { getSession, signOut } from 'next-auth/react';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true, // Important for cookies
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    // Get session on client-side
    const session = await getSession();
    
    // If session exists and has access token, add to headers
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
    
    // Add CSRF token if it exists
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        if (refreshResponse.status === 200) {
          // If refresh successful, retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, sign out user
        console.error('Token refresh failed:', refreshError);
        signOut({ callbackUrl: '/login' });
        toast.error('Your session has expired. Please login again.');
      }
    }
    
    // Handle other common errors
    if (error.response) {
      // Server responded with an error status
      const status = error.response.status;
      
      if (status === 403) {
        toast.error('You do not have permission to perform this action');
      } else if (status === 404) {
        toast.error('Resource not found');
      } else if (status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // Request was made but no response received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get CSRF token from meta tag
function getCsrfToken(): string | null {
  if (typeof window !== 'undefined') {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : null;
  }
  return null;
}

// API service methods
const apiService = {
  // URL endpoints
  urls: {
    create: (data: { originalUrl: string }) => 
      api.post('/api/v1/urls', data),
    getAll: (params?: { skip?: number; limit?: number }) => 
      api.get('/api/v1/urls', { params }),
    getById: (id: string) => 
      api.get(`/api/v1/urls/${id}`),
    getAnalytics: (shortId: string) => 
      api.get(`/api/v1/analytics/${shortId}`),
    update: (id: string, data: { isActive: boolean }) => 
      api.patch(`/api/v1/urls/${id}`, data),
    delete: (id: string) => 
      api.delete(`/api/v1/urls/${id}`),
  },
  
  // HTML processor endpoints
  htmlProcessor: {
    process: (data: { htmlContent: string; baseUrl: string }) => 
      api.post('/api/v1/html-processor', data),
  },
  
  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) => 
      api.post('/api/v1/auth/login', credentials),
    register: (userData: { email: string; password: string; name: string }) => 
      api.post('/api/v1/auth/register', userData),
    logout: () => 
      api.post('/api/v1/auth/logout'),
    refresh: () => 
      api.post('/api/v1/auth/refresh'),
    me: () => 
      api.get('/api/v1/auth/me'),
  },
  
  // Generic request method for one-off requests
  request: <T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api(config),
};

export default apiService; 