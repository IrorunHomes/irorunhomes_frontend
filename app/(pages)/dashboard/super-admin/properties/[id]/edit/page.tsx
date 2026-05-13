// app/(pages)/dashboard/super-admin/properties/[id]/edit/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '../../../../DashboardLayout'
import PropertyForm from '../../../../../../components/Property/PropertyForm'
import { useProperty } from '../../../../../../context/PropertyContext'
import { useMessage } from '../../../../../../components/ui/MessagePopup'
import { Property } from '../../../../../../types/property'

export default function EditPropertyPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  const { fetchAdminProperty, loadingProperties } = useProperty()
  const { showError } = useMessage()
  const [loading, setLoading] = useState(true)
  const [propertyData, setPropertyData] = useState<Property | null>(null)

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        showError('Property ID is missing')
        router.push('/dashboard/super-admin/properties')
        return
      }

      try {
        setLoading(true)
        const property = await fetchAdminProperty(propertyId)
        setPropertyData(property)
      } catch (error) {
        showError('Failed to load property data. Please try again.', error)
        router.push('/dashboard/super-admin/properties')
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [propertyId, fetchAdminProperty, router, showError])

  if (loading || loadingProperties) {
    return (
      <DashboardLayout activeTab="edit-property" onTabChange={() => {}}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-emerald-700">Loading property data...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (!propertyData) {
    return (
      <DashboardLayout activeTab="edit-property" onTabChange={() => {}}>
        <div className="text-center py-12">
          <p className="text-red-600">Property not found</p>
          <button
            onClick={() => router.push('/dashboard/super-admin/properties')}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Properties
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="edit-property" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Edit Property</h1>
          <p className="text-emerald-600 mt-2">
            Edit the property details for <span className="font-semibold">{propertyData.title}</span>. Your progress is auto-saved.
          </p>
        </div>

        {/* Form - Pass the propertyId and initial data */}
        <PropertyForm propertyId={propertyId} initialData={propertyData} />
      </div>
    </DashboardLayout>
  )
}