"use client"
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProperty } from '../../../../context/PropertyContext'
import PropertyCard from '../../../../components/Property/PropertyCard'
import DashboardLayout from '../../DashboardLayout'
import Link from 'next/link'

const FavouritesPage = () => {
    const { favorites, fetchFavorites, loadingFavorites } = useProperty()
    const router = useRouter()

  const handleCardClick = (propertyId: string) => {
    router.push(`/dashboard/tenant/properties/${propertyId}`)
  }
    
useEffect(() => {
        fetchFavorites()
    }, [])

    if (loadingFavorites) {
      return (
        <DashboardLayout activeTab="favourites" onTabChange={() => {}}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </DashboardLayout>
      )
    }

    return (
        <DashboardLayout activeTab="favourites" onTabChange={() => { }}>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">My Favourites</h1>
                {!favorites || favorites.length === 0 ? (
                    <div className="text-gray-500">
                        <div className="text-center mt-4">
                            <p className="text-gray-600">You have not added any properties to your favourites yet.</p>
                            <p className="text-gray-600">Browse properties and click the heart icon to add them to your favourites.</p>
                            <Link href="/dashboard/tenant" className="text-emerald-600 hover:underline">
                                Browse Properties
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {favorites.map((property) => (
                            <PropertyCard
                                key={property._id}
                                property={property}
                                onCardClick={() => handleCardClick(property._id)} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default FavouritesPage