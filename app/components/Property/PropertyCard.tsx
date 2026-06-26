'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { PropertyCardProps, ApartmentType, PropertyType } from '../../types/property'

// Map apartment types to display names
const apartmentTypeLabels: Record<ApartmentType, string> = {
  'a-room': 'Single Room',
  'office': 'Office Space',
  'complex': 'Complex',
  'shop': 'Shop',
  'self-contained': 'Self Contained',
  'room-and-parlour': 'Room & Parlour',
  'two-bedroom': '2 Bedroom',
  'three-bedroom': '3 Bedroom',
  'flat': 'Flat',
  'others': 'Other'
}

const propertyTypeLabels: Record<PropertyType, string> = {
  'apartment': 'Apartment',
  'land': 'Land',
  'house': 'House',
  'commercial': 'Commercial',
  'industrial': 'Industrial',
  'other': 'Other'
}

// Map status to colors
const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  rented: 'bg-gray-100 text-gray-800',
  bought: 'bg-purple-100 text-purple-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-blue-100 text-blue-800',
  unavailable: 'bg-red-100 text-red-800'
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFeatured = false,
  onFavoriteClick,
  onCardClick
}) => {
  const [isFavorite, setIsFavorite] = useState(false)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    onFavoriteClick?.()
  }

  // Get first image or placeholder
  const mainImage = property.media?.images?.[0]?.url || '/property-placeholder.jpg'
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(property.price)

  // Get the correct type label based on propertyFor
  const getTypeLabel = () => {
    if (property.propertyFor === 'rent') {
      return apartmentTypeLabels[property.apartmentType as ApartmentType] || property.apartmentType
    } else if (property.propertyFor === 'sale') {
      return propertyTypeLabels[property.propertyType as PropertyType] || property.propertyType
    }
    return 'Property'
  }

  // Get the type icon based on propertyFor
  const getTypeIcon = () => {
    if (property.propertyFor === 'rent') {
      return (
        <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
        </svg>
      )
    } else {
      return (
        <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  return (
    <div 
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-emerald-200"
      onClick={onCardClick}
    >
      {/* Property Image */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {/* Image */}
        <div className="relative w-full h-full">
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            priority={false}
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${statusColors[property.status] || 'bg-gray-100 text-gray-800'}`}>
              {property.status?.toUpperCase() || 'AVAILABLE'}
            </span>
          </div>
          
          {/* Featured Badge */}
          {isFeatured && (
            <div className="absolute top-9 left-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-green-700 text-white text-[10px] font-bold">
                <svg className="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                FEATURED
              </span>
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg 
              className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </button>
          
          {/* Price Tag */}
          <div className="absolute bottom-2 left-2">
            <div className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm">
              <span className="text-lg font-bold text-emerald-700">{formattedPrice}</span>
              <span className="text-xs text-gray-600 ml-1">/{property.propertyFor === 'rent' ? 'Yearly' : 'Sale'}</span>
            </div>
          </div>
          
          {/* Image Counter */}
          {property.media?.images?.length > 1 && (
            <div className="absolute bottom-2 right-2">
              <div className="px-2 py-1 bg-black/70 text-white rounded-full text-xs backdrop-blur-sm">
                +{property.media.images.length - 1}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4">
        {/* Title and Address */}
        <div className="mb-3">
          <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-1">
            {property.title} 
          </h3>
          <p className="text-gray-600 text-sm mt-1 truncate">
            {property.address}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {property.city}, {property.state}
          </p>
        </div>

        {/* Property Type Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {/* Main Type Badge */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-xs">
            {getTypeIcon()}
            {getTypeLabel()}
          </span>
          
          {/* Property For Badge */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium text-xs ${
            property.propertyFor === 'rent' 
              ? 'bg-blue-50 text-blue-700' 
              : 'bg-purple-50 text-purple-700'
          }`}>
            {property.propertyFor === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          
          {/* Parking Badge */}
          {property.features?.parking && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium text-xs">
              <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Parking
            </span>
          )}
          
          {/* Kitchen Badge */}
          {property.features?.kitchen && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium text-xs">
              <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Kitchen
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default PropertyCard