
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegistrationData {
  fullName: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
  role: 'tenant' | 'admin' | 'super_admin'
  agreeToTerms: boolean
}

export interface OTPData {
  email: string
  otp: string
}

export interface ResetPasswordData {
  email: string
  password: string
  confirmPassword: string
  token: string
}

export interface AuthResponse {
  success: boolean
  message: string
  accessToken?: string
  user?: User
  errors?: Record<string, string[]>
}

export interface User {
  _id: string
  fullName: string
  email: string
  password: string
  phone?: string
  avatar?: string
  role: 'tenant' | 'admin' | 'super_admin'
  idNumber?: string
  favourites?: string[]
  otp?: string
  otpExpires?: Date
  isVerified: boolean
  isEmailVerified: boolean
  kycVerified: boolean
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface VerificationResponse {
  success: boolean
  message: string
  data?: User
}

export interface UserFilters {
  role?: 'tenant' | 'admin' | 'all'
  status?: 'all' | 'verified' | 'pending' | 'suspended'
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UsersResponse {
  success: boolean
  data?: {
    users: User[]
    pagination: {
      total: number
      page: number
      limit: number
      pages: number
    }
    stats: {
      totalUsers: number
      totalTenants: number
      totalAdmins: number
      verifiedUsers: number
      pendingVerification: number
      activeLeases: number
    }
  }
  message?: string
}

export interface UserResponse {
  success: boolean
  data?: {
    user: User
    stats: {
      totalRequests: number
      pendingRequests: number
      approvedRequests: number
      activeLeases: number
      rejectedRequests: number
      totalPayments: number
    }
    rentalHistory: User[]
  }
  message?: string
}