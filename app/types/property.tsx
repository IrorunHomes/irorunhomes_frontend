
export type ApartmentType = 
  | 'a-room' 
  | 'self-contained' 
  | 'room-and-parlour' 
  | 'two-bedroom' 
  | 'three-bedroom' 
  | 'flat' 
  | 'others'

export type PropertyStatus = 'available' | 'rented' | 'maintenance' | 'pending'
export type PaymentSchedule = 'monthly' | 'quarterly' | 'yearly'

// Media Types
export interface MediaItem {
  url: string
  public_id: string
}

export interface PropertyMedia {
  images: MediaItem[]
  videos?: MediaItem[]
}

// Landlord Information (for nested structure in Property)
export interface LandlordPersonalInfo {
  fullName: string
  email?: string
  phone: string
  alternativePhone?: string
}

export interface ContactAddress {
  street?: string
  city?: string
  state?: string
  country?: string
}

export interface BankDetails {
  bankName: string
  accountNumber: string
  accountName: string
}

export interface EmergencyContact {
  name?: string
  relationship?: string
  phone?: string
  email?: string
}

export interface AdditionalInfo {
  occupation?: string
  nextOfKin?: string
  relationshipToKin?: string
  kinPhone?: string
  notes?: string
}

export interface LandlordVerification {
  verified: boolean
  verifiedBy?: string
  verifiedAt?: Date
}

export interface LandlordInfo {
  personalInfo: LandlordPersonalInfo
  contactAddress?: ContactAddress
  bankDetails: BankDetails
  emergencyContact?: EmergencyContact
  additionalInfo?: AdditionalInfo
  verification: LandlordVerification
}

// Features
export interface PropertyFeatures {
  bedrooms: number
  bathrooms: number
  parking?: boolean
  kitchen?: boolean
  toilet?: number
  amenities?: string[]
  extras?: string[]
}

// Management Info
export interface ManagementInfo {
  commissionRate?: number
  managementFee?: number
  paymentSchedule?: PaymentSchedule
  contractStartDate?: Date
  contractEndDate?: Date
}

// Main Property Interface (as stored in DB)
export interface Property {
  _id: string
  title: string
  description: string
  price: number
  address: string
  city: string
  state: string
  country?: string
  apartmentType: ApartmentType
  unitNumber?: string
  apartmentCount?: number
  features: PropertyFeatures
  media: PropertyMedia
  status: PropertyStatus
  admin: string
  pendingRequests: string[]
  approvedRequests: string[]
  landlordInfo: LandlordInfo
  views: number
  isActive: boolean
  listedDate: Date
  listedBy: string
  rentedBy?: string
  currentTenant?: string
  rentStartDate?: Date
  rentEndDate?: Date
  managementInfo?: ManagementInfo
  createdAt: Date
  updatedAt: Date
}

// FLAT PROPERTY DATA TYPE for API requests (what your backend expects)
export interface PropertyFlatData {
  // Basic Property Info
  title: string
  description: string
  price: number
  address: string
  city: string
  state: string
  country?: string
  apartmentType: ApartmentType
  unitNumber?: string
  apartmentCount?: number
  
  // Features (FLAT fields - backend converts to nested)
  bedrooms: number
  bathrooms: number
  parking: boolean
  kitchen: boolean
  toilet: number
  amenities: string // comma-separated string
  extras: string // comma-separated string
  
  // Landlord/House Owner Information (FLAT fields)
  landlordFullName: string
  landlordEmail?: string
  landlordPhone: string
  landlordAlternativePhone?: string
  
  // Landlord Contact Address (FLAT fields)
  landlordStreet?: string
  landlordCity?: string
  landlordState?: string
  landlordCountry?: string
  
  // Landlord Bank Details (FLAT fields)
  bankName: string
  accountNumber: string
  accountName: string
  
  // Emergency Contact (FLAT fields)
  emergencyContactName?: string
  emergencyContactRelationship?: string
  emergencyContactPhone?: string
  emergencyContactEmail?: string
  
  // Additional Landlord Info (FLAT fields)
  landlordOccupation?: string
  nextOfKin?: string
  relationshipToKin?: string
  kinPhone?: string
  landlordNotes?: string
  
  // Management Info (FLAT fields)
  commissionRate?: number
  managementFee?: number
  paymentSchedule?: PaymentSchedule | string
  contractStartDate?: string | Date
  contractEndDate?: string | Date
}

// Property Card Props (for UI)
export interface PropertyCardProps {
  property: Property
  isFeatured?: boolean
  showLandlordInfo?: boolean
  showAdminInfo?: boolean
  onFavoriteClick?: () => void
  onCardClick?: () => void
}

// API Response Types
export interface PropertyResponse {
  success: boolean
  data: Property | Property[]
  message?: string
}

export interface PropertyListParams {
  page?: number
  limit?: number
  city?: string
  state?: string
  minPrice?: number
  maxPrice?: number
  apartmentType?: ApartmentType
  bedrooms?: number
  bathrooms?: number
  status?: PropertyStatus
  sortBy?: 'price' | 'listedDate' | 'views'
  sortOrder?: 'asc' | 'desc'
}

// Form Types for Create/Update (nested version - for forms with nested structure)
export interface PropertyFormData {
  title: string
  description: string
  price: number
  address: string
  city: string
  state: string
  country?: string
  apartmentType: ApartmentType
  unitNumber?: string
  apartmentCount?: number
  features: {
    bedrooms: number
    bathrooms: number
    parking?: boolean
    kitchen?: boolean
    toilet?: number
    amenities?: string[]
    extras?: string[]
  }
  landlordInfo: {
    personalInfo?: {
      fullName: string
      email?: string
      phone: string
      alternativePhone?: string
    }
    contactAddress?: ContactAddress
    bankDetails: BankDetails
    emergencyContact?: EmergencyContact
    additionalInfo?: AdditionalInfo
  }
  managementInfo?: {
    commissionRate?: number
    managementFee?: number
    paymentSchedule?: PaymentSchedule
    contractStartDate?: Date
    contractEndDate?: Date
  }
}

// Context function types
export interface CreatePropertyParams {
  propertyData: PropertyFlatData
  imageFiles?: File[]
  videoFiles?: File[]
}

export interface UpdatePropertyParams {
  propertyId: string
  propertyData: Partial<PropertyFlatData>
  imageFiles?: File[]
  videoFiles?: File[]
}