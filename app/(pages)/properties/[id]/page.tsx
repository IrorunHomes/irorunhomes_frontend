
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useProperty } from '../../../context/PropertyContext'
import { useUser } from '../../../context/UserContext'
import { Property, ApartmentType } from '../../../types/property'
import {
  ArrowLeftIcon,
  HeartIcon as HeartOutlineIcon,
  HeartIcon as HeartSolidIcon,
  MapPinIcon,
  HomeModernIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowsPointingOutIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CameraIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Navbar from '../../../components/Home/navbar'
import Footer from '../../../components/Home/footer'
import { RentalRequestProvider } from '../../../context/RentalRequestContext'
import RentalRequestForm from '../../../components/Property/RentalRequestForm'


// Map apartment types to display names
const apartmentTypeLabels: Record<ApartmentType, string> = {
  'a-room': 'Single Room',
  'shop': 'Shop',
  'office': 'Office Space',
  'complex': 'Complex',
  'self-contained': 'Self Contained',
  'room-and-parlour': 'Room & Parlour',
  'two-bedroom': 'Two Bedroom Apartment',
  'three-bedroom': 'Three Bedroom Apartment',
  'flat': 'Apartment Flat',
  'others': 'Other'
}


// Map property types to display names
const propertyTypeLabels: Record<string, string> = {
  'apartment': 'Apartment',
  'land': 'Land',
  'house': 'House',
  'commercial': 'Commercial Property',
  'industrial': 'Industrial Property',
  'other': 'Other Property'
}

// Inner component that uses the rental request context
export function PropertyDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { fetchPublicProperty, addRemoveFavorite } = useProperty()  
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)

  // Fetch property data
  useEffect(() => {
    const loadProperty = async () => {
      if (!params.id) return
      
      try {
        setLoading(true)
        setError(null)
        const propertyData = await fetchPublicProperty(params.id as string)
        setProperty(propertyData)
      } catch (err) {
        console.error('Failed to load property:', err)
        setError('Failed to load property details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [params.id, fetchPublicProperty])

  // Handle back navigation
  const handleBackClick = () => {
    router.back()
  }

  // Handle favorite toggle
  const handleFavoriteClick = async () => {
    if (!user) {
      router.push('/auth/login?redirect=' + window.location.pathname)
      return
    }

    try {
      const success = await addRemoveFavorite(property!._id, isFavorite)
      if (success) {
        setIsFavorite(!isFavorite)
      }
    } catch (error) {
      console.error('Failed to update favorite:', error)
    }
  }

  // Handle rental request
  const handleRentalRequest = () => {
    if (!user) {
    router.push(`/auth/login?redirect=/properties/${params.id}/request`)
      return
    }

  router.push(`/properties/${params.id}/request`)
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{error || 'Property not found'}</h3>
          <p className="text-gray-600 mb-6">The property you are looking for doesnt exist or has been removed.</p>
          <button
            onClick={handleBackClick}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackClick}
                className="flex items-center text-gray-600 hover:text-emerald-700 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Back to Properties</span>
                <span className="sm:hidden">Back</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleFavoriteClick}
                  className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500 fill-red-500" />
                  ) : (
                    <HeartOutlineIcon className="w-6 h-6" />
                  )}
                </button>
                
                <button
                  onClick={handleRentalRequest}
                  disabled={property.status !== 'available'}
                  className={`px-6 py-2 rounded-lg transition-all shadow-md hover:shadow-lg ${
                    property.status === 'available'
                      ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:opacity-90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2">
              {/* Property Images */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                {/* Main Image */}
                <div className="relative h-[400px] md:h-[500px] bg-gray-100">
                  {property.media.images.length > 0 ? (
                    <>
                      <Image
                        src={property.media.images[selectedImageIndex].url}
                        alt={`${property.title} - Image ${selectedImageIndex + 1}`}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                      />
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {selectedImageIndex + 1} / {property.media.images.length}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <CameraIcon className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Images */}
                {property.media.images.length > 1 && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {property.media.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                            selectedImageIndex === index 
                              ? 'ring-2 ring-emerald-500 scale-95' 
                              : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <Image
                            src={image.url}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Property Description */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
                
                <div className="flex items-start text-gray-600 mb-6">
                  <MapPinIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{property.address}, {property.city}, {property.state} {property.country}</span>
                </div>
                
                <div className="prose max-w-none text-gray-700">
                  <p className="text-base md:text-lg leading-relaxed">{property.description}</p>
                </div>
              </div>

              {/* Property Features */}
              {property.propertyFor === 'rent' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Property Features</h2>
                
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                        <HomeModernIcon className="w-5 h-5 text-emerald-600" />
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Property Type</div>
                        <div className="font-semibold text-gray-900">{apartmentTypeLabels[property.apartmentType]}</div>
                      </div>
                    </div>
                  
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <UsersIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Bedrooms</div>
                        <div className="font-semibold text-gray-900">{property.features.bedrooms}</div>
                      </div>
                    </div>
                  
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <ArrowsPointingOutIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Bathrooms</div>
                        <div className="font-semibold text-gray-900">{property.features.bathrooms}</div>
                      </div>
                    </div>
                  
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Yearly Rent</div>
                        <div className="font-semibold text-gray-900">{formatPrice(property.price)}</div>
                      </div>
                    </div>
                  
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                        <CalendarIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Listed Date</div>
                        <div className="font-semibold text-gray-900">{formatDate(property.listedDate)}</div>
                      </div>
                    </div>
                  
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <ShieldCheckIcon className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Status</div>
                        <div className={`font-semibold ${property.status === 'available' ? 'text-green-600' :
                            property.status === 'rented' ? 'text-red-600' :
                              property.status === 'pending' ? 'text-yellow-600' :
                                'text-blue-600'
                          }`}>
                          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}:{ property.propertyFor === 'sale' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Property Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                        <HomeModernIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Property Type</div>
                        <div className="font-semibold text-gray-900">{propertyTypeLabels[property.propertyType]}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <UsersIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Bedrooms</div>
                        <div className="font-semibold text-gray-900">{property.features.bedrooms}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <ArrowsPointingOutIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Bathrooms</div>
                        <div className="font-semibold text-gray-900">{property.features.bathrooms}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="font-semibold text-gray-900">{formatPrice(property.price)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                        <CalendarIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Listed Date</div>
                        <div className="font-semibold text-gray-900">{formatDate(property.listedDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <ShieldCheckIcon className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Status</div>
                        <div className={`font-semibold ${property.status === 'available' ? 'text-green-600' :
                            property.status === 'bought' ? 'text-red-600' :
                              property.status === 'pending' ? 'text-yellow-600' :
                              'text-blue-600'
                          }`}>
                          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities */}
              {property.features.amenities && property.features.amenities.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Amenities & Facilities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.features.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extras */}
              {property.features.extras && property.features.extras.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Additional Features</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.features.extras.map((extra, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                      >
                        {extra}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              {/* Price Card */}
              {property.propertyFor === 'rent' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-2 sticky top-24">
                <div className="text-center mb-6">
                  <div className="flex flex-col text-2xl md:text-3xl font-bold text-emerald-700">
                    {formatPrice(property.price)}
                  </div>
                </div>
                
                  <div className="text-center text-gray-600 mb-6">
                    <span className="text-sm">per year</span>
                  </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-semibold">{apartmentTypeLabels[property.apartmentType]}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">Bedrooms</span>
                    <span className="font-semibold">{property.features.bedrooms}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">Bathrooms</span>
                    <span className="font-semibold">{property.features.bathrooms}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">Parking</span>
                    <span className="font-semibold">{property.features.parking ? 'Available' : 'Not Available'}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">Kitchen</span>
                    <span className="font-semibold">{property.features.kitchen ? 'Included' : 'Not Included'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-semibold">{property.views}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleRentalRequest}
                  disabled={property.status !== 'available'}
                  className={`w-full py-3 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg ${
                    property.status === 'available'
                      ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:opacity-90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {property.status === 'available' ? 'Send Request' : 'Not Available'}
                </button>
                
                <div className="text-center text-sm text-gray-500">
                  {property.status === 'available' 
                    ? 'This property is currently available for rent'
                    : `This property is ${property.status}`
                  }
                </div>
                </div>
              )}
              {property.propertyFor === 'sale' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-2 sticky top-24">
                <div className="text-center mb-6">
                  <div className="flex flex-col text-2xl md:text-3xl font-bold text-emerald-700">
                    {formatPrice(property.price)}
                  </div>
                  </div>
                  <div className="text-center text-gray-600 mb-6">
                    <span className="text-xl text-red-700">For sale</span>
                  </div>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-semibold">{propertyTypeLabels[property.propertyType]}</span>
                    </div>
                  <div className="flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">Bedrooms</span>
                      <span className="font-semibold">{property.features.bedrooms}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">Bathrooms</span>
                    <span className="font-semibold">{property.features.bathrooms}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">Parking</span>
                    <span className="font-semibold">{property.features.parking ? 'Available' : 'Not Available'}</span>
                    </div>
                  <div className="flex justify-between border-b border-gray-100">
                    <span className="text-gray-600">Kitchen</span>
                      <span className="font-semibold">{property.features.kitchen ? 'Included' : 'Not Included'}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-gray-600">Views</span>  
                      <span className="font-semibold">{property.views}</span>
                  </div>
                </div>
                  <button
                  onClick={handleRentalRequest}
                  disabled={property.status !== 'available'}
                    className={`w-full py-3 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg ${
                      property.status === 'available'
                        ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:opacity-90'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {property.status === 'available' ? 'Send Request' : 'Not Available'}
                  </button>
                  <div className="text-center text-sm text-gray-500">
                    {property.status === 'available'
                      ? 'This property is currently available for sale'
                      : `This property is ${property.status}`
                    }
                  </div>
                </div>
              )}

              {/* Location Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Location
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>{property.address}</p>
                  <p>{property.city}, {property.state}</p>
                  {property.country && <p>{property.country}</p>}
                </div>
              </div>

              {/* Property Status */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Status</h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                  property.status === 'available' ? 'bg-green-100 text-green-800' :
                  property.status === 'rented' ? 'bg-red-100 text-red-800' :
                  property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <span className="font-medium capitalize">{property.status}</span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  {property.status === 'available' && 'This property is currently available'}
                  {property.status === 'bought' && 'This property has been sold.'}
                  {property.status === 'rented' && 'This property has been rented.'}
                  {property.status === 'pending' && 'This property has pending rental requests.'}
                  {property.status === 'maintenance' && 'This property is under maintenance.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Request Modal */}
      {showRequestModal && property && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Request to Rent</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <RentalRequestForm
                property={property}
                onClose={() => setShowRequestModal(false)}
                onSuccess={() => {
                  setRequestSuccess(true)
                  setTimeout(() => {
                    setShowRequestModal(false)
                    setRequestSuccess(false)
                  }, 3000)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {requestSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center animate-slide-up z-50">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          <span>Request submitted successfully!</span>
        </div>
      )}

      <Footer/>
    </>
  )
}

// Main export wrapped with provider
export default function PropertyDetailPage() {
  return (
    <RentalRequestProvider>
      <PropertyDetailContent />
    </RentalRequestProvider>
  )
}