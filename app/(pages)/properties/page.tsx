
'use client'

import React from 'react'
import PropertyListings from '../../components/Property/PropertyListings'
import Navbar from '../../components/Home/navbar'
import Footer from '../../components/Home/footer'

export default function PropertiesPage() {
  return (
    <>
      <Navbar />
        <PropertyListings />
      <Footer />
    </>
  )
}