

'use client'

import React, { useEffect, useMemo } from 'react'
import PropertyCard from './PropertyCard'
import { useProperty } from '../../context/PropertyContext'

const PropertyListings = () => {
  const { properties, fetchProperties, loadingProperties, addRemoveFavorite } = useProperty()

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // Filter to show only available properties
  const availableProperties = useMemo(() => {
    return properties.filter(property => property.status === 'available')
  }, [properties])

  const handleFavoriteClick = async (id: string, isCurrentlyFavorite: boolean) => {
    console.log(`Favorite toggled for property ${id}`)
    await addRemoveFavorite(id, isCurrentlyFavorite)
  }

  const handleCardClick = (id: string) => {
    console.log(`Card clicked for property ${id}`)
    // Navigate to property details
    window.location.href = `/properties/${id}`
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Loading State */}
        {loadingProperties ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-emerald-700">Loading properties...</span>
          </div>
        ) : (
          <>
            {/* Properties Grid - Adjusted for 5 cards */}
            {availableProperties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                  {availableProperties.map((property) => (
                    <PropertyCard
                      key={property._id}
                      property={property}
                      isFeatured={property.views > 100}
                      onFavoriteClick={() => handleFavoriteClick(property._id, false)}
                      onCardClick={() => handleCardClick(property._id)}
                    />
                  ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-10 md:mt-12">
                  <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl text-base inline-flex items-center">
                    View All Properties
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  <p className="mt-3 text-gray-600 text-sm">
                    Showing {availableProperties.length} available {availableProperties.length === 1 ? 'property' : 'properties'}
                  </p>
                </div>
              </>
            ) : (
              // No Properties Message
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Available</h3>
                <p className="text-gray-500">Check back later for new listings</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default PropertyListings