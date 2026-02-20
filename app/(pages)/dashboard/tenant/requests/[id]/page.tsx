
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useRentalRequest } from '../../../../../context/RentalRequestContext'
import { useUser } from '../../../../../context/UserContext'
import { RentalRequest, RentalRequestStatus } from '../../../../../types/rentalRequest'
import { Property } from '../../../../../types/property'
import { User } from '../../../../../types/auth'
import {
  ArrowLeftIcon,
  HomeModernIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  DocumentDuplicateIcon,
  ReceiptPercentIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  CreditCardIcon  // Added for payment button
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import DashboardLayout from '../../../DashboardLayout'

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { getRequest, cancelRequest } = useRentalRequest()
  
  const [request, setRequest] = useState<RentalRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'lease' | 'payment'>('details')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/dashboard/tenant/requests')
      return
    }

    const loadRequest = async () => {
      try {
        setLoading(true)
        const result = await getRequest(params.id as string)
        if (result) {
          setRequest(result)
        } else {
          setError(result.message || 'Request not found')
        }
      } catch (err) {
        setError('Failed to load request details')
      } finally {
        setLoading(false)
      }
    }

    loadRequest()
  }, [user, router, params.id, getRequest])

  const handleCancelRequest = async () => {
    if (!request) return
    
    setCancelling(true)
    try {
      const result = await cancelRequest(request._id)
      if (result.success) {
        setRequest({ ...request, status: 'cancelled' })
        setShowCancelModal(false)
      }
    } catch (error) {
      console.error('Failed to cancel request:', error)
    } finally {
      setCancelling(false)
    }
  }

  // Format date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format time
  const formatTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format price
  const formatPrice = (price: number | undefined) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  // Get status config
  const getStatusConfig = (status: RentalRequestStatus) => {
    const config: Record<RentalRequestStatus, {
      color: string
      bgColor: string
      icon: React.ComponentType<{ className?: string }>
      label: string
      description: string
      steps: number
    }> = {
      pending: {
        color: 'text-yellow-800',
        bgColor: 'bg-yellow-100',
        icon: ClockIcon,
        label: 'Pending Review',
        description: 'Your request is being reviewed by our team. You will receive a response within 24-48 hours.',
        steps: 1
      },
      approved: {
        color: 'text-green-800',
        bgColor: 'bg-green-100',
        icon: CheckCircleIcon,
        label: 'Approved',
        description: 'Your request has been approved! Please proceed with payment to activate your lease.',
        steps: 2
      },
      rejected: {
        color: 'text-red-800',
        bgColor: 'bg-red-100',
        icon: XCircleIcon,
        label: 'Not Approved',
        description: 'Unfortunately, your request was not approved at this time. This could be due to the property being no longer available or other applicants being selected. You can try applying for other properties.',
        steps: 3
      },
      cancelled: {
        color: 'text-gray-800',
        bgColor: 'bg-gray-100',
        icon: ExclamationCircleIcon,
        label: 'Cancelled',
        description: 'This request has been cancelled and is no longer active. You can submit a new request if you are still interested in this property.',
        steps: 3
      },
      active_lease: {
        color: 'text-emerald-800',
        bgColor: 'bg-emerald-100',
        icon: CheckCircleSolidIcon,
        label: 'Active Lease',
        description: 'Congratulations! Your lease is now active. View your lease details below for payment schedules and important dates.',
        steps: 3
      },
      expired_lease: {
        color: 'text-orange-800',
        bgColor: 'bg-orange-100',
        icon: ExclamationCircleIcon,
        label: 'Lease Expired',
        description: 'Your lease has expired. Please contact property management to discuss renewal options.',
        steps: 3
      },
      completed: {
        color: 'text-blue-800',
        bgColor: 'bg-blue-100',
        icon: CheckBadgeIcon,
        label: 'Completed',
        description: 'This rental agreement has been completed. Thank you for being a valued tenant!',
        steps: 3
      },
      renewal_pending: {
        color: 'text-purple-800',
        bgColor: 'bg-purple-100',
        icon: DocumentDuplicateIcon,
        label: 'Renewal Pending',
        description: 'Your lease renewal request is being processed.',
        steps: 2
      }
    }
    return config[status] || config.pending
  }

  // Get property from request
  const getProperty = (): Property | null => {
    if (!request?.property) return null
    return typeof request.property === 'string' 
      ? null 
      : request.property as Property
  }

  // Get tenant from request
  const getTenant = (): User | null => {
    if (!request?.tenant) return null
    return typeof request.tenant === 'string' 
      ? null 
      : request.tenant as User
  }

  // Get admin from request
  const getAdmin = (): User | null => {
    if (!request?.assignedAdmin) return null
    return typeof request.assignedAdmin === 'string' 
      ? null 
      : request.assignedAdmin as User
  }

  // Calculate days until expiry
  const getDaysUntilExpiry = () => {
    if (!request?.expiresAt) return 0
    const expiryDate = new Date(request.expiresAt)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <DashboardLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading request details...</p>
        </div>
      </div>
      </DashboardLayout>
    )
  }

  if (error || !request) {
    return (
      <DashboardLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'The rental request you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/dashboard/tenant/requests')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Back to My Requests
          </button>
        </div>
      </div>
      </DashboardLayout>
    )
  }

  const property = getProperty()
  const tenant = getTenant()
  const admin = getAdmin()
  const statusConfig = getStatusConfig(request.status)
  const StatusIcon = statusConfig.icon
  const daysUntilExpiry = getDaysUntilExpiry()

  return (
    <DashboardLayout activeTab="dashboard" onTabChange={() => {}}>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${statusConfig.bgColor}`}>
                <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Rental Request Details
                  </h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-gray-600 mt-2 flex items-center">
                  <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-400" />
                  Request ID: <span className="font-mono font-medium ml-1">{request._id}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {request.status === 'pending' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={cancelling}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center"
                >
                  <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                  Cancel Request
                </button>
              )}
                              
              {/* ADD THIS BUTTON - Only shows when request is approved */}
              {request.status === 'approved' && (
                <Link
                  href={`/dashboard/tenant/requests/${request._id}/payments`}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-sm hover:shadow"
                >
                  { request.paymentDetails.amount === 0 && (
                  <p className='flex flex-row justify-center items-center'>
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Upload Payment Receipt
                  </p>
                  )}{
                  <p className='flex flex-row justify-center items-center'>
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  View Payment Receipt
                  </p>
                  }
                </Link>
              )}

              {property && (
                <Link
                  href={`/properties/${property._id}`}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-sm hover:shadow"
                >
                  <HomeModernIcon className="w-5 h-5 mr-2" />
                  View Property
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Status Timeline Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-emerald-600" />
            Request Timeline
          </h2>
          
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute top-5 left-6 right-6 h-1 bg-gray-200">
              <div 
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{ 
                  width: request.status === 'pending' ? '25%' 
                    : request.status === 'approved' || request.status === 'renewal_pending' ? '50%'
                    : request.status === 'active_lease' ? '100%'
                    : '75%'
                }}
              ></div>
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {/* Step 1: Submitted */}
              <div className="text-center">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  request.createdAt ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <CheckCircleIcon className="w-5 h-5" />
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">Submitted</p>
                  <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                  <p className="text-xs text-gray-400">{formatTime(request.createdAt)}</p>
                </div>
              </div>

              {/* Step 2: Reviewed */}
              <div className="text-center">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  request.respondedAt || request.status !== 'pending' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  <DocumentTextIcon className="w-5 h-5" />
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">Reviewed</p>
                  <p className="text-xs text-gray-500">
                    {request.respondedAt ? formatDate(request.respondedAt) : 'Pending'}
                  </p>
                </div>
              </div>

              {/* Step 3: Decision */}
              <div className="text-center">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  request.status === 'approved' || request.status === 'rejected' || request.status === 'active_lease'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">Decision</p>
                  <p className="text-xs text-gray-500 capitalize">{request.status}</p>
                </div>
              </div>

              {/* Step 4: Lease Active */}
              <div className="text-center">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  request.status === 'active_lease'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  <HomeModernIcon className="w-5 h-5" />
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">Lease Active</p>
                  <p className="text-xs text-gray-500">
                    {request.leaseInfo?.startDate ? formatDate(request.leaseInfo.startDate) : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Description */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">{statusConfig.description}</p>
                {request.status === 'pending' && daysUntilExpiry > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    This request will expire in {daysUntilExpiry} days if not responded to.
                  </p>
                )}
                {request.status === 'active_lease' && request.leaseInfo?.endDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Lease ends on {formatDate(request.leaseInfo.endDate)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5 inline-block mr-2" />
              Request Details
            </button>
            <button
              onClick={() => setActiveTab('lease')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lease'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ReceiptPercentIcon className="w-5 h-5 inline-block mr-2" />
              Lease Information
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payment'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BanknotesIcon className="w-5 h-5 inline-block mr-2" />
              Payment Details
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Request Details Tab */}
          {activeTab === 'details' && (
            <>
              {/* Property Information */}
              {property && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    Property Information
                  </h2>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-48 flex-shrink-0">
                      <div className="relative h-40 w-full rounded-xl overflow-hidden bg-gray-100">
                        {property.media?.images?.[0] ? (
                          <Image
                            src={property.media.images[0].url}
                            alt={property.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 192px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
                            <HomeModernIcon className="w-12 h-12 text-emerald-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        <Link href={`/properties/${property._id}`} className="hover:text-emerald-700">
                          {property.title}
                        </Link>
                      </h3>
                      
                      <div className="flex items-start text-gray-600 mb-3">
                        <MapPinIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p>{property.address}, {property.city}, {property.state}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500">Property Type</p>
                          <p className="font-medium capitalize">{property.apartmentType?.replace(/-/g, ' ')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Annual Rent</p>
                          <p className="font-bold text-emerald-700">{formatPrice(property.price)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Request Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Request Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Requested Move-in Date</p>
                    <p className="font-medium mt-1 flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-emerald-600" />
                      {formatDate(request.requestedMoveInDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lease Duration</p>
                    <p className="font-medium mt-1 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2 text-emerald-600" />
                      {request.duration} months ({request.duration === 12 ? '1 year' : `${request.duration} years`})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Request Expires</p>
                    <p className="font-medium mt-1 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-2 text-emerald-600" />
                      {formatDate(request.expiresAt)}
                      <span className="ml-2 text-xs text-gray-500">
                        ({daysUntilExpiry} days left)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="font-medium mt-1 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2 text-emerald-600" />
                      {formatDate(request.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs text-gray-500 mb-2">Your Message</p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
                  </div>
                </div>

                {request.adminResponse && (
                  <div className="mt-6">
                    <p className="text-xs text-gray-500 mb-2">Admin Response</p>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800 whitespace-pre-wrap">{request.adminResponse}</p>
                    </div>
                  </div>
                )}

                {request.adminNotes && request.status === 'rejected' && (
                  <div className="mt-6">
                    <p className="text-xs text-gray-500 mb-2">Reason for Not Approving</p>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-800 whitespace-pre-wrap">{request.adminNotes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tenant Information */}
              {tenant && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    Your Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium mt-1">{tenant.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="font-medium mt-1 flex items-center">
                        <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {tenant.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-medium mt-1 flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {tenant.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Information */}
              {admin && request.status !== 'pending' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    Assigned Agent
                  </h2>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{admin.fullName || 'SackAgent Team'}</p>
                      <p className="text-sm text-gray-500">Property Manager</p>
                      {admin.email && (
                        <a href={`mailto:${admin.email}`} className="text-sm text-emerald-600 hover:underline flex items-center mt-1">
                          <EnvelopeIcon className="w-4 h-4 mr-1" />
                          {admin.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Lease Information Tab */}
          {activeTab === 'lease' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ReceiptPercentIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Lease Agreement
              </h2>
              
              {request.leaseInfo ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-xs text-emerald-700">Lease Start Date</p>
                      <p className="text-lg font-bold text-emerald-800 mt-1">
                        {formatDate(request.leaseInfo.startDate)}
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-700">Lease End Date</p>
                      <p className="text-lg font-bold text-amber-800 mt-1">
                        {formatDate(request.leaseInfo.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Rent</p>
                      <p className="font-bold text-gray-900 mt-1">{formatPrice(request.leaseInfo.monthlyRent)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-2">Lease Terms</p>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700">{request.leaseInfo.terms || 'Standard 1-year lease agreement'}</p>
                    </div>
                  </div>

                  {request.leaseInfo.specialConditions && request.leaseInfo.specialConditions.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Special Conditions</p>
                      <ul className="list-disc list-inside space-y-1">
                        {request.leaseInfo.specialConditions.map((condition, index) => (
                          <li key={index} className="text-sm text-gray-700">{condition}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <CheckBadgeIcon className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Auto-renewal</p>
                      <p className="text-xs text-blue-700">
                        {request.leaseInfo.autoRenew 
                          ? 'Your lease will automatically renew at the end of the term.' 
                          : 'Your lease does not automatically renew. Contact property management for renewal.'}
                      </p>
                    </div>
                  </div>

                  {request.leaseInfo.signedAt && (
                    <div className="text-right text-sm text-gray-500">
                      Signed on {formatDate(request.leaseInfo.signedAt)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Lease Information Yet</h3>
                  <p className="text-gray-600">
                    {request.status === 'pending' 
                      ? 'Lease details will be available once your request is approved.'
                      : request.status === 'rejected' || request.status === 'cancelled'
                      ? 'This request was not approved, so no lease was created.'
                      : 'Lease information is being prepared and will be available soon.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Payment Details Tab */}
          {activeTab === 'payment' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BanknotesIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Payment Information
              </h2>
              
              {request.paymentDetails ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatPrice(request.paymentDetails.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Method</p>
                      <p className="font-medium mt-1 capitalize">
                        {request.paymentDetails.method?.replace(/_/g, ' ') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reference</p>
                      <p className="font-mono text-sm mt-1">{request.paymentDetails.reference || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Date</p>
                      <p className="font-medium mt-1">{formatDate(request.paymentDetails.paymentDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    {request.paymentDetails.verified ? (
                      <>
                        <CheckCircleSolidIcon className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Payment Verified</p>
                          <p className="text-xs text-green-700">
                            Verified on {formatDate(request.paymentDetails.verifiedAt)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <ClockIcon className="w-6 h-6 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Payment Pending Verification</p>
                          <p className="text-xs text-yellow-700">
                            Your payment is being processed and verified.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BanknotesIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Information</h3>
                  <p className="text-gray-600">
                    Payment details will appear here once your request is approved and processed.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
              <div className="p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationCircleIcon className="w-8 h-8 text-red-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Cancel Rental Request?
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to cancel your request for{' '}
                  <span className="font-semibold">{property?.title || 'this property'}</span>?
                  This action cannot be undone.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Request ID:</span>
                    <span className="font-mono font-medium">{request._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="font-medium">{formatDate(request.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Move-in Date:</span>
                    <span className="font-medium">{formatDate(request.requestedMoveInDate)}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Keep Request
                  </button>
                  <button
                    onClick={handleCancelRequest}
                    disabled={cancelling}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  )
}