'use client'

import React, { useState, useEffect } from 'react'
import PropertyListings from '../../components/Property/PropertyListings'
import Navbar from '../../components/Home/navbar'
import Footer from '../../components/Home/footer'
import SearchBar, { SearchFilters } from '../../components/Home/SearchBar'
import { useProperty } from '../../context/PropertyContext'
import { Property } from '../../types/property'

export default function PropertiesPage() {
  const { properties, loadingProperties, fetchProperties, addRemoveFavorite } = useProperty()
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(null)

    // Fetch properties on mount
    useEffect(() => {
      const loadProperties = async () => {
        await fetchProperties()
      }
      loadProperties()
    }, [])

  // Initialize with all available properties
  useEffect(() => {
    const availableProps = properties.filter(p => p.status === 'available')
    setFilteredProperties(availableProps)
  }, [properties])

  const handleSearch = (filters: SearchFilters) => {
    let filtered = [...properties]
    
    // Filter by status - only available
    filtered = filtered.filter(p => p.status === 'available')
    
    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(p => p.apartmentType === filters.type)
    }
    
    // Apply city filter
    if (filters.city !== 'all') {
      filtered = filtered.filter(p => p.city === filters.city)
    }
    
    // Apply price range
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!)
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!)
    }
    
    // Apply bedrooms filter
    if (filters.bedrooms !== 'all') {
      filtered = filtered.filter(p => p.features.bedrooms >= Number(filters.bedrooms!))
    }
    
    setFilteredProperties(filtered)
    setActiveFilters(filters)
  }

  const handleFavoriteClick = async (id: string, isCurrentlyFavorite: boolean) => {
    await addRemoveFavorite(id, isCurrentlyFavorite)
  }

  const handleCardClick = (id: string) => {
    window.location.href = `/properties/${id}`
  }

  const getActiveFiltersCount = () => {
    if (!activeFilters) return 0
    let count = 0
    if (activeFilters.type !== 'all') count++
    if (activeFilters.city !== 'all') count++
    if (activeFilters.minPrice) count++
    if (activeFilters.maxPrice) count++
    if (activeFilters.bedrooms !== 'all') count++
    return count
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar Section */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Property</h1>
              <p className="text-gray-600 mb-6">Search through our verified properties</p>
              <SearchBar onSearch={handleSearch} initialFilters={activeFilters || undefined} />
              
              {/* Active Filters Display */}
              {activeFilters && getActiveFiltersCount() > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {activeFilters.type !== 'all' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        Type: {activeFilters.type.replace('-', ' ')}
                      </span>
                    )}
                    {activeFilters.city !== 'all' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                        City: {activeFilters.city}
                      </span>
                    )}
                    {activeFilters.bedrooms !== 'all' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                        {activeFilters.bedrooms}+ Beds
                      </span>
                    )}
                    {activeFilters.minPrice && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        Min: ₦{activeFilters.minPrice.toLocaleString()}
                      </span>
                    )}
                    {activeFilters.maxPrice && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        Max: ₦{activeFilters.maxPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-emerald-700">{filteredProperties.length}</span> properties
              {activeFilters && getActiveFiltersCount() > 0 && ' matching your criteria'}
            </p>
          </div>

          {/* Property Listings */}
          {loadingProperties ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <PropertyListings 
              properties={filteredProperties}
              onFavoriteClick={handleFavoriteClick}
              onCardClick={handleCardClick}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}