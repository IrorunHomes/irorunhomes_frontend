'use client'

import React, { useState, useEffect } from 'react'
import { 
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  MapPinIcon,
  HomeModernIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { ApartmentType, PropertyStatus } from '../../../../types/property'

interface PropertyFiltersProps {
  onFilterChange: (filters: PropertyFilters) => void
  initialFilters?: Partial<PropertyFilters>
}

export interface PropertyFilters {
  search: string
  minPrice: number | null
  maxPrice: number | null
  bedrooms: number | null
  bathrooms: number | null
  apartmentType: ApartmentType | ''
  status: PropertyStatus | ''
  startDate: string
  endDate: string
  city: string
  sortBy: 'price' | 'listedDate' | 'views' | ''
  sortOrder: 'asc' | 'desc'
}

const apartmentTypes: { value: ApartmentType; label: string }[] = [
  { value: 'a-room', label: 'Single Room' },
  { value: 'self-contained', label: 'Self Contained' },
  { value: 'room-and-parlour', label: 'Room & Parlour' },
  { value: 'two-bedroom', label: 'Two Bedroom' },
  { value: 'three-bedroom', label: 'Three Bedroom' },
  { value: 'flat', label: 'Flat' },
  { value: 'others', label: 'Other' }
]

const statusOptions: { value: PropertyStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'rented', label: 'Rented' },
  { value: 'pending', label: 'Pending' },
  { value: 'maintenance', label: 'Maintenance' }
]

const sortOptions = [
  { value: 'price', label: 'Price' },
  { value: 'listedDate', label: 'Listed Date' },
  { value: 'views', label: 'Views' }
]

