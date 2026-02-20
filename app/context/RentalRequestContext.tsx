// context/RentalRequestContext.tsx
'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { rentalRequestService } from '../api/rentalRequestService'
import { RentalRequest, RentalRequestStatus, PaymentMethod } from '../types/rentalRequest'
import { useUser } from './UserContext'
import { User } from '../types/auth'
import { useMessage } from '../components/ui/MessagePopup'

// ============ INTERFACES ============

interface SubmitRequestPayload {
  propertyId: string
  fullName?: string
  email?: string
  message: string
  requestedMoveInDate: string
  duration: number
}

interface UploadPaymentReceiptPayload {
  amount?: number
  paymentMethod: PaymentMethod
  referenceNumber: string
  receiptImage?: File
}

interface SetAutoRenewalPayload {
  autoRenew: boolean
}

interface ProcessRentalRequestPayload {
  status: RentalRequestStatus
  adminNotes?: string
  adminResponse?: string
}

interface VerifyPaymentPayload {
  verificationNotes?: string
}

interface RenewLeasePayload {
  renewDuration?: number
  newMonthlyRent?: number
}

// NEW: Renewal request payload for tenants
interface RequestRenewalPayload {
  message: string
  preferredDuration: number
}

// NEW: Process renewal payload for admin
interface ProcessRenewalPayload {
  action: 'approve' | 'reject'
  newMonthlyRent?: number
  newDuration?: number
  adminNotes?: string
}

interface RegisterAdminPayload {
  fullName: string
  email: string
  password: string
  role?: 'admin' | 'super_admin'
}

interface PaginationParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

interface RequestStats {
  pending: number
  approved: number
  rejected: number
  cancelled: number
  activeLeases: number
  expiringLeases: number
  renewalRequests: number
}

interface RentalRequestContextType {
  // State
  myRequests: RentalRequest[]
  allRequests: RentalRequest[]
  activeLeases: RentalRequest[]
  expiringLeases: RentalRequest[]
  renewalRequests: RentalRequest[] // NEW
  currentRequest: RentalRequest | null
  currentLease: RentalRequest | null
  stats: RequestStats | null
  
  // Loading states
  loadingRequests: boolean
  loadingSubmit: boolean
  loadingAllRequests: boolean
  loadingLeases: boolean
  loadingStats: boolean
  loadingAction: boolean
  loadingRenewals: boolean // NEW
  
  // Error
  error: string | null
  
  // ============ TENANT FUNCTIONS ============
  submitRequest: (payload: SubmitRequestPayload) => Promise<{ success: boolean; request?: RentalRequest; message?: string }>
  fetchMyRequests: () => Promise<void>
  getRequest: (requestId: string) => Promise<RentalRequest | undefined>
  cancelRequest: (requestId: string) => Promise<{ success: boolean; message?: string }>
  uploadPaymentReceipt: (
    requestId: string, 
    payload: UploadPaymentReceiptPayload
  ) => Promise<{ success: boolean; request?: RentalRequest; message?: string }>
  fetchTenantLease: () => Promise<void>
  getTenantLeaseById: (leaseId: string) => Promise<RentalRequest | undefined> // NEW
  setAutoRenewal: (
    requestId: string, 
    payload: SetAutoRenewalPayload
  ) => Promise<{ success: boolean; request?: RentalRequest; message?: string }>
  requestRenewal: ( // NEW
    leaseId: string,
    payload: RequestRenewalPayload
  ) => Promise<{ success: boolean; request?: RentalRequest; message?: string }>
  
  // ============ ADMIN FUNCTIONS ============
  registerAdmin: (payload: RegisterAdminPayload) => Promise<{ success: boolean; user?: User; message?: string }>
  fetchAllRequests: (params?: PaginationParams) => Promise<void>
  processRequest: (
    requestId: string, 
    payload: ProcessRentalRequestPayload
  ) => Promise<{ success: boolean; request?: RentalRequest; message?: string }>
  verifyPaymentAndActivateLease: (
    requestId: string, 
    payload?: VerifyPaymentPayload
  ) => Promise<{ success: boolean; request?: RentalRequest; message?: string }>
  renewLease: (
    requestId: string, 
    payload: RenewLeasePayload
  ) => Promise<{ success: boolean; request?: RentalRequest; message?: string }>
  fetchActiveLeases: (params?: PaginationParams) => Promise<void>
  fetchExpiringLeases: () => Promise<void>
  fetchRenewalRequests: (params?: PaginationParams) => Promise<void> // NEW
  processRenewal: ( // NEW
    requestId: string,
    payload: ProcessRenewalPayload
  ) => Promise<{ success: boolean; request?: RentalRequest; message?: string }>
  fetchRequestStats: () => Promise<void>
  
