'use client'

import React, { useState, useEffect } from 'react'
import { useProperty } from '../../context/PropertyContext'
import { ApartmentType } from '../../types/property'

interface SearchBarProps {
  onSearch?: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
}

export interface SearchFilters {
  type: ApartmentType | 'all'
  city: string
  minPrice: number | null
  maxPrice: number | null
  bedrooms: number | 'all'
}

const SearchBar = ({ onSearch, initialFilters }: SearchBarProps) => {
  const { properties } = useProperty()
  const [selectedType, setSelectedType] = useState<ApartmentType | 'all'>(initialFilters?.type || 'all')
  const [selectedCity, setSelectedCity] = useState<string>(initialFilters?.city || 'all')
  const [priceRange, setPriceRange] = useState({ 
    min: initialFilters?.minPrice?.toString() || '', 
    max: initialFilters?.maxPrice?.toString() || '' 
  })
  const [bedrooms, setBedrooms] = useState<number | 'all'>(initialFilters?.bedrooms || 'all')
  const [showFilters, setShowFilters] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Extract unique cities from properties
  const uniqueCities = Array.from(new Set(properties.map(p => p.city).filter(Boolean)))

  const propertyTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'a-room', label: 'Single Room' },
    { value: 'self-contained', label: 'Self Contained' },
    { value: 'room-and-parlour', label: 'Room & Parlour' },
    { value: 'two-bedroom', label: '2 Bedroom' },
    { value: 'three-bedroom', label: '3 Bedroom' },
    { value: 'flat', label: 'Flat' },
    { value: 'others', label: 'Other' }
  ]

  const bedroomOptions = [
    { value: 'all', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' }
  ]

  const handleSearch = () => {
    setIsSearching(true)
    
    const filters: SearchFilters = {
      type: selectedType,
      city: selectedCity,
      minPrice: priceRange.min ? parseInt(priceRange.min) : null,
      maxPrice: priceRange.max ? parseInt(priceRange.max) : null,
      bedrooms: bedrooms
    }
    
    if (onSearch) {
      onSearch(filters)
    }
    
    setTimeout(() => setIsSearching(false), 300)
  }

  const clearFilters = () => {
    setSelectedType('all')
    setSelectedCity('all')
    setPriceRange({ min: '', max: '' })
    setBedrooms('all')
    
    if (onSearch) {
      onSearch({
        type: 'all',
        city: 'all',
        minPrice: null,
        maxPrice: null,
        bedrooms: 'all'
      })
    }
  }

  const hasActiveFilters = () => {
    return selectedType !== 'all' || 
           selectedCity !== 'all' || 
           priceRange.min || 
           priceRange.max || 
           bedrooms !== 'all'
  }

  const getTypeLabel = () => {
    const option = propertyTypeOptions.find(opt => opt.value === selectedType)
    return option ? option.label : 'All Types'
  }

  const getCityLabel = () => {
    if (selectedCity === 'all') return 'Any Location'
    return selectedCity
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4">
      {/* Main Search Row - Horizontal on Desktop, Vertical on Mobile */}
      <div className="flex flex-col md:flex-row gap-2 sm:gap-3">
        {/* Property Type Dropdown */}
        <div className="flex-1 relative">
          <label className="block text-xs font-medium text-emerald-700 mb-1 md:hidden">
            Property Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ApartmentType | 'all')}
            className="w-full px-3 py-2.5 sm:py-3 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none text-gray-900 text-sm sm:text-base"
          >
            {propertyTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 md:top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Location Dropdown */}
        <div className="flex-1 relative">
          <label className="block text-xs font-medium text-emerald-700 mb-1 md:hidden">
            Location
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2.5 sm:py-3 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none text-gray-900 text-sm sm:text-base"
          >
            <option value="all">Any Location</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 md:top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Bedrooms Dropdown */}
        <div className="flex-1 relative">
          <label className="block text-xs font-medium text-emerald-700 mb-1 md:hidden">
            Bedrooms
          </label>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="w-full px-3 py-2.5 sm:py-3 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none text-gray-900 text-sm sm:text-base"
          >
            {bedroomOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 md:top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex-shrink-0 md:self-end">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full md:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-medium rounded-xl hover:opacity-90 transition flex items-center justify-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isSearching ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-xs sm:text-sm text-emerald-600 hover:text-emerald-800"
        >
          <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </button>

        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-xs sm:text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mt-3 pt-3 border-t border-emerald-100">
          {/* Price Range */}
          <div className="mb-3">
            <label className="block text-xs sm:text-sm font-medium text-emerald-700 mb-1.5 sm:mb-2">
              Price Range (₦)
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
                  step="1000"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">₦</span>
              </div>
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
                  min="0"
                  step="1000"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">₦</span>
              </div>
            </div>
          </div>

          {/* Quick Price Filters */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setPriceRange({ min: '0', max: '100000' })}
                className="px-2.5 py-1 text-xs border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
              >
                Under ₦100k
              </button>
              <button
                onClick={() => setPriceRange({ min: '100000', max: '200000' })}
                className="px-2.5 py-1 text-xs border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
              >
                ₦100k - ₦200k
              </button>
              <button
                onClick={() => setPriceRange({ min: '200000', max: '300000' })}
                className="px-2.5 py-1 text-xs border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
              >
                ₦200k - ₦300k
              </button>
              <button
                onClick={() => setPriceRange({ min: '300000', max: '500000' })}
                className="px-2.5 py-1 text-xs border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
              >
                ₦300k - ₦500k
              </button>
              <button
                onClick={() => setPriceRange({ min: '500000', max: '1000000' })}
                className="px-2.5 py-1 text-xs border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
              >
                ₦500k - ₦1M
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedType !== 'all' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                  {getTypeLabel()}
                  <button
                    onClick={() => setSelectedType('all')}
                    className="ml-1.5 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCity !== 'all' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                  {getCityLabel()}
                  <button
                    onClick={() => setSelectedCity('all')}
                    className="ml-1.5 text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {bedrooms !== 'all' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">
                  {bedrooms}+ Beds
                  <button
                    onClick={() => setBedrooms('all')}
                    className="ml-1.5 text-indigo-500 hover:text-indigo-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {priceRange.min && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                  Min: ₦{parseInt(priceRange.min).toLocaleString()}
                  <button
                    onClick={() => setPriceRange(prev => ({ ...prev, min: '' }))}
                    className="ml-1.5 text-green-500 hover:text-green-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {priceRange.max && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                  Max: ₦{parseInt(priceRange.max).toLocaleString()}
                  <button
                    onClick={() => setPriceRange(prev => ({ ...prev, max: '' }))}
                    className="ml-1.5 text-green-500 hover:text-green-700"
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