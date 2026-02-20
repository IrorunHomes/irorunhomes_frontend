
import { Property } from './property'
import { User } from './auth'

export type RentalRequestStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled' 
  | 'completed' 
  | 'active_lease' 
  | 'expired_lease' 
  | 'renewal_pending'

export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'check'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue'
export type DocumentType = 'id_card' | 'employment_letter' | 'bank_statement' | 'reference_letter'

export interface LeaseInfo {
  startDate?: Date | string
  endDate?: Date | string
  monthlyRent?: number
  securityDeposit?: number
  totalAmount?: number
  terms?: string
  autoRenew?: boolean
  renewalOffered?: boolean
  renewalDeadline?: Date | string
  paymentStatus?: PaymentStatus
  specialConditions?: string[]
  signedAt?: Date | string
  terminatedAt?: Date | string
}

export interface PaymentDetails {
  amount?: number
  method?: PaymentMethod
  reference?: string
  receiptImage?: string
  receiptPublicId?: string
  paymentDate?: Date | string
  verified?: boolean
  verifiedBy?: string | User
  verifiedAt?: Date | string
}

export interface Document {
  type: DocumentType
  url: string
  public_id: string
  verified?: boolean
}

export interface RentalRequest {
  _id: string
  property: Property
  tenant: User
  status: RentalRequestStatus
  message: string
  requestedMoveInDate: Date | string
  duration: number
  leaseInfo?: LeaseInfo
  paymentDetails?: PaymentDetails
  documents?: Document[]
  assignedAdmin?: User
  adminNotes?: string
  adminResponse?: string
  createdAt: Date | string
  updatedAt: Date | string
  respondedAt?: Date | string
  expiresAt: Date | string
  
  // Virtuals
  isActiveLease?: boolean
  isExpiringSoon?: boolean
  success?: boolean
  metrics?: {
    isExpiringSoon?: number
    percentComplete?: number
    daysRemaining?: number
  }
}

export interface RentalRequestFormData {
  propertyId: string
  message: string
  requestedMoveInDate: string
  duration: number
}

export interface RentalRequestFilters {
  status?: RentalRequestStatus | 'all'
  property?: string
  tenant?: string
  startDate?: string
  endDate?: string
}

// API Response Types
export interface RentalRequestResponse {
  success: boolean
  message?: string
  request?: RentalRequest
  requests?: RentalRequest[]
  count?: number
}

export interface CancelRequestResult {
  success: boolean
  message?: string
  request?: RentalRequest
}


export interface SubmitRequestPayload {
  propertyId: string
  fullName?: string
  email?: string
  message: string
  requestedMoveInDate: string
  duration: number
}

export interface UploadPaymentReceiptPayload {
  amount?: number
  paymentMethod: PaymentMethod
  referenceNumber: string
  receiptImage?: File
}

export interface SetAutoRenewalPayload {
  autoRenew: boolean
}

export interface ProcessRentalRequestPayload {
  status: RentalRequestStatus
  adminNotes?: string
  adminResponse?: string
}

export interface VerifyPaymentPayload {
  verificationNotes?: string
}

export interface RenewLeasePayload {
  renewDuration?: number
  newMonthlyRent?: number
}

// NEW: Request renewal payload for tenants
export interface RequestRenewalPayload {
  message: string
  preferredDuration: number
}

// NEW: Process renewal payload for admin
export interface ProcessRenewalPayload {
  action: 'approve' | 'reject'
  newMonthlyRent?: number
  newDuration?: number
  adminNotes?: string
}

export interface RegisterAdminPayload {
  fullName: string
  email: string
  password: string
  role?: 'admin' | 'super_admin'
}

export interface PaginationParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

// ============ API RESPONSE TYPES ============

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  request?: RentalRequest
  requests?: RentalRequest[]
  lease?: RentalRequest
  leases?: RentalRequest[]
  renewals?: RentalRequest[] // NEW
  count?: number
  total?: number
  totalPages?: number
  currentPage?: number
}