// // app/dashboard/admin/properties/page.tsx
// 'use client'

// import React, { useState, useEffect } from 'react'
// import PropertyGrid from '../properties/PropertyGrid'
// import PropertyFilters, { PropertyFilters as PropertyFiltersType } from '../properties/PropertyFilters'
// import { useProperty } from '../../../../context/PropertyContext'
// import { Property, PropertyStatus, ApartmentType } from '../../../../types/property'
// import { 
//   PlusIcon, 
//   ViewGridIcon, 
//   ViewListIcon, 
//   AdjustmentsHorizontalIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   EllipsisHorizontalIcon,
//   ArrowPathIcon
// } from '@heroicons/react/24/outline'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'

// export default function AdminPropertiesPage() {
//   const router = useRouter()
//   const { adminProperties, fetchAdminProperties, loadingProperties } = useProperty()
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
//   const [filters, setFilters] = useState<PropertyFiltersType>({} as PropertyFiltersType)
//   const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage] = useState(12)
//   const [isFilterOpen, setIsFilterOpen] = useState(false)

//   // Fetch properties on mount
//   useEffect(() => {
//     fetchAdminProperties()
//   }, [fetchAdminProperties])

//   // Apply filters whenever filters or properties change
//   useEffect(() => {
//     let result = [...adminProperties]

//     // Apply status filter
//     if (filters.status && filters.status !== 'all') {
//       result = result.filter(property => property.status === filters.status)
//     }

//     // Apply type filter
//     if (filters.apartmentType && filters.apartmentType !== 'all') {
//       result = result.filter(property => property.apartmentType === filters.apartmentType)
//     }

//     // Apply price range filter
//     if (filters.minPrice) {
//       result = result.filter(property => property.price >= filters.minPrice!)
//     }
//     if (filters.maxPrice) {
//       result = result.filter(property => property.price <= filters.maxPrice!)
//     }

//     // Apply bedrooms filter
//     if (filters.bedrooms) {
//       result = result.filter(property => property.features.bedrooms >= filters.bedrooms!)
//     }

//     // Apply city filter
//     if (filters.city) {
//       result = result.filter(property => 
//         property.city.toLowerCase().includes(filters.city!.toLowerCase())
//       )
//     }

//     // Apply date range filter
//     if (filters.startDate && filters.endDate) {
//       const start = new Date(filters.startDate)
//       const end = new Date(filters.endDate)
//       result = result.filter(property => {
//         const listedDate = new Date(property.listedDate)
//         return listedDate >= start && listedDate <= end
//       })
//     }

//     setFilteredProperties(result)
//     setCurrentPage(1) // Reset to first page when filters change
//   }, [filters, adminProperties])

//   // Pagination logic
//   const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
//   const indexOfLastItem = currentPage * itemsPerPage
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage
//   const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem)

//   const handleFilterChange = (newFilters: PropertyFiltersType) => {
//     setFilters(newFilters)
//   }

//   const handleClearFilters = () => {
//     setFilters({} as PropertyFiltersType)
//   }

//   const handleAddProperty = () => {
//     router.push('/dashboard/admin/properties/new')
//   }

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page)
//     window.scrollTo({ top: 0, behavior: 'smooth' })
//   }

//   const handleRefresh = () => {
//     fetchAdminProperties()
//   }

//   // Render pagination buttons
//   const renderPaginationButtons = () => {
//     const buttons = []
//     const maxVisibleButtons = 5

//     let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2))
//     let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1)

//     if (endPage - startPage + 1 < maxVisibleButtons) {
//       startPage = Math.max(1, endPage - maxVisibleButtons + 1)
//     }

//     // First page button
//     if (startPage > 1) {
//       buttons.push(
//         <button
//           key="first"
//           onClick={() => handlePageChange(1)}
//           className="px-3 py-2 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
//         >
//           1
//         </button>
//       )
//       if (startPage > 2) {
//         buttons.push(
//           <span key="ellipsis1" className="px-2 text-emerald-500">
//             <EllipsisHorizontalIcon className="w-5 h-5" />
//           </span>
//         )
//       }
//     }

//     // Page number buttons
//     for (let i = startPage; i <= endPage; i++) {
//       buttons.push(
//         <button
//           key={i}
//           onClick={() => handlePageChange(i)}
//           className={`px-3 py-2 rounded-lg transition-colors ${
//             currentPage === i
//               ? 'bg-emerald-600 text-white hover:bg-emerald-700'
//               : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
//           }`}
//         >
//           {i}
//         </button>
//       )
//     }

//     // Last page button
//     if (endPage < totalPages) {
//       if (endPage < totalPages - 1) {
//         buttons.push(
//           <span key="ellipsis2" className="px-2 text-emerald-500">
//             <EllipsisHorizontalIcon className="w-5 h-5" />
//           </span>
//         )
//       }
//       buttons.push(
//         <button
//           key="last"
//           onClick={() => handlePageChange(totalPages)}
//           className="px-3 py-2 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
//         >
//           {totalPages}
//         </button>
//       )
//     }

//     return buttons
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header Section */}
//       <div className="bg-white rounded-2xl shadow-lg p-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-emerald-900">Property Management</h1>
//             <p className="text-emerald-600 mt-1">
//               Manage all properties in your portfolio
//             </p>
//           </div>
          
