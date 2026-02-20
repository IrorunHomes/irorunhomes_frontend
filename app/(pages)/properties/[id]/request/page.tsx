'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import RentalRequestForm from '../../../../components/Property/RentalRequestForm'
import { useProperty } from '../../../../context/PropertyContext'
import { useUser } from '../../../../context/UserContext'
import { Property } from '../../../../types/property'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function RentalRequestPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { fetchPublicProperty } = useProperty()
  
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get property ID from URL params
  const propertyId = params.id as string

  // Fetch property data
  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) return
      
      try {
        setLoading(true)
        setError(null)
        const propertyData = await fetchPublicProperty(propertyId)
        setProperty(propertyData)
      } catch (err) {
        console.error('Failed to load property:', err)
        setError('Failed to load property details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [propertyId, fetchPublicProperty])

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/properties/${propertyId}/request`)
    }
  }, [user, router, propertyId])

  const handleClose = () => {
    router.back()
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/properties')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Browse Properties
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="bg-white rounded-t-2xl border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-4"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Request to Rent</h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6">
          <RentalRequestForm
            property={property}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  )
}