export default function PropertyFilters({ onFilterChange, initialFilters }: PropertyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    minPrice: null,
    maxPrice: null,
    bedrooms: null,
    bathrooms: null,
    apartmentType: '',
    status: '',
    city: '',
    startDate: '',
    endDate: '',
    sortBy: '',
    sortOrder: 'desc',
    ...initialFilters
  })

  // Apply initial filters on mount
  useEffect(() => {
    if (initialFilters) {
      const combinedFilters = {
        ...filters,
        ...initialFilters
      } as PropertyFilters
      onFilterChange(combinedFilters)
    }
  }, [])

  const handleFilterChange = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleNumberInputChange = (key: 'minPrice' | 'maxPrice' | 'bedrooms' | 'bathrooms', value: string) => {
    const numValue = value === '' ? null : Number(value)
    handleFilterChange(key, numValue)
  }

  const clearFilters = () => {
    const newFilters: PropertyFilters = {
      search: '',
      minPrice: null,
      maxPrice: null,
      bedrooms: null,
      bathrooms: null,
      apartmentType: '',
      status: '',
      city: '',
      startDate: '',
      endDate: '',
      sortBy: '',
      sortOrder: 'desc'
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const hasActiveFilters = () => {
    const { sortOrder, ...filterValues } = filters
    
    return Object.entries(filterValues).some(([_, value]) => {
      if (value === null) return false
      if (typeof value === 'number') return value !== null
      if (typeof value === 'string') return value.trim() !== ''
      return false
    })
  }

  const removeFilter = (key: keyof PropertyFilters) => {
    const defaultValueMap: Record<keyof PropertyFilters, PropertyFilters[keyof PropertyFilters]> = {
      search: '',
      minPrice: null,
      maxPrice: null,
      bedrooms: null,
      bathrooms: null,
      apartmentType: '',
      status: '',
      city: '',
      startDate: '',
      endDate: '',
      sortBy: '',
      sortOrder: 'desc'
    }
    
    handleFilterChange(key, defaultValueMap[key])
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      {/* Basic Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="flex-1 w-full">
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <HomeModernIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <select
              value={filters.apartmentType}
              onChange={(e) => handleFilterChange('apartmentType', e.target.value as ApartmentType | '')}
              className="pl-10 pr-8 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none text-sm"
            >
              <option value="">All Types</option>
              {apartmentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value as PropertyStatus | '')}
              className="pl-10 pr-8 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none text-sm"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
            />
          </div>

          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value as 'price' | 'listedDate' | 'views' | '')}
              className="pl-10 pr-8 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none text-sm"
            >
              <option value="">Sort By</option>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {filters.sortBy && (
            <button
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors text-sm"
              title={filters.sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
            >
              {filters.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          )}

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2.5 flex items-center border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors text-sm"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
            Advanced
          </button>

          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 flex items-center border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm"
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
              Search: &quot;{filters.search}&quot;
              <button
                onClick={() => removeFilter('search')}
                className="ml-2 text-emerald-500 hover:text-emerald-700"
                title="Remove search filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.apartmentType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
              Type: {apartmentTypes.find(t => t.value === filters.apartmentType)?.label}
              <button
                onClick={() => removeFilter('apartmentType')}
                className="ml-2 text-blue-500 hover:text-blue-700"
                title="Remove type filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
              Status: {statusOptions.find(s => s.value === filters.status)?.label}
              <button
                onClick={() => removeFilter('status')}
                className="ml-2 text-amber-500 hover:text-amber-700"
                title="Remove status filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.city && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
              City: {filters.city}
              <button
                onClick={() => removeFilter('city')}
                className="ml-2 text-purple-500 hover:text-purple-700"
                title="Remove city filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.minPrice !== null && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
              Min: ${filters.minPrice.toLocaleString()}
              <button
                onClick={() => removeFilter('minPrice')}
                className="ml-2 text-green-500 hover:text-green-700"
                title="Remove min price filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.maxPrice !== null && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
              Max: ${filters.maxPrice.toLocaleString()}
              <button
                onClick={() => removeFilter('maxPrice')}
                className="ml-2 text-green-500 hover:text-green-700"
                title="Remove max price filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.bedrooms !== null && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
              {filters.bedrooms}+ Beds
              <button
                onClick={() => removeFilter('bedrooms')}
                className="ml-2 text-indigo-500 hover:text-indigo-700"
                title="Remove bedrooms filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.bathrooms !== null && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-pink-100 text-pink-700">
              {filters.bathrooms}+ Baths
              <button
                onClick={() => removeFilter('bathrooms')}
                className="ml-2 text-pink-500 hover:text-pink-700"
                title="Remove bathrooms filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-emerald-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Price Range ($)
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <CurrencyDollarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleNumberInputChange('minPrice', e.target.value)}
                    className="w-full pl-8 pr-2 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
                    min="0"
                    step="100"
                  />
                </div>
                <div className="relative flex-1">
                  <CurrencyDollarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleNumberInputChange('maxPrice', e.target.value)}
                    className="w-full pl-8 pr-2 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
                    min="0"
                    step="100"
                  />
                </div>
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Bedrooms
              </label>
              <div className="relative">
                <BuildingOfficeIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <select
                  value={filters.bedrooms || ''}
                  onChange={(e) => handleNumberInputChange('bedrooms', e.target.value)}
                  className="w-full pl-8 pr-8 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none text-sm"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Bathrooms
              </label>
              <div className="relative">
                <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <select
                  value={filters.bathrooms || ''}
                  onChange={(e) => handleNumberInputChange('bathrooms', e.target.value)}
                  className="w-full pl-8 pr-8 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none text-sm"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Listed Date Range
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full pl-8 pr-2 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
                  />
                </div>
                <div className="relative">
                  <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full pl-8 pr-2 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => {
                // Set common price filters
                handleNumberInputChange('minPrice', '500')
                handleNumberInputChange('maxPrice', '2000')
                handleNumberInputChange('bedrooms', '2')
              }}
              className="px-3 py-1.5 text-xs border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Show Mid-range
            </button>
            <button
              onClick={() => {
                handleFilterChange('status', 'available')
                handleNumberInputChange('bedrooms', '3')
                handleFilterChange('apartmentType', 'three-bedroom')
              }}
              className="px-3 py-1.5 text-xs border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Popular 3-Bed
            </button>
          </div>
        </div>
      )}
    </div>
  )
}