//           <div className="flex flex-wrap items-center gap-3">
//             <button
//               onClick={handleRefresh}
//               disabled={loadingProperties}
//               className="px-4 py-2 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
//             >
//               <ArrowPathIcon className={`w-4 h-4 ${loadingProperties ? 'animate-spin' : ''}`} />
//               Refresh
//             </button>
            
//             <div className="flex border border-emerald-200 rounded-lg overflow-hidden">
//               <button
//                 onClick={() => setViewMode('grid')}
//                 className={`px-4 py-2 transition-colors ${
//                   viewMode === 'grid'
//                     ? 'bg-emerald-600 text-white'
//                     : 'bg-white text-emerald-700 hover:bg-emerald-50'
//                 }`}
//                 title="Grid View"
//               >
//                 <ViewGridIcon className="w-5 h-5" />
//               </button>
//               <button
//                 onClick={() => setViewMode('list')}
//                 className={`px-4 py-2 transition-colors ${
//                   viewMode === 'list'
//                     ? 'bg-emerald-600 text-white'
//                     : 'bg-white text-emerald-700 hover:bg-emerald-50'
//                 }`}
//                 title="List View"
//               >
//                 <ViewListIcon className="w-5 h-5" />
//               </button>
//             </div>
            
//             <button
//               onClick={() => setIsFilterOpen(!isFilterOpen)}
//               className="px-4 py-2 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
//             >
//               <AdjustmentsHorizontalIcon className="w-4 h-4" />
//               Filters
//             </button>
            
//             <button
//               onClick={handleAddProperty}
//               className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
//             >
//               <PlusIcon className="w-4 h-4" />
//               Add Property
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-emerald-600 font-medium">Total Properties</p>
//               <p className="text-2xl font-bold text-emerald-900 mt-1">{adminProperties.length}</p>
//             </div>
//             <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
//               <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-emerald-600 font-medium">Available</p>
//               <p className="text-2xl font-bold text-emerald-900 mt-1">
//                 {adminProperties.filter(p => p.status === 'available').length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
//               <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-emerald-600 font-medium">Rented</p>
//               <p className="text-2xl font-bold text-emerald-900 mt-1">
//                 {adminProperties.filter(p => p.status === 'rented').length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//               <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-emerald-600 font-medium">Under Maintenance</p>
//               <p className="text-2xl font-bold text-emerald-900 mt-1">
//                 {adminProperties.filter(p => p.status === 'maintenance').length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
//               <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters (Conditional) */}
//       {isFilterOpen && (
//         <div className="bg-white rounded-2xl shadow-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-emerald-900">Filter Properties</h2>
//             <button
//               onClick={handleClearFilters}
//               className="text-sm text-emerald-600 hover:text-emerald-800"
//             >
//               Clear all filters
//             </button>
//           </div>
//           <PropertyFilters onFilterChange={handleFilterChange} />
//         </div>
//       )}

//       {/* Loading State */}
//       {loadingProperties ? (
//         <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
//           <div className="flex flex-col items-center justify-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
//             <p className="text-emerald-700">Loading properties...</p>
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* Properties Grid/List */}
//           {currentProperties.length > 0 ? (
//             <>
//               <PropertyGrid 
//                 viewMode={viewMode} 
//                 properties={currentProperties}
//                 isAdminView={true}
//               />

//               {/* Results Summary */}
//               <div className="bg-white rounded-xl shadow-lg p-4">
//                 <p className="text-sm text-emerald-600">
//                   Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProperties.length)} of {filteredProperties.length} properties
//                   {Object.keys(filters).length > 0 && ' (filtered)'}
//                 </p>
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="bg-white rounded-xl shadow-lg p-6">
//                   <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//                     <p className="text-sm text-emerald-600">
//                       Page {currentPage} of {totalPages}
//                     </p>
                    
//                     <div className="flex items-center space-x-2">
//                       <button
//                         onClick={() => handlePageChange(currentPage - 1)}
//                         disabled={currentPage === 1}
//                         className="px-3 py-2 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
//                       >
//                         <ChevronLeftIcon className="w-4 h-4" />
//                         Previous
//                       </button>
                      
//                       <div className="flex items-center space-x-1">
//                         {renderPaginationButtons()}
//                       </div>
                      
//                       <button
//                         onClick={() => handlePageChange(currentPage + 1)}
//                         disabled={currentPage === totalPages}
//                         className="px-3 py-2 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
//                       >
//                         Next
//                         <ChevronRightIcon className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           ) : (
//             // Empty State
//             <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
//               <div className="max-w-md mx-auto">
//                 <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-semibold text-emerald-900 mb-2">
//                   {Object.keys(filters).length > 0 ? 'No matching properties found' : 'No properties yet'}
//                 </h3>
//                 <p className="text-gray-600 mb-6">
//                   {Object.keys(filters).length > 0 
//                     ? 'Try adjusting your filters to see more results.'
//                     : 'Start by adding your first property to manage.'}
//                 </p>
//                 {Object.keys(filters).length > 0 ? (
//                   <button
//                     onClick={handleClearFilters}
//                     className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
//                   >
//                     Clear Filters
//                   </button>
//                 ) : (
//                   <button
//                     onClick={handleAddProperty}
//                     className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 mx-auto shadow-md hover:shadow-lg"
//                   >
//                     <PlusIcon className="w-4 h-4" />
//                     Add Your First Property
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   )
// }