'use client'

import React, { useState, useEffect } from 'react'
import PropertyListings from '../../../components/Property/PropertyListings'
import Navbar from '../../../components/Home/navbar'
import Footer from '../../../components/Home/footer'
import { useProperty } from '../../../context/PropertyContext'
import { Property } from '../../../types/property'
import BuySellSearchBar, { SearchFilters } from '../../../components/Home/Buy&SellSearchBar'

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

  // Initialize with all available properties - SORTED BY DATE (LATEST FIRST)
  useEffect(() => {
    const availableProps = properties
      .filter(p => p.propertyFor === 'sale' || p.status === 'bought')
      .sort((a, b) => {
        // Sort by createdAt date - latest first
        const dateA = new Date(a.createdAt || a.listedDate || 0).getTime()
        const dateB = new Date(b.createdAt || b.listedDate || 0).getTime()
        return dateB - dateA // Descending order (newest first)
      })
    setFilteredProperties(availableProps)
  }, [properties])

  const handleSearch = (filters: SearchFilters) => {
    let filtered = [...properties]
    
    // Filter by property for - only for sale
    filtered = filtered.filter(p => p.propertyFor === 'sale')
    
    // Apply type filter
    if (filters.type !== 'all') {
      const selectedType = filters.type as Property['propertyType']
      filtered = filtered.filter(p => p.propertyType === selectedType)
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
    
    // SORT filtered results by date (latest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.listedDate || 0).getTime()
      const dateB = new Date(b.createdAt || b.listedDate || 0).getTime()
      return dateB - dateA // Newest first
    })
    
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Property to Buy</h1>
              <p className="text-gray-600 mb-6">Search through our verified properties and contact us for more information on the property.</p>
              <p className='font-bold md:text-4xl text-emerald-600'>Or sell your property, <a href="/contact-us" className="text-emerald-600 hover:underline">Contact Us</a></p>
              <BuySellSearchBar onSearch={handleSearch} initialFilters={activeFilters || undefined} />
              
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