'use client'

import React, { useState } from 'react'
import { 
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  MapPinIcon,
  HomeModernIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { ApartmentType, PropertyStatus, PropertyType } from '../../../../types/property'

interface PropertyFiltersProps {
  onFilterChange: (filters: PropertyFilters) => void
  initialFilters?: Partial<PropertyFilters>
}

export interface PropertyFilters {
  search: string
  minPrice: number
  maxPrice: number
  bedrooms: number
  bathrooms: number
  apartmentType: ApartmentType | ''
  propertyType: PropertyType | ''
  propertyFor: 'rent' | 'sale' | ''
  status: PropertyStatus | ''
  city: string
  sortBy: 'price' | 'listedDate' | 'views' | ''
  sortOrder: 'asc' | 'desc'
  startDate?: Date
  endDate?: Date
}

// Apartment types for Rent
const apartmentTypes: { value: ApartmentType; label: string }[] = [
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

// Property types for Sale
const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'land', label: 'Land' },
  { value: 'house', label: 'House' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'other', label: 'Other' }
]

const statusOptions: { value: PropertyStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'rented', label: 'Rented' },
  { value: 'bought', label: 'Bought' },
  { value: 'pending', label: 'Pending' }
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
    minPrice: 0,
    maxPrice: 0,
    bedrooms: 0,
    bathrooms: 0,
    apartmentType: '',
    propertyType: '',
    propertyFor: '',
    status: '',
    city: '',
    sortBy: '',
    sortOrder: 'desc',
    ...initialFilters
  })

  const handleFilterChange = (key: keyof PropertyFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const newFilters: PropertyFilters = {
      search: '',
      minPrice: 0,
      maxPrice: 0,
      bedrooms: 0,
      bathrooms: 0,
      apartmentType: '',
      propertyType: '',
      propertyFor: '',
      status: '',
      city: '',
      sortBy: '',
      sortOrder: 'desc'
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => 
      value !== '' && value !== 'desc' && value !== 0 // Exclude default values
    )
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
          {/* Property For (Rent/Sale) */}
          <div className="relative">
            <HomeModernIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <select
              value={filters.propertyFor}
              onChange={(e) => {
                const value = e.target.value as 'rent' | 'sale' | ''
                handleFilterChange('propertyFor', value)
                // Reset type filters when switching
                if (value === 'rent') {
                  handleFilterChange('propertyType', '')
                } else if (value === 'sale') {
                  handleFilterChange('apartmentType', '')
                }
              }}
              className="pl-10 pr-8 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none"
            >
              <option value="">All Properties</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>
          </div>

          {/* Apartment Type (Rent) */}
          {(filters.propertyFor === 'rent' || filters.propertyFor === '') && (
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <select
                value={filters.apartmentType}
                onChange={(e) => handleFilterChange('apartmentType', e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none"
              >
                <option value="">All Types</option>
                {apartmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Property Type (Sale) */}
          {(filters.propertyFor === 'sale' || filters.propertyFor === '') && (
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value as PropertyType | '')}
                className="pl-10 pr-8 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none"
              >
                <option value="">All Types</option>
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none"
            >
              <option value="">Sort By</option>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          {filters.sortBy && (
            <button
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          )}

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2.5 flex items-center border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
            Advanced
          </button>

          {/* Clear Filters */}
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 flex items-center border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.search || filters.apartmentType || filters.propertyType || filters.propertyFor || filters.status || filters.city) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700">
              Search: &ldquo;{filters.search}&ldquo;
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-2 text-emerald-500 hover:text-emerald-700"
              >
                ×
              </button>
            </span>
          )}
          {filters.propertyFor && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700">
              {filters.propertyFor === 'rent' ? 'For Rent' : 'For Sale'}
              <button
                onClick={() => handleFilterChange('propertyFor', '')}
                className="ml-2 text-emerald-500 hover:text-emerald-700"
              >
                ×
              </button>
            </span>
          )}
          {filters.apartmentType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
              Type: {apartmentTypes.find(t => t.value === filters.apartmentType)?.label}
              <button
                onClick={() => handleFilterChange('apartmentType', '')}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </span>
          )}
          {filters.propertyType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
              Type: {propertyTypes.find(t => t.value === filters.propertyType)?.label}
              <button
                onClick={() => handleFilterChange('propertyType', '')}
                className="ml-2 text-indigo-500 hover:text-indigo-700"
              >
                ×
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700">
              Status: {statusOptions.find(s => s.value === filters.status)?.label}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="ml-2 text-amber-500 hover:text-amber-700"
              >
                ×
              </button>
            </span>
          )}
          {filters.city && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
              City: {filters.city}
              <button
                onClick={() => handleFilterChange('city', '')}
                className="ml-2 text-purple-500 hover:text-purple-700"
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
                Price Range (₦)
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <CurrencyDollarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-2 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    min="0"
                  />
                </div>
                <div className="relative flex-1">
                  <CurrencyDollarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-2 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Bedrooms
              </label>
              <select
                value={filters.bedrooms || ''}
                onChange={(e) => handleFilterChange('bedrooms', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="0">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Bathrooms
              </label>
              <select
                value={filters.bathrooms || ''}
                onChange={(e) => handleFilterChange('bathrooms', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="0">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Features
              </label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                    onChange={(e) => {
                      // Handle parking filter
                    }}
                  />
                  <span className="ml-2 text-sm text-emerald-700">Parking</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                    onChange={(e) => {
                      // Handle kitchen filter
                    }}
                  />
                  <span className="ml-2 text-sm text-emerald-700">Kitchen</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}