  // Utility
  clearError: () => void
  clearCurrentRequest: () => void
  clearCurrentLease: () => void
}

const RentalRequestContext = createContext<RentalRequestContextType | undefined>(undefined)

// ============ PROVIDER ============

export function RentalRequestProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  
  // State
  const [myRequests, setMyRequests] = useState<RentalRequest[]>([])
  const [allRequests, setAllRequests] = useState<RentalRequest[]>([])
  const [activeLeases, setActiveLeases] = useState<RentalRequest[]>([])
  const [expiringLeases, setExpiringLeases] = useState<RentalRequest[]>([])
  const [renewalRequests, setRenewalRequests] = useState<RentalRequest[]>([]) // NEW
  const [currentRequest, setCurrentRequest] = useState<RentalRequest | null>(null)
  const [currentLease, setCurrentLease] = useState<RentalRequest | null>(null)
  const [stats, setStats] = useState<RequestStats | null>(null)
  
  // Loading states
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [loadingAllRequests, setLoadingAllRequests] = useState(false)
  const [loadingLeases, setLoadingLeases] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [loadingRenewals, setLoadingRenewals] = useState(false) // NEW
  const { showSuccess } = useMessage()
  // Error
  const [error, setError] = useState<string | null>(null)

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Fetch tenant's requests when user logs in
  useEffect(() => {
    if (user && !isAdmin) {
      fetchMyRequests()
      fetchTenantLease()
    }
  }, [user])

  // ============ TENANT FUNCTIONS ============

  /**
   * Submit a new rental request
   */
  const submitRequest = useCallback(async (payload: SubmitRequestPayload) => {
    if (!user) {
      setError('You must be logged in to submit a rental request')
      return { success: false, message: 'You must be logged in' }
    }

    setLoadingSubmit(true)
    setError(null)

    try {
      const result = await rentalRequestService.submitRequest(payload)
      
      if (result.success && result.request) {
        // Add to local state
        setMyRequests(prev => [result.request!, ...prev])
        showSuccess('Rental request submitted successfully')
        return result
      } else {
        setError(result.message || 'Failed to submit request')
        showSuccess(result.message || 'Failed to submit request')
        return result
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit request'
      setError(message)
      return { success: false, message }
    } finally {
      setLoadingSubmit(false)
    }
  }, [user])

  /**
   * Fetch all requests for the current tenant
   */
  const fetchMyRequests = useCallback(async () => {
    if (!user) {
      setMyRequests([])
      return
    }

    setLoadingRequests(true)
    setError(null)

    try {
      const result = await rentalRequestService.getMyRequests()
      
      if (result.success && result.requests) {
        setMyRequests(result.requests)
      } else {
        setError(result.message || 'Failed to fetch requests')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch requests'
      setError(message)
    } finally {
      setLoadingRequests(false)
    }
  }, [user])

  /**
   * Get a specific rental request by ID
   */
  const getRequest = useCallback(async (requestId: string) => {
    setLoadingRequests(true)
    setError(null)
    
    try {
      const result = await rentalRequestService.getRequest(requestId)
      if (result.success && result.request) {
        setCurrentRequest(result.request)
        return result.request
      } else {
        setError(result.message || 'Failed to fetch request')
        return undefined
      }
    } catch (err) {
      console.error('Error fetching request:', err)
      setError('Failed to fetch rental request')
      return undefined
    } finally {
      setLoadingRequests(false)
    }
  }, [])

  /**
   * Cancel a rental request
   */
  const cancelRequest = useCallback(async (requestId: string) => {
    if (!user) {
      setError('You must be logged in to cancel a request')
      return { success: false, message: 'You must be logged in' }
    }

    setLoadingAction(true)
    setError(null)

    try {
      const result = await rentalRequestService.cancelRequest(requestId)
      
      if (result.success) {
        // Update local state
        setMyRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: 'cancelled' as RentalRequestStatus }
              : req
          )
        )
        showSuccess('Rental request cancelled successfully')
        
        // Update current request if it's the one being cancelled
        if (currentRequest?._id === requestId) {
          setCurrentRequest(prev => prev ? { ...prev, status: 'cancelled' as RentalRequestStatus } : null)
        }
      }
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel request'
      setError(message)
      return { success: false, message }
    } finally {
      setLoadingAction(false)
    }
  }, [user, currentRequest])

  /**
   * Upload payment receipt for approved request
   */
  const uploadPaymentReceipt = useCallback(async (
    requestId: string,
    payload: UploadPaymentReceiptPayload
  ) => {
    if (!user) {
      setError('You must be logged in to upload payment receipt')
      return { success: false, message: 'You must be logged in' }
    }

    setLoadingAction(true)
    setError(null)

    try {
      const result = await rentalRequestService.uploadPaymentReceipt(requestId, payload)
      
      if (result.success && result.request) {
        // Update local state
        setMyRequests(prev => 
          prev.map(req => 
            req._id === requestId ? result.request! : req
          )
        )
        showSuccess('Payment receipt uploaded successfully')
        
        // Update current request
        if (currentRequest?._id === requestId) {
          setCurrentRequest(result.request)
        }
      }
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload payment receipt'
      setError(message)
      return { success: false, message }
    } finally {
      setLoadingAction(false)
    }
  }, [user, currentRequest])

  /**
   * Fetch tenant's active lease
   */
  const fetchTenantLease = useCallback(async () => {
    if (!user) {
      setCurrentLease(null)
      return
    }

    setLoadingLeases(true)
    setError(null)

    try {
      const result = await rentalRequestService.getTenantLease()
      
      if (result.success && result.lease) {
        setCurrentLease(result.lease)
      } else {
        setCurrentLease(null)
      }
    } catch (err) {
      console.error('Error fetching tenant lease:', err)
      setCurrentLease(null)
    } finally {
      setLoadingLeases(false)
    }
  }, [user])

  /**
   * Get tenant lease by ID
   */
  const getTenantLeaseById = useCallback(async (requestId: string) => {
    setLoadingLeases(true)
    setError(null)

    try {
      const result = await rentalRequestService.getTenantLeaseById(requestId)
      if (result.success && result.data) {
        return result.data
      }
      return undefined
    } catch (err) {
      console.error('Error fetching tenant lease:', err)
      return undefined
    } finally {
      setLoadingLeases(false)
    }
  }, [])

  /**
   * Set auto-renewal preference for lease
   */
  const setAutoRenewal = useCallback(async (
    requestId: string,
    payload: SetAutoRenewalPayload
  ) => {
    if (!user) {
      setError('You must be logged in to set auto-renewal')
      return { success: false, message: 'You must be logged in' }
    }

    setLoadingAction(true)
    setError(null)

    try {
      const result = await rentalRequestService.setAutoRenewal(requestId, payload)
      
      if (result.success && result.request) {
        showSuccess(`Auto-renewal ${payload.autoRenew ? 'enabled' : 'disabled'} successfully`)
        // Update current lease
        if (currentLease?._id === requestId) {
          setCurrentLease(result.request)
        }
        
        // Update in active leases if present
        setActiveLeases(prev => 
          prev.map(lease => 
            lease._id === requestId ? result.request! : lease
          )
        )
      }
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set auto-renewal'
      setError(message)
      return { success: false, message }
    } finally {
      setLoadingAction(false)
    }
  }, [user, currentLease])

  /**
   * Request lease renewal (Tenant)
   */
  const requestRenewal = useCallback(async (
    leaseId: string,
    payload: RequestRenewalPayload
  ) => {
    if (!user) {
      setError('You must be logged in to request renewal')
      return { success: false, message: 'You must be logged in' }
    }

    setLoadingAction(true)
    setError(null)

    try {
      const result = await rentalRequestService.requestRenewal(leaseId, payload)
      
      if (result.success && result.request) {

        showSuccess('Lease renewal requested successfully')
        // Update current lease status
        if (currentLease?._id === leaseId) {
          setCurrentLease(prev => prev ? { ...prev, status: 'renewal_pending' as RentalRequestStatus } : null)
        }
      }
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request renewal'
      setError(message)
      return { success: false, message }
    } finally {
      setLoadingAction(false)
    }
  }, [user, currentLease])

  // ============ ADMIN FUNCTIONS ============

  /**
   * Register a new admin (Super Admin only)
   */
  const registerAdmin = useCallback(async (payload: RegisterAdminPayload) => {
    if (!user || user.role !== 'super_admin') {
      setError('Only super admins can register new admins')
      return { success: false, message: 'Unauthorized' }
    }

    setLoadingAction(true)
    setError(null)

    try {
      const result = await rentalRequestService.registerAdmin(payload)
      if (result.success && result.user) {
        showSuccess('Admin registered successfully')
      } else {
        setError(result.message || 'Failed to register admin')
        showSuccess(result.message || 'Failed to register admin')
      }
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register admin'
      setError(message)
      return { success: false, message }
    } finally {
      setLoadingAction(false)
    }
  }, [user])

  /**
   * Fetch all rental requests (Admin view)
   */
  const fetchAllRequests = useCallback(async (params?: PaginationParams) => {
    if (!user || !isAdmin) {
      setAllRequests([])
      return
    }

    setLoadingAllRequests(true)
    setError(null)

    try {
      const result = await rentalRequestService.getAllRentalRequests(params)
      
      if (result.success && result.requests) {
        setAllRequests(result.requests)
      } else {
        setError(result.message || 'Failed to fetch requests')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch requests'
      setError(message)
    } finally {
      setLoadingAllRequests(false)
    }
  }, [user, isAdmin])

  /**
   * Process a rental request (Approve/Reject)
   */
  const processRequest = useCallback(async (
    requestId: string,
    payload: ProcessRentalRequestPayload
  ) => {
    if (!user || !isAdmin) {
      setError('You do not have permission to process requests')
      return { success: false, message: 'Unauthorized' }
    }

    setLoadingAction(true)
    setError(null)

    try {
      const result = await rentalRequestService.processRentalRequest(requestId, payload)
      
      if (result.success && result.request) {
        // Update in all requests list
        setAllRequests(prev => 
          prev.map(req => 
            req._id === requestId ? result.request! : req
          )
        )
        showSuccess('Rental request processed successfully')
        
        // Update in my requests if it's the tenant's request
        setMyRequests(prev => 
          prev.map(req => 
            req._id === requestId ? result.request! : req
          )
        )
        
        // Update current request
        if (currentRequest?._id === requestId) {
          setCurrentRequest(result.request)
        }
      } else {
        setError(result.message || 'Failed to process request')
        showSuccess(result.message || 'Failed to process request')
      }
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process request'
      setError(message)
      return { success: false, message }
    } finally {
      setLoadingAction(false)
    }
  }, [user, isAdmin, currentRequest])

  /**
   * Verify payment and activate lease
   */
  const verifyPaymentAndActivateLease = useCallback(async (
    requestId: string,
    payload?: VerifyPaymentPayload
  ) => {
    if (!user || !isAdmin) {
      setError('You do not have permission to verify payments')
      return { success: false, message: 'Unauthorized' }
    }

    setLoadingAction(true)
    setError(null)

    try {
      const result = await rentalRequestService.verifyPaymentAndActivateLease(requestId, payload || {})
      
      if (result.success && result.request) {
        // Update in all requests
        setAllRequests(prev => 
          prev.map(req => 
            req._id === requestId ? result.request! : req
          )
        )

        showSuccess('Payment verified and lease activated successfully')
        
        // Update in my requests
        setMyRequests(prev => 
          prev.map(req => 
            req._id === requestId ? result.request! : req
          )
        )
        
        // Update current request
        if (currentRequest?._id === requestId) {
          setCurrentRequest(result.request)
        }
        
        // Refresh stats
        fetchRequestStats()
      } else {
        setError(result.message || 'Failed to verify payment')
        showSuccess(result.message || 'Failed to verify payment')
      }
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify payment'
      setError(message)
      return { success: false, message }
    } finally {
      setLoadingAction(false)
    }
  }, [user, isAdmin, currentRequest])

  /**
   * Renew a lease (Admin manual renewal)
   */
  const renewLease = useCallback(async (
    requestId: string,
    payload: RenewLeasePayload
  ) => {
    if (!user || !isAdmin) {
      setError('You do not have permission to renew leases')
      return { success: false, message: 'Unauthorized' }
    }

    setLoadingAction(true)
    setError(null)

    try {
      const result = await rentalRequestService.renewLease(requestId, payload)
      
      if (result.success && result.request) {
        // Update in active leases
        setActiveLeases(prev => 
          prev.map(lease => 
            lease._id === requestId ? result.request! : lease
          )
        )
        showSuccess('Lease renewed successfully')
        // Update in all requests
        setAllRequests(prev => 
          prev.map(req => 
            req._id === requestId ? result.request! : req
          )
        )
        
        // Update current lease
        if (currentLease?._id === requestId) {
          setCurrentLease(result.request)
        }
        
        // Refresh stats
        fetchRequestStats()
      } else {
        setError(result.message || 'Failed to renew lease')
        showSuccess(result.message || 'Failed to renew lease')
      }
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to renew lease'
      setError(message)
      return { success: false, message }
    } finally {
      setLoadingAction(false)
    }
  }, [user, isAdmin, currentLease])

  /**
   * Fetch all active leases (Admin view)
   */
  const fetchActiveLeases = useCallback(async (params?: PaginationParams) => {
    if (!user || !isAdmin) {
      setActiveLeases([])
      return
    }

    setLoadingLeases(true)
    setError(null)

    try {
      const result = await rentalRequestService.getAllActiveLeases(params)
      
      if (result.success && result.leases) {
        setActiveLeases(result.leases)
      } else {
        setError(result.message || 'Failed to fetch active leases')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch active leases'
      setError(message)
    } finally {
      setLoadingLeases(false)
    }
  }, [user, isAdmin])

  /**
   * Fetch expiring leases (Admin view)
   */
  const fetchExpiringLeases = useCallback(async () => {
    if (!user || !isAdmin) {
      setExpiringLeases([])
      return
    }

    setLoadingLeases(true)
    setError(null)

    try {
      const result = await rentalRequestService.getExpiringLeases()
      
      if (result.success && result.leases) {
        setExpiringLeases(result.leases)
      } else {
        setError(result.message || 'Failed to fetch expiring leases')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch expiring leases'
      setError(message)
    } finally {
      setLoadingLeases(false)
    }
  }, [user, isAdmin])

  /**
   * Fetch renewal requests (Admin view)
   */
  const fetchRenewalRequests = useCallback(async (params?: PaginationParams) => {
    if (!user || !isAdmin) {
      setRenewalRequests([])
      return
    }

    setLoadingRenewals(true)
    setError(null)

    try {
      const result = await rentalRequestService.getRenewalRequests(params)
      
      if (result.success && result.renewals) {
        setRenewalRequests(result.renewals)
      } else {
        setError(result.message || 'Failed to fetch renewal requests')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch renewal requests'
      setError(message)
    } finally {
      setLoadingRenewals(false)
    }
  }, [user, isAdmin])

  /**
   * Process a renewal request (Approve/Reject)
   */
  const processRenewal = useCallback(async (
    requestId: string,
    payload: ProcessRenewalPayload
  ) => {
    if (!user || !isAdmin) {
      setError('You do not have permission to process renewals')
      return { success: false, message: 'Unauthorized' }
    }

    setLoadingAction(true)
    setError(null)

    try {
      const result = await rentalRequestService.processRenewal(requestId, payload)
      
      if (result.success && result.request) {
        // Remove from renewal requests
        setRenewalRequests(prev => prev.filter(r => r._id !== requestId))
        showSuccess(`Renewal request ${payload.action === 'approve' ? 'approved' : 'rejected'} successfully`)
        
        // Update in active leases if it was approved
        if (payload.action === 'approve' && result.request) {
          setActiveLeases(prev => 
            prev.map(lease => 
              lease._id === requestId ? result.request! : lease
            )
          )
        }
        
        // Refresh stats
        fetchRequestStats()
      }
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process renewal'
      setError(message)
      return { success: false, message }
    } finally {
      setLoadingAction(false)
    }
  }, [user, isAdmin])

  /**
   * Fetch request statistics
   */
  const fetchRequestStats = useCallback(async () => {
    if (!user || !isAdmin) {
      setStats(null)
      return
    }

    setLoadingStats(true)
    setError(null)

    try {
      const result = await rentalRequestService.getRequestStats()
      
      if (result.success && result.stats) {
        setStats(result.stats)
      } else {
        setError(result.message || 'Failed to fetch stats')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats'
      setError(message)
    } finally {
      setLoadingStats(false)
    }
  }, [user, isAdmin])

  // ============ UTILITY FUNCTIONS ============

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearCurrentRequest = useCallback(() => {
    setCurrentRequest(null)
  }, [])

  const clearCurrentLease = useCallback(() => {
    setCurrentLease(null)
  }, [])

  const value: RentalRequestContextType = {
    // State
    myRequests,
    allRequests,
    activeLeases,
    expiringLeases,
    renewalRequests,
    currentRequest,
    currentLease,
    stats,
    
    // Loading states
    loadingRequests,
    loadingSubmit,
    loadingAllRequests,
    loadingLeases,
    loadingStats,
    loadingAction,
    loadingRenewals,
    
    // Error
    error,
    
    // Tenant functions
    submitRequest,
    fetchMyRequests,
    getRequest,
    cancelRequest,
    uploadPaymentReceipt,
    fetchTenantLease,
    getTenantLeaseById,
    setAutoRenewal,
    requestRenewal,
    
    // Admin functions
    registerAdmin,
    fetchAllRequests,
    processRequest,
    verifyPaymentAndActivateLease,
    renewLease,
    fetchActiveLeases,
    fetchExpiringLeases,
    fetchRenewalRequests,
    processRenewal,
    fetchRequestStats,
    
    // Utility
    clearError,
    clearCurrentRequest,
    clearCurrentLease,
  }

  return (
    <RentalRequestContext.Provider value={value}>
      {children}
    </RentalRequestContext.Provider>
  )
}

// ============ HOOK ============

export function useRentalRequest() {
  const context = useContext(RentalRequestContext)
  
  if (context === undefined) {
    throw new Error('useRentalRequest must be used within a RentalRequestProvider')
  }
  
  return context
}

// ============ ADMIN HOOK ============

export function useAdminRentalRequest() {
  const context = useContext(RentalRequestContext)
  const { user } = useUser()
  
  if (context === undefined) {
    throw new Error('useAdminRentalRequest must be used within a RentalRequestProvider')
  }
  
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  
  if (!isAdmin) {
    throw new Error('useAdminRentalRequest can only be used by admin users')
  }
  
  return {
    ...context,
    // Admin-specific convenience methods
    fetchPendingRequests: () => context.fetchAllRequests({ status: 'pending' }),
    fetchApprovedRequests: () => context.fetchAllRequests({ status: 'approved' }),
    fetchActiveLeases: context.fetchActiveLeases,
    fetchExpiringLeases: context.fetchExpiringLeases,
    fetchRenewalRequests: context.fetchRenewalRequests,
    processRequest: context.processRequest,
    processRenewal: context.processRenewal,
    verifyPayment: context.verifyPaymentAndActivateLease,
    renewLease: context.renewLease,
    registerAdmin: context.registerAdmin,
    stats: context.stats,
    fetchRequestStats: context.fetchRequestStats,
    loading: context.loadingAllRequests || context.loadingLeases || context.loadingStats || context.loadingRenewals,
  }
}

// ============ TENANT HOOK ============

export function useTenantRentalRequest() {
  const context = useContext(RentalRequestContext)
  const { user } = useUser()
  
  if (context === undefined) {
    throw new Error('useTenantRentalRequest must be used within a RentalRequestProvider')
  }
  
  if (!user) {
    throw new Error('useTenantRentalRequest can only be used by authenticated users')
  }
  
  return {
    ...context,
    // Tenant-specific convenience methods
    myRequests: context.myRequests,
    currentLease: context.currentLease,
    submitRequest: context.submitRequest,
    cancelRequest: context.cancelRequest,
    uploadPaymentReceipt: context.uploadPaymentReceipt,
    setAutoRenewal: context.setAutoRenewal,
    requestRenewal: context.requestRenewal,
    fetchMyRequests: context.fetchMyRequests,
    fetchTenantLease: context.fetchTenantLease,
    getTenantLeaseById: context.getTenantLeaseById,
    getRequest: context.getRequest,
    loading: context.loadingRequests || context.loadingSubmit || context.loadingAction,
  }
}