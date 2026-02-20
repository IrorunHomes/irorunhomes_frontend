// components/dashboard/properties/PropertyGrid.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useProperty } from '../../../../context/PropertyContext'
import {
  HomeModernIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  MapPinIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { Property, PropertyStatus, ApartmentType } from '../../../../types/property'

interface PropertyGridProps {
  viewMode: 'grid' | 'list'
  properties: Property[]
  isLoading?: boolean
  showActions?: boolean
}

const statusConfig: Record<PropertyStatus, { color: string; icon: typeof CheckCircleIcon; label: string }> = {
  available: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Available' },
  rented: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, label: 'Rented' },
  maintenance: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Maintenance' },
  pending: { color: 'bg-amber-100 text-amber-800', icon: ClockIcon, label: 'Pending' }
}

const apartmentTypeLabels: Record<ApartmentType, string> = {
  'a-room': 'A Room',
  'self-contained': 'Self Contained',
  'room-and-parlour': 'Room & Parlour',
  'two-bedroom': 'Two Bedroom',
  'three-bedroom': 'Three Bedroom',
  'flat': 'Flat',
  'others': 'Others'
}

export default function PropertyGrid({ 
  viewMode, 
  properties, 
  isLoading = false, 
  showActions = true 
}: PropertyGridProps) {
  const router = useRouter()
  const { deleteProperty } = useProperty()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleViewDetails = (propertyId: string) => {
    router.push(`/dashboard/admin/properties/${propertyId}`)
  }

  const handleEditProperty = (propertyId: string) => {
    router.push(`/dashboard/admin/properties/edit/${propertyId}`)
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    
    setDeletingId(propertyId)
    try {
      const result = await deleteProperty(propertyId)
      if (!result.success) {
        alert(result.message || 'Failed to delete property')
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Failed to delete property')
    } finally {
      setDeletingId(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-emerald-200"></div>
            <div className="p-4 space-y-4">
              <div className="h-4 bg-emerald-200 rounded"></div>
              <div className="h-3 bg-emerald-200 rounded w-2/3"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-emerald-200 rounded w-1/3"></div>
                <div className="h-3 bg-emerald-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <HomeModernIcon className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-emerald-900 mb-2">No Properties Found</h3>
        <p className="text-emerald-600">Try adjusting your filters or add a new property</p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-50/50 border-b border-emerald-100">
                <th className="text-left p-4 font-medium text-emerald-700">Property</th>
                <th className="text-left p-4 font-medium text-emerald-700">Type</th>
                <th className="text-left p-4 font-medium text-emerald-700">Status</th>
                <th className="text-left p-4 font-medium text-emerald-700">Price</th>
                <th className="text-left p-4 font-medium text-emerald-700">Views</th>
                <th className="text-left p-4 font-medium text-emerald-700">Landlord</th>
                {showActions && (
                  <th className="text-left p-4 font-medium text-emerald-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {properties.map((property) => {
                const StatusIcon = statusConfig[property.status].icon
                const statusColor = statusConfig[property.status].color
                
                return (
                  <tr 
                    key={property._id} 
                    className="hover:bg-emerald-50/30 transition-colors group"
                    onClick={() => handleViewDetails(property._id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {property.media?.images?.[0] ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                              <Image
                                src={property.media.images[0].url}
                                alt={property.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <HomeModernIcon className="w-6 h-6 text-emerald-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-emerald-900 truncate group-hover:text-emerald-700">
                            {property.title}
                          </p>
                          <p className="text-sm text-emerald-600 truncate max-w-xs">
                            {property.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm capitalize">
                        {apartmentTypeLabels[property.apartmentType]}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${statusColor.replace('bg-', 'text-').replace(' text-', '')}`} />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                          {statusConfig[property.status].label}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-emerald-900">
                      {formatCurrency(property.price)}/mo
                    </td>
                    <td className="p-4 text-emerald-700">
                      <div className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {property.views || 0}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                          <UserCircleIcon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm text-emerald-700 truncate max-w-[120px]">
                          {property.landlordInfo?.personalInfo?.fullName || 'N/A'}
                        </span>
                      </div>
                    </td>
                    {showActions && (
                      <td className="p-4">
                        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleViewDetails(property._id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditProperty(property._id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit Property"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property._id)}
                            disabled={deletingId === property._id}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Property"
                          >
                            {deletingId === property._id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <TrashIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Grid View
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => {
        const statusColor = statusConfig[property.status].color
        
        return (
          <div
            key={property._id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
          >
            {/* Property Image */}
            <div className="relative h-48 bg-emerald-100 overflow-hidden">
              {property.media?.images?.[0] ? (
                <div className="relative w-full h-full">
                  <Image
                    src={property.media.images[0].url}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-400 opacity-20"></div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                  {statusConfig[property.status].label}
                </span>
              </div>
              
              {/* Price Badge */}
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-900 rounded-lg font-bold">
                  {formatCurrency(property.price)}/mo
                </span>
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            </div>
            
            {/* Property Details */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 
                  className="font-bold text-emerald-900 line-clamp-1 cursor-pointer hover:text-emerald-700"
                  onClick={() => handleViewDetails(property._id)}
                >
                  {property.title}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Add to favorites logic here
                  }}
                  className="p-1 text-gray-400 hover:text-amber-500 transition-colors"
                >
                  <StarIcon className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-emerald-600 mb-3 line-clamp-2">
                {property.description.substring(0, 100)}...
              </p>
              
              {/* Location */}
              <div className="flex items-center text-sm text-emerald-700 mb-3">
                <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{property.address}</span>
              </div>
              
              {/* Features */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-emerald-700">
                  <span className="flex items-center">
                    <HomeModernIcon className="w-4 h-4 mr-1" />
                    {property.features?.bedrooms || 0} BR
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {property.features?.bathrooms || 0} BA
                  </span>
                  <span className="flex items-center">
                    <EyeIcon className="w-4 h-4 mr-1" />
                    {property.views || 0}
                  </span>
                </div>
                
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded capitalize">
                  {apartmentTypeLabels[property.apartmentType]}
                </span>
              </div>
              
              {/* Landlord & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-emerald-100">
                <div>
                  <p className="text-xs text-emerald-500">Landlord</p>
                  <p className="text-sm font-medium text-emerald-900 truncate max-w-[120px]">
                    {property.landlordInfo?.personalInfo?.fullName || 'N/A'}
                  </p>
                </div>
                
                {showActions && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(property._id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditProperty(property._id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit Property"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}