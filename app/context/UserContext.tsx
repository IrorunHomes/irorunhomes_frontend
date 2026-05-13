"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { authService } from '../api/auth';
import type { User, UserFilters } from '../types/auth';
import { cookieService } from '../lib/cookies';
import { useMessage } from '../components/ui/MessagePopup';
import { useRouter } from 'next/navigation'


interface UserStats {
  totalUsers: number;
  totalTenants: number;
  totalAdmins: number;
  verifiedUsers: number;
  pendingVerification: number;
  activeLeases: number;
}

interface UserContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  userProfile: () => Promise<User | null>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ message: string }>;
  loading: boolean;
  isAuthenticated: boolean;
  allUsers: User[]
  userStats: UserStats | null
  loadingUsers: boolean
  fetchAllUsers: (filters?: UserFilters) => Promise<void>
  fetchUserById: (userId: string) => Promise<User | null>
  updateUserStatus: (userId: string, isActive: boolean, reason?: string) => Promise<boolean>
  verifyUserKYC: (userId: string, verified: boolean, notes?: string) => Promise<boolean>
  createAdmin: (userData: { fullName: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; message?: string }>
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Add these state variables
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const { showSuccess } = useMessage();
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter()

  // Helper to store user in cookies
  const storeUserInCookies = (userData: User) => {
    const userForCookie = {
      id: userData._id,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
      // Add other non-sensitive fields
    };
    cookieService.set('userData', encodeURIComponent(JSON.stringify(userForCookie)), 7);
  };

  // Helper to get user from cookies
  const getUserFromCookies = (): User | null => {
    try {
      const userCookie = cookieService.get('userData');
      if (userCookie) {
        return JSON.parse(decodeURIComponent(userCookie));
      }
    } catch (error) {
      console.error('Failed to parse user cookie:', error);
    }
    return null;
  };

    // Function to refresh token
  const refreshAccessToken = useCallback(async () => {
    try {
      const result = await authService.refreshToken();
      if (result.accessToken) {
        cookieService.set('accessToken', result.accessToken, 7);
        console.log('Token refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }, []);

  // Setup periodic token refresh (every 12 minutes, since token expires in 15)
  const setupTokenRefresh = useCallback(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }

    const timer = setInterval(async () => {
      const token = cookieService.get('accessToken');
      if (token) {
        await refreshAccessToken();
      }
    }, 12 * 60 * 1000); // 12 minutes

    setRefreshTimer(timer);
  }, [refreshAccessToken, refreshTimer]);

  const clearTokenRefresh = useCallback(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      setRefreshTimer(null);
    }
  }, [refreshTimer]);

  // Update checkAuth to setup refresh
  const checkAuth = async () => {
    setLoading(true);
    
    try {
      const token = cookieService.get('accessToken');
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        cookieService.remove('userData');
        clearTokenRefresh();
        return;
      }

      const cachedUser = getUserFromCookies();
      
      if (cachedUser) {
        setUser(cachedUser);
        setIsAuthenticated(true);
      }

      try {
        const apiUserData = await authService.getCurrentUser();
        
        if (apiUserData) {
          setUser(apiUserData);
          setIsAuthenticated(true);
          storeUserInCookies(apiUserData);
          setupTokenRefresh();
        } else {
          setUser(null);
          setIsAuthenticated(false);
          cookieService.clearAuthToken();
          cookieService.remove('userData');
          clearTokenRefresh();
        }
        
      } catch (apiError) {
        console.error('API fetch failed:', apiError);
        
        if (cachedUser) {
          // Keep cached user but try to refresh token
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            setUser(null);
            setIsAuthenticated(false);
            cookieService.clearAuthToken();
            cookieService.remove('userData');
            clearTokenRefresh();
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          cookieService.clearAuthToken();
          cookieService.remove('userData');
          clearTokenRefresh();
        }
      }
      
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      cookieService.clearAuthToken();
      cookieService.remove('userData');
      clearTokenRefresh();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User, token: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    cookieService.set('accessToken', token, 7);
    storeUserInCookies(userData);
    setupTokenRefresh();
    showSuccess('Login successful');
  };

  const logout = async () => {
    try {
      await authService.logout();
      showSuccess('Logout successful');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      cookieService.clearAuthToken();
      cookieService.remove('userData');
      clearTokenRefresh();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [refreshTimer]);


  useEffect(() => {
    checkAuth();
  }, []);

  
  const updateUser = (updates: Partial<User>) => {
    const updatedUser = user ? { ...user, ...updates } : null;
    setUser(updatedUser);
    
    // Update cookies too
    if (updatedUser) {
      storeUserInCookies(updatedUser);
      showSuccess('Profile updated successfully');
    }
  };

  const userProfile = async (): Promise<User | null> => {
    try {
      const profileData = await authService.getCurrentUser();
      if (profileData) {
        setUser(profileData);
        storeUserInCookies(profileData);
      }
      return profileData;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(updates);
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);
      
      // Update cookies
      if (updatedUser) {
        storeUserInCookies(updatedUser);
        showSuccess('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  /**
   * Request password reset email
   */
  const forgotPassword = async (email: string): Promise<{ message: string }> => {
    try {
      const result = await authService.forgotPassword(email);
      showSuccess('Password reset email sent successfully');
      return result;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  /**
   * Reset password with token
   */
const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
  try {
    const result = await authService.resetPassword(email, otp, newPassword);
    showSuccess('Password reset successful');
    return result;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

  // Add these methods
  const fetchAllUsers = useCallback(async (filters?: UserFilters) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return
    }

    setLoadingUsers(true)
    try {
      const result = await authService.getAllUsers(filters)
      if (result.success && result.data) {
        setAllUsers(result.data.users)
        setUserStats(result.data.stats)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }, [user])

  const fetchUserById = useCallback(async (userId: string) => {
    setLoadingUsers(true)
    try {
      const result = await authService.getUserById(userId)
      if (result.success && result.data) {
        return result.data.user
      }
      return null
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  const updateUserStatus = useCallback(async (userId: string, isActive: boolean, reason?: string) => {
    try {
      const result = await authService.updateUserStatus(userId, isActive, reason)
      if (result.success) {
        // Update local state
        setAllUsers(prev => prev.map(u => 
          u._id === userId ? { ...u, isActive } : u
        ))
        showSuccess('User status updated successfully')
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating user status:', error)
      return false
    }
  }, [])

  const verifyUserKYC = useCallback(async (userId: string, verified: boolean, notes?: string) => {
    try {
      const result = await authService.verifyUserKYC(userId, verified, notes)
      if (result.success) {
        setAllUsers(prev => prev.map(u => 
          u._id === userId ? { ...u, kycVerified: verified } : u
        ))
        showSuccess('KYC verification updated successfully')
        return true
      }
      return false
    } catch (error) {
      console.error('Error verifying KYC:', error)
      return false
    }
  }, [])

  const createAdmin = useCallback(async (userData: { fullName: string; email: string; password: string; phone?: string }) => {
    try {
      const result = await authService.createAdmin(userData)
      if (result.success) {
        showSuccess('Admin created successfully')
      } else {
        showSuccess(result.message || 'Failed to create admin')
      }
      return result
    } catch (error) {
      console.error('Error creating admin:', error)
      return { success: false, message: 'Failed to create admin' }
    }
  }, [])

  const value: UserContextType = {
    user,
    login,
    logout,
    updateUser,
    updateProfile,
    checkAuth,
    userProfile,
    forgotPassword,
    resetPassword,
    loading,
    isAuthenticated,
    allUsers,
    userStats,
    loadingUsers,
    fetchAllUsers,
    fetchUserById,
    updateUserStatus,
    verifyUserKYC,
    createAdmin,
  };

  return (
    <UserContext.Provider value={value}>
      {!loading ? children : (
        // Optional: Show loading screen
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      )}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}