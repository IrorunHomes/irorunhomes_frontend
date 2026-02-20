
import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegistrationData, 
  User,
  UserFilters,
  UserResponse,
  UsersResponse, 
} from '../types/auth';
import { cookieService } from '../lib/cookies';

// Constants for better maintainability
const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  CURRENT_USER: '/auth/profile',
  VERIFY_EMAIL: '/auth/verify-otp',
  RESEND_OTP: '/auth/resend-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  UPDATE_PROFILE: '/auth/update-profile',
  NIN_VERIFICATION: '/auth/verify-nin',
} as const;

// Error response type
interface ErrorResponse {
  message?: string;
  success?: boolean;
  error?: string;
  errors?: string[];
  email?: string;
}

// Extend AxiosRequestConfig to support retry flag
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Custom error classes
export class EmailNotVerifiedError extends Error {
  public email: string;
  
  constructor(message: string, email: string) {
    super(message);
    this.name = 'EmailNotVerifiedError';
    this.email = email;
  }
}

export class AuthError extends Error {
  public statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

// Create axios instance with proper configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 50000
});

// Request interceptor to add auth token from cookies
api.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = cookieService.get('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    

    // Handle other error cases
    if (error.code === 'ECONNABORTED') {
      throw new AuthError('Request timeout. Please try again.');
    }
    
    if (error.response) {
      const errorData = error.response.data;
      const status = error.response.status;
      
      // Handle email not verified case
      if (status === 403 && errorData?.message?.toLowerCase().includes('email not verified')) {
        const email = errorData.email || '';
        throw new EmailNotVerifiedError(errorData.message || 'Email not verified', email);
      }
      
      // Handle validation errors
      if (status === 422 && errorData?.errors) {
        const errorMessage = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        throw new AuthError(errorMessage, status);
      }
      
      throw error;
      
    } else if (error.request) {
      throw new AuthError('No response received from server. Please check your connection.');
    } else {
      throw new AuthError(error.message || 'An unknown error occurred.');
    }
  }
);

// Helper function for client-side cleanup
async function handleClientSideLogout() {
  cookieService.remove('accessToken');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    sessionStorage.clear();
    
    // Only redirect if we're not already on auth pages
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes('/auth/login') || 
                      currentPath.includes('/auth/register') || 
                      currentPath.includes('/auth/verify-email');
    
    if (!isAuthPage) {
      window.location.href = '/auth/login';
    }
  }
}

class AuthService {
  private extractData<T>(response: { data: T }): T {
    return response.data;
  }

  // --- Authentication Methods ---

  async register(userData: RegistrationData): Promise<AuthResponse> {
    try {
      // Clean up the payload to match backend expectations
      const payload = { 
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'tenant',
        phone: userData.phone || '',
        confirmPassword: userData.confirmPassword
      };

      const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, payload);
      
      // Store token if present in response
      if (response.data.accessToken) {
        cookieService.set('accessToken', response.data.accessToken, 7);
      }
      
      return this.extractData(response);
    } catch (error: unknown) {
      throw error;
    }
  }

async login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    
    const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, {
      email: credentials.email,
      password: credentials.password
    });
    if (response.data.accessToken) {
      cookieService.set('accessToken', response.data.accessToken, 7);
      if (credentials.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      return response.data;
    } else {
      const errorMessage = response.data.message || 'Login failed';
      throw new Error(errorMessage);
    }
    
  } catch (error: unknown) {    
    if (error instanceof AxiosError) {
      if (error.response) {        
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            `Login failed (${error.response.status})`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unexpected error occurred');
  }
}

  async logout(): Promise<void> {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error: unknown) {
    if (error instanceof Error) {
    throw error;
    }    } finally {
      // Always clear client-side tokens
      handleClientSideLogout();
    }
  }

async getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<User | AuthResponse>(AUTH_ENDPOINTS.CURRENT_USER);
        let userData: User | null = null;
    
    if ('user' in response.data && response.data.user) {
      userData = response.data.user as User;
    } else if (response.data && typeof response.data === 'object' && '_id' in response.data) {
      userData = response.data as User;
    } else {
      return null;
    }

    return userData;
    
  } catch (error: unknown) {    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      if (status === 401 || status === 403) {
        cookieService.remove('accessToken');
        return null;
      }
    }
    
    return null;
  }
  }
  
  async getAllUsers(filters?: UserFilters): Promise<UsersResponse> {
    try {
      const queryParams = new URLSearchParams()
      if (filters?.role) queryParams.append('role', filters.role)
      if (filters?.status) queryParams.append('status', filters.status)
      if (filters?.search) queryParams.append('search', filters.search)
      if (filters?.page) queryParams.append('page', String(filters.page))
      if (filters?.limit) queryParams.append('limit', String(filters.limit))
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy)
      if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder)

      const response = await api.get(`/admin/users?${queryParams.toString()}`)
      return response.data
    } catch (error) {
    if (error instanceof Error) {
      throw error;
    }      return {
        success: false,
        message: 'Failed to fetch users'
      }
    }
  }

  async getUserById(userId: string): Promise<UserResponse> {
    try {
      const response = await api.get(`/admin/users/${userId}`)
      return response.data
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      return {
        success: false,
        message: 'Failed to fetch user details'
      }
    }
  }

  async updateUserStatus(userId: string, isActive: boolean, reason?: string): Promise<{ success: boolean; message?: string; data?: User }> {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { isActive, reason })
      return response.data
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      return {
        success: false,
        message: 'Failed to update user status'
      }
    }
  }

  async verifyUserKYC(userId: string, verified: boolean, notes?: string): Promise<{ success: boolean; message?: string; data?: User }> {
    try {
      const response = await api.patch(`/admin/users/${userId}/verify`, { verified, notes })
      return response.data
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      return {
        success: false,
        message: 'Failed to verify KYC'
      }
    }
  }

  async createAdmin(userData: { fullName: string; email: string; password: string; phone?: string }): Promise<{ success: boolean; message?: string; data?: User }> {
    try {
      const response = await api.post('admin/register-admin', userData)
      return response.data
    } catch (error) {
    if (error instanceof Error) {
      throw error;
    }      return {
        success: false,
        message: 'Failed to create admin'
      }
    }
  }


  async verifyEmail(email: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        AUTH_ENDPOINTS.VERIFY_EMAIL, 
        { email, otp }
      );

      // Store token if verification successful
      if (response.data.accessToken) {
        cookieService.set('accessToken', response.data.accessToken, 7);
      }

      return this.extractData(response);
    } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }      throw error;
    }
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        AUTH_ENDPOINTS.RESEND_OTP, 
        { email }
      );
      return this.extractData(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to resend OTP');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        AUTH_ENDPOINTS.FORGOT_PASSWORD, 
        { email }
      );
      return this.extractData(response);
    } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }      throw error;
    }
  }

async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
  try {
    const response = await api.post<{ message: string }>(
      AUTH_ENDPOINTS.RESET_PASSWORD, 
      { 
        email,      
        otp,
        newPassword 
      }
    );
    return this.extractData(response);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to reset password');
  }
}

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        AUTH_ENDPOINTS.CHANGE_PASSWORD, 
        { currentPassword, newPassword }
      );
      return this.extractData(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to change password');
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await api.put<User>(
        AUTH_ENDPOINTS.UPDATE_PROFILE, 
        updates
      );
      return this.extractData(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update profile');
    }
  }


  // Utility method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!cookieService.get('accessToken');
  }

  // Utility method to get stored token
  getStoredToken(): string | null {
    return cookieService.get('accessToken');
  }
}

export const authService = new AuthService();

// Helper functions
export const isVerifiedUser = (user: User | null): boolean => {
  return !!(user && user.isVerified && user.isEmailVerified);
};

export const isAdmin = (user: User | null): boolean => {
  return !!(user && (user.role === 'admin' || user.role === 'super_admin'));
};

export const isSuperAdmin = (user: User | null): boolean => {
  return !!(user && user.role === 'super_admin');
};

// Export the API instance for direct use if needed
export { api as authApi };