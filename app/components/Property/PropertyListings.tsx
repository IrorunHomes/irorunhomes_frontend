
'use client'

import React from 'react'
import PropertyCard from './PropertyCard'
import { Property } from '../../types/property'

interface PropertyListingsProps {
  properties: Property[]
  onFavoriteClick?: (id: string, isCurrentlyFavorite: boolean) => void
  onCardClick?: (id: string) => void
}

const PropertyListings = ({ properties, onFavoriteClick, onCardClick }: PropertyListingsProps) => {
  if (!properties || properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Found</h3>
        <p className="text-gray-500">No properties match your search criteria. Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property._id}
          property={property}
          isFeatured={property.views > 100}
          onFavoriteClick={() => onFavoriteClick?.(property._id, false)}
          onCardClick={() => onCardClick?.(property._id)}
        />
      ))}
    </div>
  )
}

export default PropertyListings