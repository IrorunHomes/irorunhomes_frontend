
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useTenantRentalRequest } from '../../../../../../context/RentalRequestContext'
import DashboardLayout from '../../../../DashboardLayout'
import {
  ArrowLeftIcon,
  HomeModernIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { RentalRequest } from '../../../../../../types/rentalRequest'

export default function TenantRenewalPage() {
  const params = useParams()
  const router = useRouter()
  const { getTenantLeaseById, requestRenewal, loadingAction } = useTenantRentalRequest()

  const [lease, setLease] = useState<RentalRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    message: '',
    preferredDuration: '12'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const loadLease = async () => {
      if (!params.id) return
      setLoading(true)
      const result = await getTenantLeaseById(params.id as string)
      if (result) {
        setLease(result)
      }
      setLoading(false)
    }
    loadLease()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.message.trim()) {
      newErrors.message = 'Please provide a reason for renewal'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const result = await requestRenewal(params.id as string, {
      message: formData.message,
      preferredDuration: parseInt(formData.preferredDuration)
    })

    if (result.success) {
      setSubmitted(true)
      setTimeout(() => {
        router.push('/dashboard/tenant/leases')
      }, 3000)
    }
  }

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

  const calculateDaysUntilExpiry = () => {
    if (!lease?.leaseInfo?.endDate) return 0
    const endDate = new Date(lease.leaseInfo.endDate)
    const now = new Date()
    return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="leases" onTabChange={() => {}}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!lease) {
    return (
      <DashboardLayout activeTab="leases" onTabChange={() => {}}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Lease Not Found</h2>
        </div>
      </DashboardLayout>
    )
  }

  const daysUntilExpiry = calculateDaysUntilExpiry()
  const property = lease.property

  if (submitted) {
    return (
      <DashboardLayout activeTab="leases" onTabChange={() => {}}>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Renewal Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your renewal request has been sent to the admin. You will be notified once it is processed.
          </p>
          <Link
            href="/dashboard/tenant/leases"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Leases
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="leases" onTabChange={() => {}}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Request Lease Renewal</h1>
          <p className="text-gray-600 mt-1">Submit a request to renew your lease</p>
        </div>

        {/* Lease Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Lease Details</h2>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {property?.media?.images?.[0] ? (
                <Image
                  src={property.media.images[0].url}
                  alt={property.title}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                  <HomeModernIcon className="w-8 h-8 text-emerald-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{property?.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{property?.address}</p>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="font-medium">{formatDate(lease.leaseInfo?.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Monthly Rent</p>
                  <p className="font-medium text-emerald-700">{formatCurrency(lease.leaseInfo?.monthlyRent)}</p>
                </div>
              </div>
              {daysUntilExpiry <= 60 && (
                <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center">
                  <ClockIcon className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-xs text-yellow-800">
                    Your lease expires in {daysUntilExpiry} days
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Renewal Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {/* Preferred Duration */}
          <div>
            <label htmlFor="preferredDuration" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Renewal Duration
            </label>
            <select
              id="preferredDuration"
              name="preferredDuration"
              value={formData.preferredDuration}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="6">6 months</option>
              <option value="12">12 months (1 year)</option>
              <option value="18">18 months</option>
              <option value="24">24 months (2 years)</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Renewal <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us why you'd like to renew your lease..."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.message
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-emerald-200'
              }`}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          {/* Important Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">What happens next?</h4>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Your request will be reviewed by the admin</li>
                  <li>You will be notified once a decision is made</li>
                  <li>If approved, your lease end date will be extended</li>
                  <li>Rent may be adjusted based on market rates</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loadingAction || daysUntilExpiry > 60}
            className={`w-full py-3 font-semibold rounded-lg transition-all ${
              daysUntilExpiry > 60
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:opacity-90'
            }`}
          >
            {daysUntilExpiry > 60
              ? `Renewal available in ${daysUntilExpiry - 60} days`
              : loadingAction
              ? 'Submitting...'
              : 'Submit Renewal Request'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}