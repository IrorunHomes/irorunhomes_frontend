
'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useTenantRentalRequest } from '../../../../context/RentalRequestContext'
import { useUser } from '../../../../context/UserContext'
import DashboardLayout from '../../DashboardLayout'
import {
  HomeModernIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

export default function TenantLeasePage() {
  const router = useRouter()
  const { user } = useUser()
  const { currentLease, fetchTenantLease, loadingLeases } = useTenantRentalRequest()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchTenantLease()
  }, [user])

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '₦0'
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loadingLeases) {
    return (
      <DashboardLayout activeTab="lease" onTabChange={() => {}}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!currentLease) {
    return (
      <DashboardLayout activeTab="lease" onTabChange={() => {}}>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HomeModernIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Lease</h2>
          <p className="text-gray-600 mb-6">
            You dont have any active lease at the moment.
          </p>
          <Link
            href="/dashboard/tenant"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Browse Properties
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const property = currentLease.property
  const leaseInfo = currentLease.leaseInfo
  const metrics = currentLease.metrics || {
    daysRemaining: 0,
    percentComplete: 0,
    isExpiringSoon: false
  }

  return (
    <DashboardLayout activeTab="lease" onTabChange={() => {}}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Active Lease</h1>
          <p className="text-emerald-600 mt-2">
            View and manage your current lease agreement
          </p>
        </div>

        {/* Lease Progress Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl shadow-lg p-6 border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Lease Progress</h2>
            {metrics.isExpiringSoon && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <ExclamationCircleIcon className="w-3.5 h-3.5 mr-1" />
                Expiring Soon
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(leaseInfo?.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">End Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(leaseInfo?.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Days Remaining</p>
              <p className="text-lg font-semibold text-gray-900">{metrics.daysRemaining} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <div className="flex items-center">
                <div className="flex-1 h-2 bg-gray-200 rounded-full mr-3">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${metrics.percentComplete}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">{metrics.percentComplete}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Property Details
              </h2>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-48 flex-shrink-0">
                  <div className="relative h-40 w-full rounded-xl overflow-hidden bg-gray-100">
                    {property?.media?.images?.[0] ? (
                      <Image
                        src={property.media.images[0].url}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                        <HomeModernIcon className="w-12 h-12 text-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{property?.title}</h3>
                  
                  <div className="flex items-start text-gray-600 mb-3">
                    <MapPinIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{property?.address}, {property?.city}, {property?.state}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Property Type</p>
                      <p className="font-medium capitalize">{property?.apartmentType?.replace(/-/g, ' ')}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Bedrooms</p>
                      <p className="font-medium">{property?.features?.bedrooms || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Bathrooms</p>
                      <p className="font-medium">{property?.features?.bathrooms || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Toilets</p>
                      <p className="font-medium">{property?.features?.toilet || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lease Terms Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentDuplicateIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Lease Terms
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Rent</p>
                    <p className="text-xl font-bold text-emerald-700">
                      {formatCurrency(leaseInfo?.monthlyRent)}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Lease Agreement</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{leaseInfo?.terms}</p>
                </div>

                {leaseInfo?.specialConditions && leaseInfo.specialConditions.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-800 mb-2">Special Conditions</p>
                    <ul className="list-disc list-inside space-y-1">
                      {leaseInfo.specialConditions.map((condition, index) => (
                        <li key={index} className="text-sm text-blue-700">{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 text-emerald-600 mr-2" />
                    <span className="text-sm text-gray-700">Auto-renewal</span>
                  </div>
                  {leaseInfo?.autoRenew ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Disabled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Landlord & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Payment Summary
              </h2>

              {currentLease.paymentDetails ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Payment</span>
                    <span className="font-medium">{formatDate(currentLease.paymentDetails.paymentDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-bold text-emerald-700">
                      {formatCurrency(currentLease.paymentDetails.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="capitalize">{currentLease.paymentDetails.method?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reference</span>
                    <span className="font-mono text-xs">{currentLease.paymentDetails.reference}</span>
                  </div>
                  {currentLease.paymentDetails.verified && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-green-600 flex items-center">
                        <CheckCircleSolidIcon className="w-4 h-4 mr-1" />
                        Payment Verified on {formatDate(currentLease.paymentDetails.verifiedAt)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No payment information available</p>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <Link
                  href={`/properties/${property?._id}`}
                  className="block w-full px-4 py-2.5 bg-emerald-600 text-white text-center rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  View Property Details
                </Link>
                {leaseInfo?.endDate && new Date(leaseInfo.endDate) < new Date() ? (
                  <Link href={`/dashboard/tenant/active-lease/${currentLease?._id}/renew`} className="block w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Renew Lease
                  </Link>
                ) : null}
                
                {leaseInfo?.autoRenew ? (
                  <button className="block w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Disable Auto-renewal
                  </button>
                ) : (
                  <button className="block w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Enable Auto-renewal
                  </button>
                )}
                <Link
                  href="/dashboard/tenant/payments"
                  className="block w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  View Payment History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}