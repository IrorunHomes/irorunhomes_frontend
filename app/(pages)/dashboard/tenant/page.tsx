'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../(pages)/dashboard/DashboardLayout'
import PropertyListings from '../../../components/Property/PropertyListings'
import { useProperty } from '../../../context/PropertyContext'
import { Property, ApartmentType, PropertyType } from '../../../types/property'

export default function TenantDashboard() {
  const router = useRouter()
  const { properties, fetchProperties, loadingProperties, addRemoveFavorite } = useProperty()
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedPropertyFor, setSelectedPropertyFor] = useState('all')
  const [selectedApartmentType, setSelectedApartmentType] = useState('all')
  const [selectedPropertyType, setSelectedPropertyType] = useState('all')
  const [selectedBedrooms, setSelectedBedrooms] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const propertiesPerPage = 12

  // Handle card click - navigate to property details
  const handleCardClick = (propertyId: string) => {
    router.push(`/dashboard/tenant/properties/${propertyId}`)
  }

  // Handle favorite click
  const handleFavoriteClick = async (id: string, isCurrentlyFavorite: boolean) => {
    await addRemoveFavorite(id, isCurrentlyFavorite)
  }

  // Fetch properties on mount
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true)
      await fetchProperties()
      setIsLoading(false)
    }
    loadProperties()
  }, [fetchProperties])

  // Helper function to sort properties by date (latest first)
  const sortPropertiesByDate = (properties: Property[]): Property[] => {
    return [...properties].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.listedDate || 0).getTime()
      const dateB = new Date(b.createdAt || b.listedDate || 0).getTime()
      return dateB - dateA // Newest first
    })
  }

  // Use useMemo to memoize available properties - SORTED BY DATE (LATEST FIRST)
  const availableProperties = useMemo(() => {
    if (!properties || properties.length === 0) return []
    const filtered = properties.filter(p => p.status === 'available' || p.status === 'rented')
    return sortPropertiesByDate(filtered)
  }, [properties])

  // Apply filters
  useEffect(() => {
    if (availableProperties.length === 0) {
      setFilteredProperties([])
      return
    }

    let filtered = [...availableProperties]

    // Search by title or address
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(term) ||
        p.address?.toLowerCase().includes(term) ||
        p.city?.toLowerCase().includes(term)
      )
    }

    // Filter by property for (Rent/Sale)
    if (selectedPropertyFor !== 'all') {
      filtered = filtered.filter(p => p.propertyFor === selectedPropertyFor)
    }

    // Filter by apartment type (only when propertyFor is 'rent')
    if (selectedApartmentType !== 'all' && selectedPropertyFor !== 'sale') {
      filtered = filtered.filter(p => p.apartmentType === selectedApartmentType)
    }

    // Filter by property type (only when propertyFor is 'sale')
    if (selectedPropertyType !== 'all' && selectedPropertyFor !== 'rent') {
      filtered = filtered.filter(p => p.propertyType === selectedPropertyType)
    }

    // Filter by bedrooms
    if (selectedBedrooms !== 'all') {
      filtered = filtered.filter(p => (p.features?.bedrooms || 0) >= parseInt(selectedBedrooms))
    }

    // Filter by price range
    if (priceRange.min) {
      filtered = filtered.filter(p => (p.price || 0) >= parseInt(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => (p.price || 0) <= parseInt(priceRange.max))
    }

    // Apply sorting after filters (latest first)
    setFilteredProperties(sortPropertiesByDate(filtered))
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [availableProperties, searchTerm, selectedPropertyFor, selectedApartmentType, selectedPropertyType, selectedBedrooms, priceRange])

  const clearFilters = () => {
    setSearchTerm('')
    setPriceRange({ min: '', max: '' })
    setSelectedPropertyFor('all')
    setSelectedApartmentType('all')
    setSelectedPropertyType('all')
    setSelectedBedrooms('all')
    setCurrentPage(1)
  }

  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           priceRange.min !== '' || 
           priceRange.max !== '' || 
           selectedPropertyFor !== 'all' || 
           selectedApartmentType !== 'all' ||
           selectedPropertyType !== 'all' ||
           selectedBedrooms !== 'all'
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage)
  const startIndex = (currentPage - 1) * propertiesPerPage
  const endIndex = startIndex + propertiesPerPage
  const currentProperties = filteredProperties.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to top of properties section
      document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      // Calculate range around current page
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)
      
      // Adjust if at edges
      if (currentPage <= 2) {
        end = 4
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...')
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (end < totalPages - 1) {
        pages.push('...')
      }
      
      pages.push(totalPages)
    }
    
    return pages
  }

  // Apartment type options (for Rent)
  const apartmentTypeOptions: { value: ApartmentType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Apartment Types' },
    { value: 'a-room', label: 'Single Room' },
    { value: 'office', label: 'Office Space' },
    { value: 'complex', label: 'Complex' },
    { value: 'shop', label: 'Shop' },
    { value: 'self-contained', label: 'Self Contained' },
    { value: 'room-and-parlour', label: 'Room & Parlour' },
    { value: 'two-bedroom', label: '2 Bedroom' },
    { value: 'three-bedroom', label: '3 Bedroom' },
    { value: 'flat', label: 'Flat' },
    { value: 'others', label: 'Other' }
  ]

  // Property type options (for Sale)
  const propertyTypeOptions: { value: PropertyType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Property Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'land', label: 'Land' },
    { value: 'house', label: 'House' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'other', label: 'Other' }
  ]

  // Property for options (Rent/Sale)
  const propertyForOptions = [
    { value: 'all', label: 'All Properties' },
    { value: 'rent', label: 'For Rent' },
    { value: 'sale', label: 'For Sale' }
  ]

  const bedroomOptions = [
    { value: 'all', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' }
  ]

  // Show loading state while fetching
  if (isLoading || loadingProperties) {
    return (
      <DashboardLayout activeTab="dashboard" onTabChange={() => {}}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-emerald-700">Loading properties...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="dashboard" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome to Your Dashboard</h1>
          <p className="text-emerald-100">Browse and discover verified properties available</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by property name, address, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {/* Property For (Rent/Sale) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  value={selectedPropertyFor}
                  onChange={(e) => {
                    setSelectedPropertyFor(e.target.value)
                    setSelectedApartmentType('all')
                    setSelectedPropertyType('all')
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {propertyForOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Apartment Type (Rent) - Show only when Rent is selected */}
              {(selectedPropertyFor === 'rent' || selectedPropertyFor === 'all') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apartment Type</label>
                  <select
                    value={selectedApartmentType}
                    onChange={(e) => setSelectedApartmentType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {apartmentTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Property Type (Sale) - Show only when Sale is selected */}
              {(selectedPropertyFor === 'sale' || selectedPropertyFor === 'all') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select
                    value={selectedPropertyType}
                    onChange={(e) => setSelectedPropertyType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {propertyTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bedrooms Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <select
                  value={selectedBedrooms}
                  onChange={(e) => setSelectedBedrooms(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {bedroomOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₦)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-2 text-blue-500 hover:text-blue-700">×</button>
                </span>
              )}
              {selectedPropertyFor !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700">
                  {selectedPropertyFor === 'rent' ? 'For Rent' : 'For Sale'}
                  <button onClick={() => setSelectedPropertyFor('all')} className="ml-2 text-emerald-500 hover:text-emerald-700">×</button>
                </span>
              )}
              {selectedApartmentType !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                  Type: {apartmentTypeOptions.find(o => o.value === selectedApartmentType)?.label}
                  <button onClick={() => setSelectedApartmentType('all')} className="ml-2 text-purple-500 hover:text-purple-700">×</button>
                </span>
              )}
              {selectedPropertyType !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
                  Type: {propertyTypeOptions.find(o => o.value === selectedPropertyType)?.label}
                  <button onClick={() => setSelectedPropertyType('all')} className="ml-2 text-indigo-500 hover:text-indigo-700">×</button>
                </span>
              )}
              {selectedBedrooms !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700">
                  {selectedBedrooms}+ Bedrooms
                  <button onClick={() => setSelectedBedrooms('all')} className="ml-2 text-amber-500 hover:text-amber-700">×</button>
                </span>
              )}
              {priceRange.min && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                  Min: ₦{parseInt(priceRange.min).toLocaleString()}
                  <button onClick={() => setPriceRange(prev => ({ ...prev, min: '' }))} className="ml-2 text-green-500 hover:text-green-700">×</button>
                </span>
              )}
              {priceRange.max && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                  Max: ₦{parseInt(priceRange.max).toLocaleString()}
                  <button onClick={() => setPriceRange(prev => ({ ...prev, max: '' }))} className="ml-2 text-green-500 hover:text-green-700">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-emerald-700">{filteredProperties.length}</span> properties
            {hasActiveFilters() && ' matching your criteria'}
          </p>
          {hasActiveFilters() && (
            <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800">
              Clear all filters
            </button>
          )}
        </div>

        {/* Properties Section with id for scroll */}
        <div id="properties-section">
          {currentProperties.length > 0 ? (
            <>
              <PropertyListings 
                properties={currentProperties}
                onCardClick={handleCardClick}
                onFavoriteClick={handleFavoriteClick}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 mt-8">
                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        currentPage === 1
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Page Numbers */}
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400">…</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page as number)}
                          className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all ${
                            currentPage === page
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-emerald-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                    
                    {/* Next Button */}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        currentPage === totalPages
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* View More Button */}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      className="px-8 py-3 border-2 border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-colors font-medium flex items-center gap-2"
                    >
                      View More Properties
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Showing Info */}
                  <p className="text-sm text-gray-500">
                    Showing {startIndex + 1} - {Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} properties
                  </p>
                </div>
              )}
            </>
          ) : availableProperties.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Available</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                There are currently no properties available. Please check back later for new listings.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Matching Properties</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                No properties match your search criteria. Try adjusting your filters or clear the search.
              </p>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}