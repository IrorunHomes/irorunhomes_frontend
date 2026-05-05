
'use client'

import React from 'react'
import PropertyListings from '../../components/Property/PropertyListings'
import Navbar from '../../components/Home/navbar'
import Footer from '../../components/Home/footer'
import SearchBar from '../../components/Home/SearchBar'

export default function PropertiesPage() {
  return (
    <>
      <Navbar />
        {/* Search Bar Component */}
        <div className="mb-10 mt-10 max-w-3xl mx-auto bg-gradient-to-b">
          <SearchBar />
        </div>
        <PropertyListings />
      <Footer />
    </>
  )
}