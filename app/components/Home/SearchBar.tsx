

'use client'

import React, { useState, } from 'react'
import { useProperty } from '../../context/PropertyContext'
import { useRouter } from 'next/navigation'
import { ApartmentType } from '../../types/property'

const SearchBar = () => {
  const router = useRouter()
  const { properties } = useProperty()
  
  const [selectedType, setSelectedType] = useState<ApartmentType | 'all'>('all')
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [bedrooms, setBedrooms] = useState<number | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  
  // Extract unique cities and types from properties
  const uniqueCities = Array.from(new Set(properties.map(p => p.city).filter(Boolean)))

  // Property type options with labels
  const propertyTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'a-room', label: 'Single Room' },
    { value: 'self-contained', label: 'Self Contained' },
    { value: 'room-and-parlour', label: 'Room & Parlour' },
    { value: 'two-bedroom', label: 'Two Bedroom' },
    { value: 'three-bedroom', label: 'Three Bedroom' },
    { value: 'flat', label: 'Flat' },
    { value: 'others', label: 'Other' }
  ]

  // Bedroom options
  const bedroomOptions = [
    { value: 'all', label: 'Any Bedrooms' },
    { value: '1', label: '1+ Bedroom' },
    { value: '2', label: '2+ Bedrooms' },
    { value: '3', label: '3+ Bedrooms' },
    { value: '4', label: '4+ Bedrooms' },
    { value: '5', label: '5+ Bedrooms' }
  ]

  // Handle search
  const handleSearch = async () => {
    setIsSearching(true)
    
    // Build query parameters
    const queryParams = new URLSearchParams()
    
    if (selectedType !== 'all') queryParams.append('type', selectedType)
    if (selectedCity !== 'all') queryParams.append('city', selectedCity)
    if (priceRange.min) queryParams.append('minPrice', priceRange.min)
    if (priceRange.max) queryParams.append('maxPrice', priceRange.max)
    if (bedrooms !== 'all') queryParams.append('bedrooms', bedrooms.toString())
    
    // Navigate to search results page
    const queryString = queryParams.toString()
    router.push(`/properties/search${queryString ? `?${queryString}` : ''}`)
    
    // Simulate API call delay
    setTimeout(() => setIsSearching(false), 500)
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedType('all')
    setSelectedCity('all')
    setPriceRange({ min: '', max: '' })
    setBedrooms('all')
  }

  // Check if any filter is active
  const hasActiveFilters = () => {
    return selectedType !== 'all' || 
           selectedCity !== 'all' || 
           priceRange.min || 
           priceRange.max || 
           bedrooms !== 'all'
  }

  // Get display labels
  const getTypeLabel = () => {
    const option = propertyTypeOptions.find(opt => opt.value === selectedType)
    return option ? option.label : 'All Types'
  }

  const getCityLabel = () => {
    if (selectedCity === 'all') return 'Any Location'
    return selectedCity
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4">
      {/* Main Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
        {/* Property Type Dropdown */}
        <div className="relative flex-1">
          <div className="relative">
            <div className="text-xs font-medium text-emerald-700 mb-1">Property Type</div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ApartmentType | 'all')}
              className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none text-gray-900"
            >
              {propertyTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Location Dropdown */}
        <div className="relative flex-1">
          <div className="relative">
            <div className="text-xs font-medium text-emerald-700 mb-1">Location</div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none text-gray-900"
            >
              <option value="all">Any Location</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bedrooms Dropdown */}
        <div className="relative flex-1">
          <div className="relative">
            <div className="text-xs font-medium text-emerald-700 mb-1">Bedrooms</div>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none text-gray-900"
            >
              {bedroomOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex-shrink-0">
          <div className="text-xs font-medium text-emerald-700 mb-1 opacity-0">Search</div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-medium rounded-xl hover:opacity-90 transition flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm text-emerald-600 hover:text-emerald-800"
        >
          <svg className={`w-4 h-4 mr-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </button>

        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-emerald-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Price Range ($)
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
                    min="0"
                    step="100"
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">$</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
                    min="0"
                    step="100"
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">$</span>
                </div>
              </div>
            </div>

            {/* Quick Price Filters */}
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Quick Price Filters
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPriceRange({ min: '0', max: '1000' })}
                  className="px-3 py-1.5 text-xs border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  Under $1,000
                </button>
                <button
                  onClick={() => setPriceRange({ min: '1000', max: '2000' })}
                  className="px-3 py-1.5 text-xs border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  $1,000 - $2,000
                </button>
                <button
                  onClick={() => setPriceRange({ min: '2000', max: '3000' })}
                  className="px-3 py-1.5 text-xs border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  $2,000 - $3,000
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedType !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                  Type: {getTypeLabel()}
                  <button
                    onClick={() => setSelectedType('all')}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCity !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                  Location: {getCityLabel()}
                  <button
                    onClick={() => setSelectedCity('all')}
                    className="ml-2 text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {bedrooms !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                  {bedrooms}+ Bedrooms
                  <button
                    onClick={() => setBedrooms('all')}
                    className="ml-2 text-indigo-500 hover:text-indigo-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {priceRange.min && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  Min: ${priceRange.min}
                  <button
                    onClick={() => setPriceRange(prev => ({ ...prev, min: '' }))}
                    className="ml-2 text-green-500 hover:text-green-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {priceRange.max && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  Max: ${priceRange.max}
                  <button
                    onClick={() => setPriceRange(prev => ({ ...prev, max: '' }))}
                    className="ml-2 text-green-500 hover:text-green-700"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar