'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRentalRequest } from '../../context/RentalRequestContext'
import { useUser } from '../../context/UserContext'
import { Property } from '../../types/property'
import { 
  CalendarIcon, 
  ClockIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  HomeModernIcon,
  ExclamationCircleIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import Link from 'next/link'

interface RentalRequestFormProps {
  property: Property
  onClose: () => void
  onSuccess?: () => void
}

export default function RentalRequestForm({ property, onClose, onSuccess }: RentalRequestFormProps) {
  const router = useRouter()
  const { user } = useUser()
  const { submitRequest, loadingSubmit } = useRentalRequest()
  
  const [formData, setFormData] = useState({
    message: '',
    requestedMoveInDate: '',
    duration: '12'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Calculate minimum move-in date (10 days from now)
  const getMinMoveInDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 10)
    return date.toISOString().split('T')[0]
  }

  // Calculate max move-in date (3 months from now)
  const getMaxMoveInDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 3)
    return date.toISOString().split('T')[0]
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.message.trim()) {
      newErrors.message = 'Please provide a brief message to Irorun Homes'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    } else if (formData.message.trim().length > 500) {
      newErrors.message = 'Message cannot exceed 500 characters'
    }

    if (!formData.requestedMoveInDate) {
      newErrors.requestedMoveInDate = 'Please select your preferred move-in date'
    }

    if (!formData.duration) {
      newErrors.duration = 'Please select lease duration'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Function to send WhatsApp message with form details
  const sendWhatsAppMessage = () => {
    const tenantName = user?.fullName || 'Not provided'
    const tenantPhone = user?.phone || 'Not provided'
    const tenantEmail = user?.email || 'Not provided'
    
    // Format the message
    const whatsappMessage = `
🏠 *NEW RENTAL REQUEST - IRORUN HOMES*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 *TENANT INFORMATION*
• Name: ${tenantName}
• Phone: ${tenantPhone}
• Email: ${tenantEmail}

🏢 *PROPERTY DETAILS*
• Property: ${property.title}
• Location: ${property.address}, ${property.city}
• Price: ${formatPrice(property.price)}/year
• Bedrooms: ${property.features.bedrooms}
• Bathrooms: ${property.features.bathrooms}
• Parking: ${property.features.parking ? 'Yes' : 'No'}
• Kitchen: ${property.features.kitchen ? 'Yes' : 'No'}

📋 *REQUEST DETAILS*
• Move-in Date: ${new Date(formData.requestedMoveInDate).toLocaleDateString()}
• Duration: ${formData.duration === '12' ? '12 months (1 year)' : '24 months (2 years)'}
• Message: ${formData.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Submitted: ${new Date().toLocaleString()}
📱 Request ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
    `.trim()

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(whatsappMessage)
    
    // WhatsApp number (remove the 0 and add 234 prefix)
    const whatsappNumber = '2348167436407'
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push(`/auth/login?redirect=/properties/${property._id}`)
      return
    }

    if (!validateForm()) return

    try {
      const result = await submitRequest({
        propertyId: property._id,
        message: formData.message,
        requestedMoveInDate: formData.requestedMoveInDate,
        duration: parseInt(formData.duration)
      })

      if (result.success) {
        setSubmitted(true)
        onSuccess?.()
        
        // Send WhatsApp message with all details
        sendWhatsAppMessage()
        
        alert(result.message)
      } else if (!result.success) {
          alert(result.message)
      }
    } catch (error) {
      console.error('Failed to submit request:', error)
    }
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  if (submitted) {
    return (
      <div className="text-center py-6 animate-fadeIn">
        {/* Success Animation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircleSolidIcon className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted! 🎉</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Your rental request for <span className="font-semibold text-emerald-700">{property.title}</span> has been sent successfully.
        </p>
        
        {/* WhatsApp Notification Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.588 1.922.861 3.149.861 3.182 0 5.767-2.586 5.768-5.766.001-3.18-2.585-5.766-5.768-5.766zM12.031 18.5c-1.197 0-2.391-.328-3.428-.938l-2.453.645.656-2.367c-.662-1.056-1.009-2.236-1.009-3.461 0-3.563 2.9-6.463 6.464-6.463 1.728 0 3.351.673 4.571 1.893s1.893 2.843 1.893 4.571c0 3.563-2.9 6.464-6.464 6.464z"/>
              </svg>
            </div>
            <div className="text-left">
              <h4 className="font-bold text-green-800">WhatsApp Notification Sent!</h4>
              <p className="text-sm text-green-700">We&apos;ve sent your request details to Irorun Homes</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mb-4 text-left">
            Your rental request details have been sent via WhatsApp to our team for faster processing.
          </p>
          
          <a
            href="https://wa.me/2348167436407"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.588 1.922.861 3.149.861 3.182 0 5.767-2.586 5.768-5.766.001-3.18-2.585-5.766-5.768-5.766zM12.031 18.5c-1.197 0-2.391-.328-3.428-.938l-2.453.645.656-2.367c-.662-1.056-1.009-2.236-1.009-3.461 0-3.563 2.9-6.463 6.464-6.463 1.728 0 3.351.673 4.571 1.893s1.893 2.843 1.893 4.571c0 3.563-2.9 6.464-6.464 6.464z"/>
            </svg>
            Chat with Irorun Homes on WhatsApp
          </a>
          
          <p className="text-xs text-green-600 mt-3">
            Our team will respond within 24-48 hours via WhatsApp or phone call.
          </p>
        </div>
        
        {/* Next Steps Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 mb-6 border border-emerald-200 shadow-inner">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center mr-3">
              <InformationCircleIcon className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-emerald-800">What happens next?</h4>
          </div>
          
          <ul className="space-y-3 text-left">
            <li className="flex items-start text-sm text-emerald-700">
              <div className="flex-shrink-0 w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-bold text-emerald-800">1</span>
              </div>
              <span><span className="font-medium">WhatsApp Confirmation:</span> Check your WhatsApp for request confirmation</span>
            </li>
            <li className="flex items-start text-sm text-emerald-700">
              <div className="flex-shrink-0 w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-bold text-emerald-800">2</span>
              </div>
              <span><span className="font-medium">Review:</span> Our team will review your request within 24-48 hours</span>
            </li>
            <li className="flex items-start text-sm text-emerald-700">
              <div className="flex-shrink-0 w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-bold text-emerald-800">3</span>
              </div>
              <span><span className="font-medium">Contact:</span> A property manager will reach out to schedule an inspection</span>
            </li>
            <li className="flex items-start text-sm text-emerald-700">
              <div className="flex-shrink-0 w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-bold text-emerald-800">4</span>
              </div>
              <span><span className="font-medium">Inspection:</span> View the property at your convenience</span>
            </li>
          </ul>
          
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800 flex items-start">
              <ShieldCheckIcon className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
              <span>
                <span className="font-bold">Important:</span> Irorun Homes will never request payment before an inspection. 
                Please report any suspicious requests to our support team.
              </span>
            </p>
          </div>
        </div>
        
        {/* Request ID */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6 inline-block mx-auto">
          <p className="text-xs text-gray-500">Request Reference</p>
          <p className="font-mono text-sm font-bold text-gray-700">
            {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard/tenant/requests"
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center justify-center shadow-md hover:shadow-lg"
          >
            Track My Request
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Continue Browsing
          </button>
        </div>
        
        {/* Contact Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Need immediate assistance? Call or WhatsApp: <span className="font-medium text-emerald-600">08167436407</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property Summary Card - Enhanced */}
      <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl p-5 border border-emerald-200/50 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-4">
          {/* Property Image */}
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-md group">
            {property.media.images[0] ? (
              <>
                <Image
                  src={property.media.images[0].url}
                  alt={property.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 96px, 112px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                <HomeModernIcon className="w-8 h-8 text-emerald-600" />
              </div>
            )}
          </div>
          
          {/* Property Details */}
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">{property.title}</h4>
            
            <div className="flex items-start text-gray-600 mb-2">
              <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5 text-emerald-500" />
              <p className="text-sm line-clamp-1">{property.address}, {property.city}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center bg-emerald-100 px-3 py-1.5 rounded-full">
                <BuildingOfficeIcon className="w-3.5 h-3.5 text-emerald-700 mr-1" />
                <span className="text-xs font-medium text-emerald-800">
                  {property.features.bedrooms} Bed • {property.features.bathrooms} Bath
                </span>
              </div>
              
              <div className="flex items-center bg-blue-100 px-3 py-1.5 rounded-full">
                <CurrencyDollarIcon className="w-3.5 h-3.5 text-blue-700 mr-1" />
                <span className="text-xs font-medium text-blue-800">
                  {formatPrice(property.price)}/year
                </span>
              </div>
            </div>
            
            <div className="mt-2 flex items-center">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                property.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                {property.status === 'available' ? 'Available Now' : 'Limited Availability'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Quick Notice */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200 flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.588 1.922.861 3.149.861 3.182 0 5.767-2.586 5.768-5.766.001-3.18-2.585-5.766-5.768-5.766zM12.031 18.5c-1.197 0-2.391-.328-3.428-.938l-2.453.645.656-2.367c-.662-1.056-1.009-2.236-1.009-3.461 0-3.563 2.9-6.463 6.464-6.463 1.728 0 3.351.673 4.571 1.893s1.893 2.843 1.893 4.571c0 3.563-2.9 6.464-6.464 6.464z"/>
          </svg>
          <div>
            <p className="text-sm font-medium text-green-800">Instant WhatsApp Notification</p>
            <p className="text-xs text-green-700">Your request will be sent to our team via WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Form Progress Indicator */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">1</div>
          <div className="w-12 h-0.5 bg-emerald-200"></div>
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">2</div>
          <div className="w-12 h-0.5 bg-gray-200"></div>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-semibold text-sm">3</div>
        </div>
        <span className="text-xs text-gray-500">Step 1 of 3</span>
      </div>

      {/* Message - Enhanced */}
      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-semibold text-gray-800">
          Message to Irorun Homes & Properties <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-3">
            <DocumentTextIcon className={`w-5 h-5 ${errors.message && touched.message ? 'text-red-400' : 'text-gray-400 group-focus-within:text-emerald-500'} transition-colors`} />
          </div>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            onBlur={() => handleBlur('message')}
            placeholder="Tell us about yourself and why you're interested in this property..."
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
              errors.message && touched.message
                ? 'border-red-300 focus:ring-red-100 bg-red-50/30' 
                : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100 bg-white hover:border-gray-300'
            }`}
          />
        </div>
        <div className="flex justify-between items-center px-1">
          {errors.message && touched.message ? (
            <p className="text-sm text-red-600 flex items-center animate-shake">
              <ExclamationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
              {errors.message}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Introduce yourself and your interest in this property
            </p>
          )}
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            formData.message.length > 450 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {formData.message.length}/500
          </span>
        </div>
      </div>

      {/* Move-in Date - Enhanced */}
      <div className="space-y-2">
        <label htmlFor="requestedMoveInDate" className="block text-sm font-semibold text-gray-800">
          Preferred Move-in Date <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <CalendarIcon className={`w-5 h-5 ${errors.requestedMoveInDate && touched.requestedMoveInDate ? 'text-red-400' : 'text-gray-400 group-focus-within:text-emerald-500'} transition-colors`} />
          </div>
          <input
            type="date"
            id="requestedMoveInDate"
            name="requestedMoveInDate"
            value={formData.requestedMoveInDate}
            onChange={handleChange}
            onBlur={() => handleBlur('requestedMoveInDate')}
            min={getMinMoveInDate()}
            max={getMaxMoveInDate()}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
              errors.requestedMoveInDate && touched.requestedMoveInDate
                ? 'border-red-300 focus:ring-red-100 bg-red-50/30' 
                : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100 bg-white hover:border-gray-300'
            }`}
          />
        </div>
        {errors.requestedMoveInDate && touched.requestedMoveInDate ? (
          <p className="text-sm text-red-600 flex items-center animate-shake">
            <ExclamationCircleIcon className="w-4 h-4 mr-1" />
            {errors.requestedMoveInDate}
          </p>
        ) : (
          <div className="flex items-center text-xs text-gray-500">
            <InformationCircleIcon className="w-4 h-4 mr-1 text-emerald-500" />
            Select a date at least 10 days from today (between {new Date(getMinMoveInDate()).toLocaleDateString()} - {new Date(getMaxMoveInDate()).toLocaleDateString()})
          </div>
        )}
      </div>

      {/* Lease Duration - Enhanced */}
      <div className="space-y-2">
        <label htmlFor="duration" className="block text-sm font-semibold text-gray-800">
          Lease Duration <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <ClockIcon className={`w-5 h-5 ${errors.duration && touched.duration ? 'text-red-400' : 'text-gray-400 group-focus-within:text-emerald-500'} transition-colors`} />
          </div>
          <select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            onBlur={() => handleBlur('duration')}
            className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 appearance-none bg-white transition-all ${
              errors.duration && touched.duration
                ? 'border-red-300 focus:ring-red-100 bg-red-50/30' 
                : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100 hover:border-gray-300'
            }`}
          >
            <option value="12">12 months (1 year) - Recommended</option>
            <option value="24">24 months (2 years) - Save 5%</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {formData.duration === '24' && (
          <p className="text-xs text-emerald-600 flex items-center mt-1">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            You save 5% with a 2-year lease! (₦{Math.round(property.price * 0.05).toLocaleString()} savings)
          </p>
        )}
        {errors.duration && touched.duration && (
          <p className="text-sm text-red-600 flex items-center">
            <ExclamationCircleIcon className="w-4 h-4 mr-1" />
            {errors.duration}
          </p>
        )}
      </div>

      {/* Terms & Conditions - Enhanced */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 transition-shadow"
              required
            />
          </div>
          <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
            I confirm that the information provided is accurate and I understand that submitting this request does not guarantee approval. 
            I agree to the <Link href="/terms" className="text-emerald-600 font-medium hover:text-emerald-700 hover:underline">terms and conditions</Link> and <Link href="/privacy" className="text-emerald-600 font-medium hover:text-emerald-700 hover:underline">privacy policy</Link>.
          </label>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center">
          <ShieldCheckIcon className="w-4 h-4 mr-1 text-emerald-500" />
          <span>Secure Request</span>
        </div>
        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
        <div className="flex items-center">
          <CheckCircleIcon className="w-4 h-4 mr-1 text-emerald-500" />
          <span>No Fees</span>
        </div>
        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
        <div className="flex items-center">
          <ClockIcon className="w-4 h-4 mr-1 text-emerald-500" />
          <span>24-48hr Response</span>
        </div>
      </div>

      {/* Actions - Enhanced */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium flex items-center justify-center"
          disabled={loadingSubmit}
        >
          <XMarkIcon className="w-5 h-5 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loadingSubmit}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {loadingSubmit ? (
            <>
              <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.588 1.922.861 3.149.861 3.182 0 5.767-2.586 5.768-5.766.001-3.18-2.585-5.766-5.768-5.766zM12.031 18.5c-1.197 0-2.391-.328-3.428-.938l-2.453.645.656-2.367c-.662-1.056-1.009-2.236-1.009-3.461 0-3.563 2.9-6.463 6.464-6.463 1.728 0 3.351.673 4.571 1.893s1.893 2.843 1.893 4.571c0 3.563-2.9 6.464-6.464 6.464z"/>
              </svg>
              Submit & Send to WhatsApp
            </>
          )}
        </button>
      </div>
      
      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center">
        By submitting this request, you agree to be contacted by Irorun Homes & Properties regarding your rental inquiry.
      </p>
    </form>
  )
}