
import axios, { AxiosInstance, AxiosError } from 'axios'
import { cookieService } from '../lib/cookies'
import { RentalRequest, SubmitRequestPayload, ApiResponse, UploadPaymentReceiptPayload, SetAutoRenewalPayload, RequestRenewalPayload, RegisterAdminPayload, PaginationParams, ProcessRentalRequestPayload, VerifyPaymentPayload, RenewLeasePayload, ProcessRenewalPayload } from '../types/rentalRequest'
import { User } from '../types/auth'

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`

// Create Axios instance for authenticated endpoints
const authApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add auth interceptor
authApi.interceptors.request.use(
  (config) => {
    const token = cookieService.getAuthToken?.() || cookieService.get?.('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('No auth token found for rental request')
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor for better error handling
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed - redirecting to login')
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session=expired'
      }
    }
    return Promise.reject(error)
  }
)



export class RentalRequestService {
  
  // ============ TENANT FUNCTIONS ============
  
  /**
   * Submit a new rental request - propertyId in URL params
   * POST /tenant/request/:propertyId
   */
  async submitRequest(payload: SubmitRequestPayload): Promise<{ success: boolean; request?: RentalRequest; message?: string }> {
    try {
      const { propertyId, ...requestData } = payload
      
      const response = await authApi.post<ApiResponse<RentalRequest>>(`/tenant/request/${propertyId}`, requestData)
      
      return {
        success: true,
        request: response.data.request || response.data.data,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error submitting rental request:', error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          return {
            success: false,
            message: error.response.data?.message || 'Invalid request. Please check your information.'
          }
        } else if (error.response?.status === 401) {
          return {
            success: false,
            message: 'Your session has expired. Please log in again.'
          }
        } else if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Property not found. It may have been removed.'
          }
        } else if (error.response?.status === 500) {
          console.error('Server error details:', error.response.data)
          return {
            success: false,
            message: error.response.data?.message || 'Server error. Our team has been notified.'
          }
        }
        
        return {
          success: false,
          message: error.response?.data?.message || error.message || 'Failed to submit request'
        }
      }
      
      return {
        success: false,
        message: 'An unexpected error occurred'
      }
    }
  }

  /**
   * Get all rental requests for the current tenant
   * GET /tenant/my-requests
   */
  async getMyRequests(): Promise<{ success: boolean; requests?: RentalRequest[]; count?: number; message?: string }> {
    try {
      const response = await authApi.get<ApiResponse<RentalRequest[]>>('/tenant/my-requests')
      
      return {
        success: true,
        requests: response.data.requests || response.data.data || [],
        count: response.data.count || 0,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error fetching rental requests:', error)
      return {
        success: false,
        message: 'Failed to fetch rental requests',
        requests: [],
        count: 0
      }
    }
  }

  /**
   * Get a specific rental request by ID
   */
  async getRequest(requestId: string): Promise<{ success: boolean; request?: RentalRequest; message?: string }> {
    try {
      const response = await authApi.get<ApiResponse<RentalRequest>>(`/tenant/request/${requestId}`)
      console.log("Tenant", response)
      
      return {
        success: true,
        request: response.data.request || response.data.data,
        message: response.data.message
      }
    } catch (error) {
      console.error(`Error fetching request ${requestId}:`, error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Request not found'
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to fetch rental request'
      }
    }
  }

  /**
   * Cancel a rental request
   * PATCH /tenant/request/:requestId/cancel
   */
  async cancelRequest(requestId: string): Promise<{ success: boolean; request?: RentalRequest; message?: string }> {
    try {
      const response = await authApi.patch<ApiResponse<RentalRequest>>(`/tenant/request/${requestId}/cancel`)
      
      return {
        success: true,
        message: response.data.message || 'Request cancelled successfully',
        request: response.data.request || response.data.data
      }
    } catch (error) {
      console.error(`Error cancelling request ${requestId}:`, error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          return {
            success: false,
            message: error.response.data?.message || 'Only pending requests can be cancelled'
          }
        } else if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Request not found'
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to cancel rental request'
      }
    }
  }

  /**
   * Upload payment receipt for approved request
   * POST /tenant/request/:requestId/payment-receipt
   */
  async uploadPaymentReceipt(
    requestId: string, 
    payload: UploadPaymentReceiptPayload
  ): Promise<{ success: boolean; request?: RentalRequest; message?: string }> {
    try {
      const formData = new FormData()
      
      formData.append('amount', String(payload.amount || ''))
      formData.append('paymentMethod', payload.paymentMethod)
      formData.append('referenceNumber', payload.referenceNumber)
      
      if (payload.receiptImage) {
        formData.append('receiptImage', payload.receiptImage, payload.receiptImage.name)
      }
      
      const response = await authApi.post<ApiResponse<RentalRequest>>(
        `/tenant/upload-receipt/${requestId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      
      return {
        success: true,
        request: response.data.request || response.data.data,
        message: response.data.message || 'Payment receipt uploaded successfully'
      }
    } catch (error) {
      console.error(`Error uploading payment receipt for ${requestId}:`, error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          return {
            success: false,
            message: error.response.data?.message || 'Only approved requests can have payments uploaded'
          }
        } else if (error.response?.status === 403) {
          return {
            success: false,
            message: 'You are not authorized to upload payment for this request'
          }
        } else if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Rental request not found'
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to upload payment receipt'
      }
    }
  }

  /**
   * Get tenant's active lease
   * GET /tenant/lease
   */
  async getTenantLease(): Promise<{ success: boolean; lease?: RentalRequest; message?: string }> {
    try {
      const response = await authApi.get<ApiResponse<RentalRequest>>('/tenant/lease')
      console.log("lease", response)
      
      return {
        success: true,
        lease: response.data.lease || response.data.request || response.data.data,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error fetching tenant lease:', error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'No active lease found'
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to fetch lease'
      }
    }
  }

  /**
   * Get tenant's lease by ID
   * GET /tenant/leases/:leaseId
   */
  async getTenantLeaseById(requestId: string): Promise<{ success: boolean; data?: RentalRequest; message?: string }> {
    try {
      const response = await authApi.get<ApiResponse<RentalRequest>>(`/tenant/lease/${requestId}`)
      
      return {
        success: true,
        data: response.data.data || response.data.request,
        message: response.data.message
      }
    } catch (error) {
      console.error(`Error fetching tenant lease ${requestId}:`, error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Lease not found'
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to fetch lease'
      }
    }
  }

  /**
   * Set auto-renewal preference for lease
   * PATCH /tenant/lease/:requestId/auto-renew
   */
  async setAutoRenewal(
    requestId: string, 
    payload: SetAutoRenewalPayload
  ): Promise<{ success: boolean; request?: RentalRequest; message?: string }> {
    try {
      const response = await authApi.patch<ApiResponse<RentalRequest>>(
        `/tenant/lease/${requestId}/auto-renew`,
        payload
      )
      
      return {
        success: true,
        request: response.data.request || response.data.data,
        message: response.data.message || `Auto-renewal ${payload.autoRenew ? 'enabled' : 'disabled'}`
      }
    } catch (error) {
      console.error(`Error setting auto-renewal for ${requestId}:`, error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Active lease not found'
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to set auto-renewal preference'
      }
    }
  }

  /**
   * Request lease renewal (Tenant)
   * POST /tenant/leases/:leaseId/renew
   */
  async requestRenewal(
    leaseId: string,
    payload: RequestRenewalPayload
  ): Promise<{ success: boolean; request?: RentalRequest; message?: string }> {
    try {
      const response = await authApi.post<ApiResponse<RentalRequest>>(
        `/tenant/lease/${leaseId}/renew`,
        payload
      )
      
      return {
        success: true,
        request: response.data.request || response.data.data,
        message: response.data.message || 'Renewal request submitted successfully'
      }
    } catch (error) {
      console.error(`Error requesting renewal for ${leaseId}:`, error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          return {
            success: false,
            message: error.response.data?.message || 'Invalid renewal request'
          }
        } else if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Active lease not found'
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to request renewal'
      }
    }
  }

  // ============ ADMIN FUNCTIONS ============

  /**
   * Register a new admin (Super Admin only)
   * POST /admin/register
   */
  async registerAdmin(payload: RegisterAdminPayload): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await authApi.post('/admin/register-admin', payload)
      
      return {
        success: true,
        user: response.data.user,
        message: response.data.message || 'Admin registered successfully'
      }
    } catch (error) {
      console.error('Error registering admin:', error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          return {
            success: false,
            message: error.response.data?.message || 'User already exists with this email'
          }
        } else if (error.response?.status === 403) {
          return {
            success: false,
            message: 'Only super admins can create new admins'
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to register admin'
      }
    }
  }

  /**
   * Get all rental requests (Admin view)
   * GET /admin/rental-requests
   */
  async getAllRentalRequests(params?: PaginationParams): Promise<{ 
    success: boolean; 
    requests?: RentalRequest[]; 
    total?: number;
    totalPages?: number;
    currentPage?: number;
    message?: string 
  }> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.status) queryParams.append('status', params.status)
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.search) queryParams.append('search', params.search)
      
      const url = `/admin/requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      const response = await authApi.get<ApiResponse<RentalRequest[]>>(url)
      console.log("response", response)
      
      return {
        success: true,
        requests: response.data.requests || response.data.data || [],
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error fetching all rental requests:', error)
      return {
        success: false,
        message: 'Failed to fetch rental requests',
        requests: []
      }
    }
  }

  /**
   * Process a rental request (Approve/Reject)
   * PUT /admin/process-request/:requestId
   */
  async processRentalRequest(
    requestId: string,
    payload: ProcessRentalRequestPayload
  ): Promise<{ success: boolean; request?: RentalRequest; message?: string }> {
    try {
      const response = await authApi.put<ApiResponse<RentalRequest>>(
        `/admin/process-request/${requestId}`,
        payload
      )
      
      return {
        success: true,
        request: response.data.request || response.data.data,
        message: response.data.message || `Request ${payload.status} successfully`
      }
    } catch (error) {
      console.error(`Error processing request ${requestId}:`, error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Rental request not found'
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to process rental request'
      }
    }
  }

  /**
   * Verify payment and activate lease
   * PUT /admin/verify-payment/:requestId
   */
  async verifyPaymentAndActivateLease(
    requestId: string,
    payload: VerifyPaymentPayload
  ): Promise<{ success: boolean; request?: RentalRequest; message?: string }> {
    try {
      const response = await authApi.put<ApiResponse<RentalRequest>>(
        `/admin/verify-payment/${requestId}`,
        payload
      )
      
      return {
        success: true,
        request: response.data.request || response.data.data,
        message: response.data.message || 'Payment verified and lease activated successfully'
      }
    } catch (error) {
      console.error(`Error verifying payment for ${requestId}:`, error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          return {
            success: false,
            message: error.response.data?.message || 'Only approved requests can have payments verified'
          }
        } else if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Rental request not found'
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to verify payment'
      }
    }
  }

  /**
   * Renew a lease (Admin manual renewal)
   * PATCH /admin/renew-lease/:requestId
   */
  async renewLease(
    requestId: string,
    payload: RenewLeasePayload
  ): Promise<{ success: boolean; request?: RentalRequest; message?: string }> {
    try {
      const response = await authApi.patch<ApiResponse<RentalRequest>>(
        `/admin/renew-lease/${requestId}`,
        payload
      )
      
      return {
        success: true,
        request: response.data.request || response.data.data,
        message: response.data.message || 'Lease renewed successfully'
      }
    } catch (error) {
      console.error(`Error renewing lease ${requestId}:`, error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          return {
            success: false,
            message: error.response.data?.message || 'Only active leases can be renewed'
          }
        } else if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Lease not found'
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to renew lease'
      }
    }
  }

  /**
   * Get all renewal requests (Admin view)
   * GET /admin/renewals
   */
  async getRenewalRequests(params?: PaginationParams): Promise<{
    success: boolean;
    renewals?: RentalRequest[];
    total?: number;
    totalPages?: number;
    currentPage?: number;
    message?: string
  }> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.search) queryParams.append('search', params.search)
      
      const url = `/admin/renewals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      const response = await authApi.get<ApiResponse<RentalRequest[]>>(url)
      
      return {
        success: true,
        renewals: response.data.renewals || response.data.data || [],
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error fetching renewal requests:', error)
      return {
        success: false,
        message: 'Failed to fetch renewal requests',
        renewals: []
      }
    }
  }

  /**
   * Process a renewal request (Approve/Reject)
   * POST /admin/renewals/:requestId/process
   */
  async processRenewal(
    requestId: string,
    payload: ProcessRenewalPayload
  ): Promise<{ success: boolean; request?: RentalRequest; message?: string }> {
    try {
      const response = await authApi.post<ApiResponse<RentalRequest>>(
        `/admin/renewals/${requestId}/process`,
        payload
      )
      
      return {
        success: true,
        request: response.data.request || response.data.data,
        message: response.data.message || `Renewal request ${payload.action}ed successfully`
      }
    } catch (error) {
      console.error(`Error processing renewal ${requestId}:`, error)
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          return {
            success: false,
            message: error.response.data?.message || 'Invalid renewal request'
          }
        } else if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Renewal request not found'
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to process renewal request'
      }
    }
  }

  /**
   * Get all active leases (Admin view)
   * GET /admin/active-leases
   */
  async getAllActiveLeases(params?: PaginationParams): Promise<{
    success: boolean;
    leases?: RentalRequest[];
    total?: number;
    totalPages?: number;
    currentPage?: number;
    message?: string
  }> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      
      const url = `/admin/active-leases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      const response = await authApi.get<ApiResponse<RentalRequest[]>>(url)
      
      return {
        success: true,
        leases: response.data.leases || response.data.data || [],
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error fetching active leases:', error)
      return {
        success: false,
        message: 'Failed to fetch active leases',
        leases: []
      }
    }
  }

  /**
   * Get expiring leases (Admin view)
   * GET /admin/expiring-leases
   */
  async getExpiringLeases(): Promise<{ success: boolean; leases?: RentalRequest[]; count?: number; message?: string }> {
    try {
      const response = await authApi.get<ApiResponse<RentalRequest[]>>('/admin/expiring-leases')
      
      return {
        success: true,
        leases: response.data.leases || response.data.data || [],
        count: response.data.count || 0,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error fetching expiring leases:', error)
      return {
        success: false,
        message: 'Failed to fetch expiring leases',
        leases: []
      }
    }
  }

  // ============ UTILITY FUNCTIONS ============

  /**
   * Get request statistics
   */
  async getRequestStats(): Promise<{
    success: boolean;
    stats?: {
      pending: number
      approved: number
      rejected: number
      cancelled: number
      activeLeases: number
      expiringLeases: number
      renewalRequests: number
    };
    message?: string
  }> {
    try {
      // Fetch all requests, active leases, expiring leases, and renewal requests
      const [allRequests, activeLeases, expiringLeases, renewalRequests] = await Promise.all([
        this.getAllRentalRequests({ limit: 1000 }),
        this.getAllActiveLeases({ limit: 1000 }),
        this.getExpiringLeases(),
        this.getRenewalRequests({ limit: 1000 })
      ])

      if (allRequests.success && allRequests.requests) {
        const requests = allRequests.requests
        const stats = {
          pending: requests.filter(r => r.status === 'pending').length,
          approved: requests.filter(r => r.status === 'approved').length,
          rejected: requests.filter(r => r.status === 'rejected').length,
          cancelled: requests.filter(r => r.status === 'cancelled').length,
          activeLeases: activeLeases.success ? activeLeases.leases?.length || 0 : 0,
          expiringLeases: expiringLeases.success ? expiringLeases.leases?.length || 0 : 0,
          renewalRequests: renewalRequests.success ? renewalRequests.renewals?.length || 0 : 0
        }
        
        return {
          success: true,
          stats
        }
      }
      
      return {
        success: false,
        message: 'Failed to fetch request statistics'
      }
    } catch (error) {
      console.error('Error fetching request stats:', error)
      return {
        success: false,
        message: 'Failed to fetch request statistics'
      }
    }
  }
}

export const rentalRequestService = new RentalRequestService()