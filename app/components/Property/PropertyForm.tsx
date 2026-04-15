'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useProperty } from '../../context/PropertyContext'
import {
  CameraIcon,
  VideoCameraIcon,
  XMarkIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { ApartmentType } from '../../types/property'

interface PropertyFormProps {
  propertyId?: string // For editing existing property
}

interface DraftData {
  // Step 1
  title?: string
  description?: string
  price?: number
  address?: string
  city?: string
  state?: string
  country?: string
  apartmentType?: ApartmentType
  unitNumber?: string
  apartmentCount?: number
  // Step 2
  bedrooms?: number
  bathrooms?: number
  toilet?: number
  parking?: boolean
  kitchen?: boolean
  amenities?: string[]
  extras?: string[]
  // Step 3
  images?: File[]
  imagePreviews?: string[]
  video?: File | null
  videoPreview?: string | null
  // Step 4
  landlordFullName?: string
  landlordEmail?: string
  landlordPhone?: string
  landlordAlternativePhone?: string
  landlordOccupation?: string
  landlordNotes?: string
  // Step 5
  landlordStreet?: string
  landlordCity?: string
  landlordState?: string
  landlordCountry?: string
  // Step 6
  bankName?: string
  accountNumber?: string
  accountName?: string
  // Step 7
  emergencyContactName?: string
  emergencyContactRelationship?: string
  emergencyContactPhone?: string
  emergencyContactEmail?: string
  // Step 8
  nextOfKin?: string
  relationshipToKin?: string
  kinPhone?: string
  // Step 9
  commissionRate?: number
  managementFee?: number
  paymentSchedule?: string
  contractStartDate?: string
  contractEndDate?: string
}

const DRAFT_KEY = 'property_draft_data'
const DRAFT_IMAGES_KEY = 'property_draft_images'
const DRAFT_TIMESTAMP_KEY = 'property_draft_timestamp'

export default function PropertyForm({ propertyId }: PropertyFormProps) {
  const router = useRouter()
  const { listNewProperty, updateProperty, loadingListNew, loadingUpdate } = useProperty()
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showDraftAlert, setShowDraftAlert] = useState(false)

  // Form data state
  const [formData, setFormData] = useState<DraftData>({
    // Step 1: Basic Information
    title: '',
    description: '',
    price: 0,
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    apartmentType: undefined,
    unitNumber: '',
    apartmentCount: 1,

    // Step 2: Features
    bedrooms: 0,
    bathrooms: 0,
    toilet: 0,
    parking: false,
    kitchen: false,
    amenities: [],
    extras: [],

    // Step 3: Media
    images: [],
    imagePreviews: [],
    video: null,
    videoPreview: null,

    // Step 4: Landlord Information
    landlordFullName: '',
    landlordEmail: '',
    landlordPhone: '',
    landlordAlternativePhone: '',
    landlordOccupation: '',
    landlordNotes: '',

    // Step 5: Contact Address
    landlordStreet: '',
    landlordCity: '',
    landlordState: '',
    landlordCountry: '',

    // Step 6: Bank Details
    bankName: '',
    accountNumber: '',
    accountName: '',

    // Step 7: Emergency Contact
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    emergencyContactEmail: '',

    // Step 8: Additional Information
    nextOfKin: '',
    relationshipToKin: '',
    kinPhone: '',

    // Step 9: Management Info
    commissionRate: 10,
    managementFee: 0,
    paymentSchedule: 'monthly',
    contractStartDate: '',
    contractEndDate: ''
  })

  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Step definitions
  const steps = [
    { id: 1, title: 'Basic Information', icon: DocumentTextIcon },
    { id: 2, title: 'Features', icon: BuildingOfficeIcon },
    { id: 3, title: 'Media Upload', icon: CameraIcon },
    { id: 4, title: 'Landlord Info', icon: UserCircleIcon },
    { id: 5, title: 'Contact Address', icon: BuildingOfficeIcon },
    { id: 6, title: 'Bank Details', icon: BanknotesIcon },
    { id: 7, title: 'Emergency Contact', icon: UserCircleIcon },
    { id: 8, title: 'Additional Info', icon: DocumentTextIcon },
    { id: 9, title: 'Management', icon: Cog6ToothIcon },
    { id: 10, title: 'Review & Submit', icon: CloudArrowUpIcon },
  ]

  // Load draft data on mount
  useEffect(() => {
    loadDraftData()
    
    // Show alert if draft exists
    const hasDraft = localStorage.getItem(DRAFT_KEY)
    if (hasDraft) {
      setShowDraftAlert(true)
      setTimeout(() => setShowDraftAlert(false), 5000)
    }
    
    // Auto-save on component unmount
    return () => {
      saveDraft()
    }
  }, [])

  // Auto-save when form data changes
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft()
    }, 2000) // Save 2 seconds after last change
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData])

  // Load draft data from localStorage
  const loadDraftData = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY)
      const savedImages = localStorage.getItem(DRAFT_IMAGES_KEY)
      const savedTimestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY)
      
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft)
        setFormData(prev => ({
          ...prev,
          ...draftData
        }))
        
        if (savedTimestamp) {
          const date = new Date(savedTimestamp)
          setLastSaved(date.toLocaleTimeString())
        }
      }
      
      if (savedImages) {
        const imageData = JSON.parse(savedImages)
        setFormData(prev => ({
          ...prev,
          imagePreviews: imageData.imagePreviews || []
        }))
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
  }

  // Save draft to localStorage
  const saveDraft = () => {
    try {
      setIsSaving(true)
      
      // Save form data (excluding files)
      const { images, imagePreviews, video, videoPreview, ...draftData } = formData
      
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
      localStorage.setItem(DRAFT_IMAGES_KEY, JSON.stringify({ imagePreviews }))
      
      const timestamp = new Date().toISOString()
      localStorage.setItem(DRAFT_TIMESTAMP_KEY, timestamp)
      setLastSaved(new Date(timestamp).toLocaleTimeString())
      
      setTimeout(() => setIsSaving(false), 500)
    } catch (error) {
      console.error('Error saving draft:', error)
      setIsSaving(false)
    }
  }

  // Clear draft data
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    localStorage.removeItem(DRAFT_IMAGES_KEY)
    localStorage.removeItem(DRAFT_TIMESTAMP_KEY)
    setLastSaved(null)
    setFormData({
      title: '',
      description: '',
      price: 0,
      address: '',
      city: '',
      state: '',
      country: 'Nigeria',
      apartmentType: undefined,
      unitNumber: '',
      apartmentCount: 1,
      bedrooms: 0,
      bathrooms: 0,
      toilet: 0,
      parking: false,
      kitchen: false,
      amenities: [],
      extras: [],
      images: [],
      imagePreviews: [],
      video: null,
      videoPreview: null,
      landlordFullName: '',
      landlordEmail: '',
      landlordPhone: '',
      landlordAlternativePhone: '',
      landlordOccupation: '',
      landlordNotes: '',
      landlordStreet: '',
      landlordCity: '',
      landlordState: '',
      landlordCountry: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      emergencyContactEmail: '',
      nextOfKin: '',
      relationshipToKin: '',
      kinPhone: '',
      commissionRate: 10,
      managementFee: 0,
      paymentSchedule: 'monthly',
      contractStartDate: '',
      contractEndDate: ''
    })
  }

  // Handle input changes with auto-save
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      
      if (name === 'amenities') {
        const amenityValue = (e.target as HTMLInputElement).value
        setFormData(prev => ({
          ...prev,
          amenities: checked
            ? [...(prev.amenities || []), amenityValue]
            : (prev.amenities || []).filter(item => item !== amenityValue)
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum 10MB per image.`)
        return false
      }
      return true
    })
    
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...validFiles]
    }))
    
    // Create previews and save
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imagePreviews: [...(prev.imagePreviews || []), reader.result as string]
        }))
        saveDraft() // Save after images are processed
      }
      reader.readAsDataURL(file)
    })
  }

  // Handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file')
      return
    }
    
    if (file.size > 50 * 1024 * 1024) {
      alert('Video file is too large. Maximum 50MB.')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      video: file
    }))
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        videoPreview: reader.result as string
      }))
    }
    reader.readAsDataURL(file)
  }

  // Remove image
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
      imagePreviews: (prev.imagePreviews || []).filter((_, i) => i !== index)
    }))
  }

  // Remove video
  const removeVideo = () => {
    setFormData(prev => ({
      ...prev,
      video: null,
      videoPreview: null
    }))
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  // Handle extras input
  const handleExtrasChange = (value: string) => {
    const extrasArray = value.split(',').map(item => item.trim()).filter(Boolean)
    setFormData(prev => ({
      ...prev,
      extras: extrasArray
    }))
  }

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!formData.title?.trim()) newErrors.title = 'Property title is required'
        if (!formData.description?.trim()) newErrors.description = 'Description is required'
        if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required'
        if (!formData.address?.trim()) newErrors.address = 'Address is required'
        if (!formData.city?.trim()) newErrors.city = 'City is required'
        if (!formData.state?.trim()) newErrors.state = 'State is required'
        if (!formData.apartmentType) newErrors.apartmentType = 'Apartment type is required'
        break
        
      case 2:
        if (!formData.bedrooms || (formData.bedrooms) <= 0) newErrors.bedrooms = 'Number of bedrooms is required'
        if (!formData.bathrooms || (formData.bathrooms) <= 0) newErrors.bathrooms = 'Number of bathrooms is required'
        if (!formData.toilet || (formData.toilet) <= 0) newErrors.toilet = 'Number of toilets is required'
        break
        
      case 3:
        if ((formData.images?.length || 0) === 0 && (formData.imagePreviews?.length || 0) === 0) 
          newErrors.images = 'At least one image is required'
        break
        
      case 4:
        if (!formData.landlordFullName?.trim()) newErrors.landlordFullName = 'Landlord full name is required'
        if (!formData.landlordPhone?.trim()) newErrors.landlordPhone = 'Landlord phone is required'
        break
        
      case 6:
        if (!formData.bankName?.trim()) newErrors.bankName = 'Bank name is required'
        if (!formData.accountNumber?.trim()) newErrors.accountNumber = 'Account number is required'
        if (!formData.accountName?.trim()) newErrors.accountName = 'Account name is required'
        break
        
      case 9:
        if (!formData.commissionRate || formData.commissionRate < 0) 
          newErrors.commissionRate = 'Valid commission rate is required'
        if (!formData.contractStartDate) 
          newErrors.contractStartDate = 'Contract start date is required'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Property data interface
  interface PropertyData {
    title: string
    description: string
    price: number
    address: string
    city: string
    state: string
    country: string
    apartmentType: ApartmentType
    unitNumber: string
    apartmentCount: number

      bedrooms: number
      bathrooms: number
      parking: boolean
      kitchen: boolean
      toilet: number
      amenities: string[]
      extras: string[]
    
    landlordInfo: {
      fullName: string
      email: string
      phone: string
      alternativePhone: string
      occupation: string
      notes: string
      address: {
        street: string
        city: string
        state: string
        country: string
      }
      bankDetails: {
        bankName: string
        accountNumber: string
        accountName: string
      }
      emergencyContact: {
        name: string
        relationship: string
        phone: string
        email: string
      }
      nextOfKin: {
        name: string
        relationship: string
        phone: string
      }
    }
    commissionRate: number
    managementFee: number
    paymentSchedule: string
    contractStartDate: string
    contractEndDate: string
  }

  // Prepare data for context functions
const preparePropertyData = () => {
  // Create form data object matching your backend's flat field structure
  const propertyData = {
    // Basic Info (top-level)
    title: formData.title || '',
    description: formData.description || '',
    price: formData.price || 0,
    address: formData.address || '',
    city: formData.city || '',
    state: formData.state || '',
    country: formData.country || 'Nigeria',
    apartmentType: formData.apartmentType || 'a-room',
    unitNumber: formData.unitNumber || '',
    apartmentCount: formData.apartmentCount || 1,
    
    // Features (FLAT fields - backend will convert to nested)
    bedrooms: formData.bedrooms || 0,
    bathrooms: formData.bathrooms || 0,
    parking: formData.parking || false,
    kitchen: formData.kitchen || false,
    toilet: formData.toilet || 0,
    amenities: (formData.amenities || []).join(','), // Convert array to comma-separated string
    extras: (formData.extras || []).join(','), // Convert array to comma-separated string
    
    // Landlord/House Owner Information (FLAT fields)
    landlordFullName: formData.landlordFullName || '',
    landlordEmail: formData.landlordEmail || '',
    landlordPhone: formData.landlordPhone || '',
    landlordAlternativePhone: formData.landlordAlternativePhone || '',
    
    // Landlord Contact Address (FLAT fields)
    landlordStreet: formData.landlordStreet || '',
    landlordCity: formData.landlordCity || '',
    landlordState: formData.landlordState || '',
    landlordCountry: formData.landlordCountry || '',
    
    // Landlord Bank Details (FLAT fields)
    bankName: formData.bankName || '',
    accountNumber: formData.accountNumber || '',
    accountName: formData.accountName || '',
    
    // Emergency Contact (FLAT fields)
    emergencyContactName: formData.emergencyContactName || '',
    emergencyContactRelationship: formData.emergencyContactRelationship || '',
    emergencyContactPhone: formData.emergencyContactPhone || '',
    emergencyContactEmail: formData.emergencyContactEmail || '',
    
    // Additional Landlord Info (FLAT fields)
    landlordOccupation: formData.landlordOccupation || '',
    nextOfKin: formData.nextOfKin || '',
    relationshipToKin: formData.relationshipToKin || '',
    kinPhone: formData.kinPhone || '',
    landlordNotes: formData.landlordNotes || '',
    
    // Management Info (FLAT fields)
    commissionRate: formData.commissionRate || 10,
    managementFee: formData.managementFee || 0,
    paymentSchedule: formData.paymentSchedule || 'monthly',
    contractStartDate: formData.contractStartDate || '',
    contractEndDate: formData.contractEndDate || ''
  }
  
  return propertyData
}

// Then in handleSubmit, send the flat structure:
const handleSubmit = async () => {
  if (!termsAccepted) {
    alert('Please accept the terms and conditions')
    return
  }

  setIsSubmitting(true)
  
  try {
    const propertyData = preparePropertyData()
    const imageFiles = formData.images || []
    const videoFiles = formData.video ? [formData.video] : []

    if (propertyId) {
      // Update existing property
      const result = await updateProperty(
        propertyId,
        propertyData, // This is flat structure
        imageFiles,
        videoFiles
      )
      
      if (result.success) {
        clearDraft()
        alert('Property updated successfully!')
        router.push('/dashboard/super-admin/properties')
      } else {
        throw new Error(result.message || 'Failed to update property')
      }
    } else {
      // Create new property
      const result = await listNewProperty(
        propertyData, // This is flat structure
        imageFiles,
        videoFiles
      )
      
      if (result.success) {
        clearDraft()
        alert('Property listed successfully!')
        router.push('/dashboard/super-admin/properties')
      } else {
        throw new Error('Failed to create property')
      }
    }
  } catch (error: unknown) {
    console.error('Error creating property:', error)
    alert(error instanceof Error ? error.message : 'Failed to create property')
  } finally {
    setIsSubmitting(false)
  }
}

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} errors={errors} handleChange={handleChange} />
      case 2:
        return <Step2Features formData={formData} errors={errors} handleChange={handleChange} handleExtrasChange={handleExtrasChange} />
      case 3:
        return (
          <Step3Media 
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleImageUpload={handleImageUpload}
            handleVideoUpload={handleVideoUpload}
            removeImage={removeImage}
            removeVideo={removeVideo}
            imageInputRef={imageInputRef}
            videoInputRef={videoInputRef}
          />
        )
      case 4:
        return <Step4LandlordInfo formData={formData} errors={errors} handleChange={handleChange} />
      case 5:
        return <Step5ContactAddress formData={formData} handleChange={handleChange} />
      case 6:
        return <Step6BankDetails formData={formData} errors={errors} handleChange={handleChange} />
      case 7:
        return <Step7EmergencyContact formData={formData} handleChange={handleChange} />
      case 8:
        return <Step8AdditionalInfo formData={formData} handleChange={handleChange} />
      case 9:
        return <Step9ManagementInfo formData={formData} errors={errors} handleChange={handleChange} />
      case 10:
        return <Step10Review formData={formData} termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted} />
    }
  }

  // Determine loading state
  const isLoading = isSubmitting || loadingListNew || loadingUpdate

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Draft Alert */}
      {showDraftAlert && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="w-5 h-5 text-amber-500 mr-2" />
              <p className="text-amber-700">
                <span className="font-medium">Draft restored!</span> Your previous form data has been loaded.
              </p>
            </div>
            <button
              onClick={() => setShowDraftAlert(false)}
              className="text-amber-500 hover:text-amber-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="px-6 pt-6">
        <div className="mb-2 flex justify-between text-sm text-emerald-600">
          <span>Step {currentStep} of {steps.length}</span>
          {lastSaved && (
              <span className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Auto-saved at {lastSaved}
            </span>
          )}
        </div>
        <div className="w-full bg-emerald-200 rounded-full h-2">
          <div 
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="px-6 py-4 border-b border-emerald-100">
        <div className="flex overflow-x-auto pb-2 space-x-2">
          {steps.map((step) => {
            const Icon = step.icon
            const isCompleted = currentStep > step.id
            const isCurrent = currentStep === step.id
            
            return (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'bg-emerald-100 text-emerald-700'
                    : isCompleted
                    ? 'text-emerald-600 hover:bg-emerald-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  isCurrent
                    ? 'bg-emerald-600 text-white'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-medium">{step.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="px-6 py-4 border-t border-emerald-100 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5 inline-block mr-1" />
              Previous
            </button>
            
            {currentStep < 10 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Next
                <ChevronRightIcon className="w-5 h-5 inline-block ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !termsAccepted}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    {propertyId ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  propertyId ? 'Update Property' : 'Submit Property'
                )}
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={saveDraft}
              disabled={isSaving}
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={clearDraft}
              className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Individual Step Components with Proper Typing

interface StepProps {
  formData: DraftData
  errors?: Record<string, string>
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleExtrasChange?: (value: string) => void
  handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleVideoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeImage?: (index: number) => void
  removeVideo?: () => void
  imageInputRef?: React.RefObject<HTMLInputElement>
  videoInputRef?: React.RefObject<HTMLInputElement>
}

interface StepReviewProps {
  formData: DraftData
  termsAccepted: boolean
  setTermsAccepted: (value: boolean) => void
}

const Step1BasicInfo: React.FC<StepProps> = ({ formData, errors, handleChange }) => {
  const apartmentTypes: { value: ApartmentType; label: string }[] = [
    { value: 'a-room', label: 'A Room' },
    { value: 'self-contained', label: 'Self Contained' },
    { value: 'room-and-parlour', label: 'Room & Parlour' },
    { value: 'two-bedroom', label: 'Two Bedroom' },
    { value: 'three-bedroom', label: 'Three Bedroom' },
    { value: 'flat', label: 'Flat' },
    { value: 'others', label: 'Others' }
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-emerald-900 mb-6">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Property Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors?.title ? 'border-red-500' : 'border-emerald-300'
            }`}
            placeholder="Modern 2-Bedroom Apartment in Downtown"
          />
          {errors?.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors?.description ? 'border-red-500' : 'border-emerald-300'
            }`}
            placeholder="Describe the property features, location, and amenities..."
          />
          {errors?.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Monthly Price ($) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors?.price ? 'border-red-500' : 'border-emerald-300'
            }`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors?.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Apartment Type *
          </label>
          <select
            name="apartmentType"
            value={formData.apartmentType || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors?.apartmentType ? 'border-red-500' : 'border-emerald-300'
            }`}
          >
            <option value="">Select type</option>
            {apartmentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors?.apartmentType && (
            <p className="mt-1 text-sm text-red-600">{errors.apartmentType}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Unit Number
          </label>
          <input
            type="text"
            name="unitNumber"
            value={formData.unitNumber || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Unit 101, Block A"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Number of Apartments
          </label>
          <input
            type="number"
            name="apartmentCount"
            value={formData.apartmentCount || '1'}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="1"
            min="1"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-lg font-medium text-emerald-900 mb-4">Location Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-emerald-700 mb-2">
              Full Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors?.address ? 'border-red-500' : 'border-emerald-300'
              }`}
              placeholder="123 Main Street, Downtown"
            />
            {errors?.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-emerald-700 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors?.city ? 'border-red-500' : 'border-emerald-300'
              }`}
              placeholder="City"
            />
            {errors?.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-emerald-700 mb-2">
              State *
            </label>
            <input
              type="text"
              name="state"
              value={formData.state || ''}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors?.state ? 'border-red-500' : 'border-emerald-300'
              }`}
              placeholder="State"
            />
            {errors?.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-emerald-700 mb-2">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country || 'Nigeria'}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Country"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const Step2Features: React.FC<StepProps & { handleExtrasChange?: (value: string) => void }> = ({ 
  formData, 
  errors, 
  handleChange, 
  handleExtrasChange 
}) => {
  const amenitiesList = [
    'Swimming Pool',
    'Gym',
    'Parking',
    'Security',
    'WiFi',
    'Laundry',
    'Elevator',
    'Garden',
    'Balcony',
    'Air Conditioning',
    'Heating',
    'Pet Friendly',
    'Furnished',
    'Water Supply',
    'Electricity',
    'Backup Generator'
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-emerald-900 mb-6">Property Features</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Bedrooms *
          </label>
          <input
            type="number"
            name="bedrooms"
            value={formData.bedrooms || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors?.bedrooms ? 'border-red-500' : 'border-emerald-300'
            }`}
            placeholder="2"
            min="0"
          />
          {errors?.bedrooms && (
            <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Bathrooms *
          </label>
          <input
            type="number"
            name="bathrooms"
            value={formData.bathrooms || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors?.bathrooms ? 'border-red-500' : 'border-emerald-300'
            }`}
            placeholder="2"
            min="0"
          />
          {errors?.bathrooms && (
            <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Toilets *
          </label>
          <input
            type="number"
            name="toilet"
            value={formData.toilet || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors?.toilet ? 'border-red-500' : 'border-emerald-300'
            }`}
            placeholder="2"
            min="0"
          />
          {errors?.toilet && (
            <p className="mt-1 text-sm text-red-600">{errors.toilet}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            id="parking"
            name="parking"
            checked={formData.parking || false}
            onChange={handleChange}
            className="w-5 h-5 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="parking" className="text-emerald-700">
            Parking Available
          </label>
        </div>
        
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            id="kitchen"
            name="kitchen"
            checked={formData.kitchen || false}
            onChange={handleChange}
            className="w-5 h-5 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="kitchen" className="text-emerald-700">
            Kitchen Included
          </label>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-emerald-900 mb-4">Amenities</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {amenitiesList.map(amenity => (
            <div key={amenity} className="flex items-center">
              <input
                type="checkbox"
                id={`amenity-${amenity}`}
                name="amenities"
                value={amenity}
                checked={(formData.amenities || []).includes(amenity)}
                onChange={handleChange}
                className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-emerald-700">
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-emerald-900 mb-4">Additional Features</h4>
        <textarea
          value={(formData.extras || []).join(', ')}
          onChange={(e) => handleExtrasChange?.(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Enter additional features separated by commas (e.g., Solar panels, Water tank, Security system)"
        />
        <p className="mt-1 text-sm text-emerald-500">
          Separate multiple features with commas
        </p>
      </div>
    </div>
  )
}

const Step3Media: React.FC<StepProps> = ({ 
  formData, 
  errors, 
  handleImageUpload, 
  handleVideoUpload, 
  removeImage, 
  removeVideo, 
  imageInputRef, 
  videoInputRef 
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-emerald-900 mb-6">Media Upload</h3>
    
    {/* Images Section */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <label className="block text-sm font-medium text-emerald-700">
            Property Images *
          </label>
          <p className="text-sm text-emerald-500">Upload at least one image (Max 10MB each)</p>
        </div>
        <button
          type="button"
          onClick={() => imageInputRef?.current?.click()}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <CameraIcon className="w-5 h-5 mr-2" />
          Add Images
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
      
      {errors?.images && (
        <p className="text-sm text-red-600 mb-4">{errors.images}</p>
      )}
      
      {(formData.imagePreviews || []).length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(formData.imagePreviews || []).map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage?.(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-12 text-center">
          <CameraIcon className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
          <p className="text-emerald-600 mb-2">No images uploaded yet</p>
          <p className="text-sm text-emerald-500">Click &quot;Add Images&quot; to upload property photos</p>
        </div>
      )}
    </div>
    
    {/* Video Section */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <label className="block text-sm font-medium text-emerald-700">
            Property Video (Optional)
          </label>
          <p className="text-sm text-emerald-500">Upload one video (Max 50MB)</p>
        </div>
        <button
          type="button"
          onClick={() => videoInputRef?.current?.click()}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <VideoCameraIcon className="w-5 h-5 mr-2" />
          Add Video
        </button>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="hidden"
        />
      </div>
      
      {formData.videoPreview ? (
        <div className="relative">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <video
              src={formData.videoPreview}
              controls
              className="w-full h-full object-contain"
            />
          </div>
          <button
            type="button"
            onClick={removeVideo}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-12 text-center">
          <VideoCameraIcon className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
          <p className="text-emerald-600">No video uploaded</p>
        </div>
      )}
    </div>
  </div>
)

const Step4LandlordInfo: React.FC<StepProps> = ({ formData, errors, handleChange }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-emerald-900 mb-6">Landlord Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          name="landlordFullName"
          value={formData.landlordFullName || ''}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            errors?.landlordFullName ? 'border-red-500' : 'border-emerald-300'
          }`}
          placeholder="John Doe"
        />
        {errors?.landlordFullName && (
          <p className="mt-1 text-sm text-red-600">{errors.landlordFullName}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="landlordEmail"
          value={formData.landlordEmail || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="landlord@example.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          name="landlordPhone"
          value={formData.landlordPhone || ''}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            errors?.landlordPhone ? 'border-red-500' : 'border-emerald-300'
          }`}
          placeholder="+1234567890"
        />
        {errors?.landlordPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.landlordPhone}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Alternative Phone
        </label>
        <input
          type="tel"
          name="landlordAlternativePhone"
          value={formData.landlordAlternativePhone || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="+1234567890"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Occupation
        </label>
        <input
          type="text"
          name="landlordOccupation"
          value={formData.landlordOccupation || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g., Business Owner, Engineer"
        />
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Additional Notes
        </label>
        <textarea
          name="landlordNotes"
          value={formData.landlordNotes || ''}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Any additional information about the landlord..."
        />
      </div>
    </div>
  </div>
)

const Step5ContactAddress: React.FC<StepProps> = ({ formData, handleChange }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-emerald-900 mb-6">Contact Address</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Street Address
        </label>
        <input
          type="text"
          name="landlordStreet"
          value={formData.landlordStreet || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="123 Main Street"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          City
        </label>
        <input
          type="text"
          name="landlordCity"
          value={formData.landlordCity || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="City"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          State
        </label>
        <input
          type="text"
          name="landlordState"
          value={formData.landlordState || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="State"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Country
        </label>
        <input
          type="text"
          name="landlordCountry"
          value={formData.landlordCountry || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Country"
        />
      </div>
    </div>
  </div>
)

const Step6BankDetails: React.FC<StepProps> = ({ formData, errors, handleChange }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-emerald-900 mb-6">Bank Details</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Bank Name *
        </label>
        <input
          type="text"
          name="bankName"
          value={formData.bankName || ''}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            errors?.bankName ? 'border-red-500' : 'border-emerald-300'
          }`}
          placeholder="e.g., Chase Bank, Bank of America"
        />
        {errors?.bankName && (
          <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Account Number *
        </label>
        <input
          type="text"
          name="accountNumber"
          value={formData.accountNumber || ''}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            errors?.accountNumber ? 'border-red-500' : 'border-emerald-300'
          }`}
          placeholder="1234567890"
        />
        {errors?.accountNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
        )}
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Account Name *
        </label>
        <input
          type="text"
          name="accountName"
          value={formData.accountName || ''}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            errors?.accountName ? 'border-red-500' : 'border-emerald-300'
          }`}
          placeholder="John Doe"
        />
        {errors?.accountName && (
          <p className="mt-1 text-sm text-red-600">{errors.accountName}</p>
        )}
      </div>
    </div>
  </div>
)

const Step7EmergencyContact: React.FC<StepProps> = ({ formData, handleChange }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-emerald-900 mb-6">Emergency Contact</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Contact Name
        </label>
        <input
          type="text"
          name="emergencyContactName"
          value={formData.emergencyContactName || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Jane Smith"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Relationship
        </label>
        <input
          type="text"
          name="emergencyContactRelationship"
          value={formData.emergencyContactRelationship || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g., Spouse, Sibling"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          name="emergencyContactPhone"
          value={formData.emergencyContactPhone || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="+1234567890"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Email
        </label>
        <input
          type="email"
          name="emergencyContactEmail"
          value={formData.emergencyContactEmail || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="contact@example.com"
        />
      </div>
    </div>
  </div>
)

const Step8AdditionalInfo: React.FC<StepProps> = ({ formData, handleChange }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-emerald-900 mb-6">Additional Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Next of Kin
        </label>
        <input
          type="text"
          name="nextOfKin"
          value={formData.nextOfKin || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Next of kin name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Relationship to Kin
        </label>
        <input
          type="text"
          name="relationshipToKin"
          value={formData.relationshipToKin || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g., Son, Daughter"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          Kin Phone Number
        </label>
        <input
          type="tel"
          name="kinPhone"
          value={formData.kinPhone || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="+1234567890"
        />
      </div>
    </div>
  </div>
)

const Step9ManagementInfo: React.FC<StepProps> = ({ formData, errors, handleChange }) => {
  const paymentSchedules = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-emerald-900 mb-6">Management Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Commission Rate (%) *
          </label>
          <input
            type="number"
            name="commissionRate"
            value={formData.commissionRate || '10'}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors?.commissionRate ? 'border-red-500' : 'border-emerald-300'
            }`}
            placeholder="10"
            min="0"
            max="100"
            step="0.1"
          />
          {errors?.commissionRate && (
            <p className="mt-1 text-sm text-red-600">{errors.commissionRate}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Management Fee ($)
          </label>
          <input
            type="number"
            name="managementFee"
            value={formData.managementFee || '0'}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Payment Schedule
          </label>
          <select
            name="paymentSchedule"
            value={formData.paymentSchedule || 'monthly'}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {paymentSchedules.map(schedule => (
              <option key={schedule.value} value={schedule.value}>
                {schedule.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-emerald-900 mb-4">Contract Period</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-emerald-700 mb-2">
              Contract Start Date *
            </label>
            <input
              type="date"
              name="contractStartDate"
              value={formData.contractStartDate || ''}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors?.contractStartDate ? 'border-red-500' : 'border-emerald-300'
              }`}
            />
            {errors?.contractStartDate && (
              <p className="mt-1 text-sm text-red-600">{errors.contractStartDate}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-emerald-700 mb-2">
              Contract End Date
            </label>
            <input
              type="date"
              name="contractEndDate"
              value={formData.contractEndDate || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const Step10Review: React.FC<StepReviewProps> = ({ formData, termsAccepted, setTermsAccepted }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-emerald-900 mb-6">Review & Submit</h3>
    
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
      <div className="space-y-6">
        {/* Property Info */}
        <div>
          <h4 className="font-medium text-emerald-800 mb-3">Property Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-emerald-600">Title:</span>
              <p className="font-medium">{formData.title || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-emerald-600">Price:</span>
              <p className="font-medium">${formData.price || '0'}/month</p>
            </div>
            <div>
              <span className="text-emerald-600">Type:</span>
              <p className="font-medium capitalize">
                {formData.apartmentType?.replace('-', ' ') || 'Not provided'}
              </p>
            </div>
            <div>
              <span className="text-emerald-600">Location:</span>
              <p className="font-medium">{formData.address}, {formData.city}</p>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div>
          <h4 className="font-medium text-emerald-800 mb-3">Property Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-emerald-600">Bedrooms:</span>
              <p className="font-medium">{formData.bedrooms || '0'}</p>
            </div>
            <div>
              <span className="text-emerald-600">Bathrooms:</span>
              <p className="font-medium">{formData.bathrooms || '0'}</p>
            </div>
            <div>
              <span className="text-emerald-600">Toilets:</span>
              <p className="font-medium">{formData.toilet || '0'}</p>
            </div>
            <div>
              <span className="text-emerald-600">Parking:</span>
              <p className="font-medium">{formData.parking ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-emerald-600">Kitchen:</span>
              <p className="font-medium">{formData.kitchen ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-emerald-600">Images:</span>
              <p className="font-medium">{formData.imagePreviews?.length || 0} uploaded</p>
            </div>
          </div>
        </div>
        
        {/* Landlord Info */}
        <div>
          <h4 className="font-medium text-emerald-800 mb-3">Landlord Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-emerald-600">Full Name:</span>
              <p className="font-medium">{formData.landlordFullName || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-emerald-600">Phone:</span>
              <p className="font-medium">{formData.landlordPhone || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-emerald-600">Bank Name:</span>
              <p className="font-medium">{formData.bankName || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-emerald-600">Account Name:</span>
              <p className="font-medium">{formData.accountName || 'Not provided'}</p>
            </div>
          </div>
        </div>
        
        {/* Management Info */}
        <div>
          <h4 className="font-medium text-emerald-800 mb-3">Management Agreement</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-emerald-600">Commission Rate:</span>
              <p className="font-medium">{formData.commissionRate}%</p>
            </div>
            <div>
              <span className="text-emerald-600">Payment Schedule:</span>
              <p className="font-medium capitalize">{formData.paymentSchedule}</p>
            </div>
            <div>
              <span className="text-emerald-600">Contract Start:</span>
              <p className="font-medium">{formData.contractStartDate || 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Terms and Conditions */}
    <div className="border border-gray-200 rounded-xl p-6">
      <div className="flex items-start">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-1"
        />
        <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
          I confirm that all information provided is accurate and complete. 
          I agree to the terms of service and acknowledge that false information 
          may result in account suspension.
        </label>
      </div>
    </div>
  </div>
)