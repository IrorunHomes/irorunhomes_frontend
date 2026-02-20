// app/(pages)/dashboard/tenant/requests/[id]/payment/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useTenantRentalRequest } from '../../../../../../context/RentalRequestContext'
import { useUser } from '../../../../../../context/UserContext'
import { PaymentMethod, RentalRequest } from '../../../../../../types/rentalRequest'
import { Property } from '../../../../../../types/property'
import {
  ArrowLeftIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import DashboardLayout from '../../../../DashboardLayout'

export default function TenantPaymentUploadPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { getRequest, uploadPaymentReceipt, loadingAction } = useTenantRentalRequest()

  const [request, setRequest] = useState<RentalRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '' as PaymentMethod | '',
    referenceNumber: ''
  })
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const loadRequest = async () => {
      if (!params.id) return
      setLoading(true)
      try {
        const result = await getRequest(params.id as string)
        if (result) {
          setRequest(result)
          // Pre-fill amount with property price
          if (result.property && 'price' in result.property) {
            const property = result.property as Property
            setFormData(prev => ({ ...prev, amount: property.price.toString() }))
          }
        }
      } catch (error) {
        console.error('Error loading request:', error)
      } finally {
        setLoading(false)
      }
    }
    loadRequest()
  }, [params.id, getRequest])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, receipt: 'Please upload a JPG, PNG, or PDF file' }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, receipt: 'File size must be less than 5MB' }))
      return
    }

    setReceiptFile(file)
    setErrors(prev => ({ ...prev, receipt: '' }))

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setReceiptPreview(null)
    }
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method'
    }

    if (!formData.referenceNumber) {
      newErrors.referenceNumber = 'Reference number is required'
    } else if (formData.referenceNumber.length < 5) {
      newErrors.referenceNumber = 'Reference number must be at least 5 characters'
    }

    if (!receiptFile) {
      newErrors.receipt = 'Please upload a payment receipt'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const result = await uploadPaymentReceipt(params.id as string, {
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod as PaymentMethod,
      referenceNumber: formData.referenceNumber,
      receiptImage: receiptFile || undefined
    })

    if (result.success) {
      setSubmitted(true)
    }
  }

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '₦0'
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <DashboardLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
      </DashboardLayout>
    )
  }

  if (!request) {
    return (
      <DashboardLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Not Found</h2>
          <p className="text-gray-600 mb-6">The rental request you are looking for does not exist.</p>
          <Link
            href="/dashboard/tenant/requests"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Requests
          </Link>
        </div>
      </div>
      </DashboardLayout>
    )
  }

  // Check if payment has already been uploaded
  const hasExistingPayment = request.paymentDetails && request.paymentDetails.receiptImage

  if (hasExistingPayment) {
    return (
      <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {request.paymentDetails.verified ? (
                <CheckCircleSolidIcon className="w-10 h-10 text-emerald-600" />
              ) : (
                <ClockIcon className="w-10 h-10 text-amber-600" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-">
              {request.paymentDetails.verified ? 'Payment Verified' : 'Payment Pending Verification'}
            </h2>
            
            <p className="text-gray-600">
              {request.paymentDetails.verified 
                ? 'Your payment has been verified and your lease is now active.'
                : 'Your payment receipt has been uploaded and is awaiting admin verification.'}
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(request.paymentDetails.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="capitalize">{request.paymentDetails.method?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono text-sm">{request.paymentDetails.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(request.paymentDetails.paymentDate || '').toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    request.paymentDetails.verified 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {request.paymentDetails.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              {request.paymentDetails.receiptImage && (
                <div className="mt-4">
                  <a
                    href={request.paymentDetails.receiptImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-800 text-sm flex items-center"
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                    View Receipt
                  </a>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Link
                href="/dashboard/tenant/requests"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Requests
              </Link>
              <Link
                href={`/dashboard/tenant/requests/${request._id}`}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                View Request Details
              </Link>
            </div>
          </div>
        </div>
      </div>
      </DashboardLayout>
    )
  }

  if (request.status !== 'approved') {
    return (
      <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClockIcon className="w-10 h-10 text-amber-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Not Available Yet</h2>
            
            <p className="text-gray-600 mb-6">
              This request is currently <span className="font-semibold capitalize">{request.status}</span>. 
              Payments can only be made for approved requests.
            </p>

            <div className="bg-amber-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-amber-800 mb-3">Request Status</h3>
              <div className="space-y-2">
                <div className="flex items-center text-amber-700">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  <span>Current Status: <span className="font-medium capitalize">{request.status}</span></span>
                </div>
                <div className="flex items-center text-amber-700">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  <span>Request submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                {request.respondedAt && (
                  <div className="flex items-center text-amber-700">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    <span>Last updated: {new Date(request.respondedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <Link
                href="/dashboard/tenant/requests"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Requests
              </Link>
              <Link
                href={`/dashboard/tenant/requests/${request._id}`}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                View Request Details
              </Link>
            </div>
          </div>
        </div>
      </div>
      </DashboardLayout>
    )
  }

  // Safely access property with type guard
  const property = request.property && 'title' in request.property 
    ? request.property as Property 
    : null

  if (submitted) {
    return (
      <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Uploaded!</h2>
            
            <p className="text-gray-600 mb-6">
              Your payment receipt has been uploaded successfully. 
              An admin will verify your payment within 24-48 hours.
            </p>

            <div className="bg-emerald-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-emerald-800 mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-emerald-700">
                  <span>Amount:</span>
                  <span className="font-bold">{formatCurrency(Number(formData.amount))}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Method:</span>
                  <span className="capitalize">{formData.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Reference:</span>
                  <span className="font-mono">{formData.referenceNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Link
                href="/dashboard/tenant/requests"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View All Requests
              </Link>
              <Link
                href={`/dashboard/tenant/requests/${request._id}`}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Track Status
              </Link>
            </div>
          </div>
        </div>
      </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Upload Payment Receipt</h1>
          <p className="text-gray-600 mt-1">
            Complete your payment to activate your lease
          </p>
        </div>

        {/* Status Banner */}
        <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-200">
          <div className="flex items-start">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-emerald-800">Approved Request</h4>
              <p className="text-sm text-emerald-700">
                Your request has been approved! Please make payment and upload the receipt to activate your lease.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCardIcon className="w-5 h-5 mr-2 text-emerald-600" />
            Payment Summary
          </h2>
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
                <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                  <BuildingOfficeIcon className="w-8 h-8 text-emerald-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{property?.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{property?.address}</p>
              <div className="flex items-center mt-2">
                <BanknotesIcon className="w-4 h-4 text-emerald-600 mr-1" />
                <span className="font-bold text-emerald-700">
                  {formatCurrency(property?.price)}
                </span>
                <span className="text-sm text-gray-500 ml-1">/year</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Move-in date: {new Date(request.requestedMoveInDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Pay <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="1"
                step="100"
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-400'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.paymentMethod
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-400'
              }`}
            >
              <option value="">Select payment method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
            </select>
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.paymentMethod}
              </p>
            )}
          </div>

          {/* Reference Number */}
          <div>
            <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Reference <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="referenceNumber"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              placeholder="Enter transaction reference number"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.referenceNumber
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-400'
              }`}
            />
            {errors.referenceNumber && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.referenceNumber}
              </p>
            )}
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Payment Receipt <span className="text-red-500">*</span>
            </label>
            <div className={`border-2 border-dashed rounded-lg p-6 ${
              errors.receipt ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
            }`}>
              <input
                type="file"
                id="receipt"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {receiptPreview ? (
                <div className="space-y-4">
                  <div className="relative h-48 w-full rounded-lg overflow-hidden">
                    <Image
                      src={receiptPreview}
                      alt="Receipt preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptFile(null)
                      setReceiptPreview(null)
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="receipt"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <CameraIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-sm font-medium text-emerald-600 mb-1">
                    Click to upload receipt
                  </span>
                  <span className="text-xs text-gray-500">
                    JPG, PNG or PDF (max 5MB)
                  </span>
                  {receiptFile && !receiptPreview && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg w-full">
                      <p className="text-sm text-gray-700">
                        Selected: {receiptFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptFile(null)
                          setReceiptPreview(null)
                        }}
                        className="text-xs text-red-600 hover:text-red-800 mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </label>
              )}
            </div>
            {errors.receipt && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.receipt}
              </p>
            )}
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800 mb-1">Important Information</h4>
                <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                  <li>Your payment will be verified within 24-48 hours</li>
                  <li>Once verified, your lease will be activated immediately</li>
                  <li>Keep your transaction reference for future reference</li>
                  <li>You will receive a confirmation email after verification</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loadingAction}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loadingAction ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Uploading...
              </>
            ) : (
              'Upload Payment Receipt'
            )}
          </button>
        </form>
      </div>
    </div>
    </DashboardLayout>
  )
}