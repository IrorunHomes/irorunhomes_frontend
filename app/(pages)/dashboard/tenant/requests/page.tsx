'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useRentalRequest } from '../../../../context/RentalRequestContext'
import { useUser } from '../../../../context/UserContext'
import { 
  HomeModernIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  MapPinIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import { RentalRequest, RentalRequestStatus } from '../../../../types/rentalRequest'
import { Property } from '../../../../types/property'
import DashboardLayout from '../../DashboardLayout'

export default function TenantRequestsPage() {
  const router = useRouter()
  const { user } = useUser()
  const { myRequests, fetchMyRequests, loadingRequests, cancelRequest } = useRentalRequest()
  
  const [filteredRequests, setFilteredRequests] = useState<RentalRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RentalRequestStatus | 'all'>('all')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/dashboard/tenant/requests')
      return
    }
    
    fetchMyRequests()
  }, [user, router, fetchMyRequests])

  // Filter requests based on search and status
  useEffect(() => {
    if (!myRequests || !Array.isArray(myRequests)) {
      setFilteredRequests([])
      return
    }

    let filtered = [...myRequests]

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((req): req is RentalRequest => 
        req.status === statusFilter
      )
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(req => {
        const property = req.property as Property
        return (
          property?.title?.toLowerCase().includes(term) ||
          property?.address?.toLowerCase().includes(term) ||
          property?.city?.toLowerCase().includes(term) ||
          req._id?.toLowerCase().includes(term)
        )
      })
    }

    setFilteredRequests(filtered)
  }, [myRequests, statusFilter, searchTerm])

  const handleViewDetails = (requestId: string) => {
    router.push(`/dashboard/tenant/requests/${requestId}`)
  }

  const handleCancelClick = (request: RentalRequest) => {
    setSelectedRequest(request)
    setShowCancelModal(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedRequest) return
    
    setCancellingId(selectedRequest._id)
    try {
      const result = await cancelRequest(selectedRequest._id)
      if (result.success) {
        setShowCancelModal(false)
        setSelectedRequest(null)
        // Refresh the list
        await fetchMyRequests()
      }
    } catch (error) {
      console.error('Failed to cancel request:', error)
    } finally {
      setCancellingId(null)
    }
  }

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  // Get status badge
  const getStatusBadge = (status: RentalRequestStatus) => {
    const statusConfig: Record<RentalRequestStatus, {
      color: string
      icon: React.ComponentType<{ className?: string }>
      label: string
    }> = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ClockIcon,
        label: 'Pending Review'
      },
      approved: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircleIcon,
        label: 'Approved'
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircleIcon,
        label: 'Rejected'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: ExclamationCircleIcon,
        label: 'Cancelled'
      },
      active_lease: {
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: CheckCircleSolidIcon,
        label: 'Active Lease'
      },
      expired_lease: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: ExclamationCircleIcon,
        label: 'Expired'
      },
      completed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircleIcon,
        label: 'Completed'
      },
      renewal_pending: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: ClockIcon,
        label: 'Renewal Pending'
      }
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5 mr-1" />
        {config.label}
      </span>
    )
  }

  // Calculate days since request
  const getDaysSince = (date: Date | string) => {
    const requestDate = new Date(date)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - requestDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  // Get expiration status
  const getExpirationStatus = (expiresAt: Date | string) => {
    const expiryDate = new Date(expiresAt)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Expired'
    if (diffDays <= 2) return 'Expires soon'
    return `${diffDays} days left`
  }

  if (loadingRequests) {
    return (
      <DashboardLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your requests...</p>
        </div>
      </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="dashboard" onTabChange={() => {}}>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Rental Requests</h1>
          <p className="text-gray-600 mt-2">
            Track and manage all your property rental requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{myRequests?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {myRequests?.filter((r): r is RentalRequest => r.status === 'pending').length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {myRequests?.filter((r): r is RentalRequest => 
                    r.status === 'approved' || r.status === 'active_lease'
                  ).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Leases</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {myRequests?.filter((r): r is RentalRequest => r.status === 'active_lease').length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <HomeModernIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by property name, location or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RentalRequestStatus | 'all')}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
                <option value="active_lease">Active Lease</option>
                <option value="expired_lease">Expired Lease</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchMyRequests()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const property = request.property as Property
              return (
                <div
                  key={request._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Property Image */}
                      <div className="lg:w-48 flex-shrink-0">
                        <div className="relative h-32 w-full lg:w-48 rounded-lg overflow-hidden bg-gray-100">
                          {property?.media?.images?.[0] ? (
                            <Image
                              src={property.media.images[0].url}
                              alt={property.title || 'Property'}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 192px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
                              <HomeModernIcon className="w-8 h-8 text-emerald-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-emerald-700">
                              <Link href={`/properties/${property?._id}`}>
                                {property?.title || 'Property Unavailable'}
                              </Link>
                            </h3>
                            
                            <div className="flex items-center text-gray-600 mt-1">
                              <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                              <p className="text-sm">
                                {property?.address}, {property?.city}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              {getStatusBadge(request.status)}
                              
                              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                                Move-in: {formatDate(request.requestedMoveInDate)}
                              </span>

                              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                <ClockIcon className="w-3.5 h-3.5 mr-1" />
                                {request.duration} months
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500">Annual Rent</p>
                            <p className="text-xl font-bold text-emerald-700">
                              {formatPrice(property?.price || 0)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Requested {getDaysSince(request.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Message Preview */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            <span className="font-medium text-gray-700">Your message: </span>
                            {request.message}
                          </p>
                        </div>

                        {/* Request Info & Actions */}
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center text-xs text-gray-500">
                            <DocumentTextIcon className="w-4 h-4 mr-1" />
                            Request ID: {request._id.slice(-8).toUpperCase()}
                            <span className="mx-2">•</span>
                            <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                            {getExpirationStatus(request.expiresAt)}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(request._id)}
                              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
                            >
                              <EyeIcon className="w-4 h-4 mr-2" />
                              View Details
                              <ChevronRightIcon className="w-4 h-4 ml-1" />
                            </button>

                            {request.status === 'pending' && (
                              <button
                                onClick={() => handleCancelClick(request)}
                                disabled={cancellingId === request._id}
                                className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                {cancellingId === request._id ? 'Cancelling...' : 'Cancel Request'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // Empty State
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rental requests found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'No requests match your search criteria. Try adjusting your filters.'
                : "You haven't submitted any rental requests yet. Browse available properties and submit your first request!"}
            </p>
            <Link
              href="/properties"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <HomeModernIcon className="w-5 h-5 mr-2" />
              Browse Properties
            </Link>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && selectedRequest && (
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
                  <span className="font-semibold">
                    {(selectedRequest.property as Property)?.title || 'this property'}
                  </span>?
                  This action cannot be undone.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Request ID:</span>
                    <span className="font-mono font-medium">{selectedRequest._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="font-medium">{formatDate(selectedRequest.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Move-in Date:</span>
                    <span className="font-medium">{formatDate(selectedRequest.requestedMoveInDate)}</span>
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
                    onClick={handleConfirmCancel}
                    disabled={cancellingId === selectedRequest._id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {cancellingId === selectedRequest._id ? 'Cancelling...' : 'Yes, Cancel'}
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