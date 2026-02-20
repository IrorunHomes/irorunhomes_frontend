// components/Hero.tsx
'use client'

import React from 'react'
import SearchBar from './SearchBar'
import Image from 'next/image'
import heroBackground from '../../../public/Hero.avif'

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={heroBackground}
            alt="San Francisco Bay Area landscape"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            quality={90}
            placeholder="blur"
          />
        </div>
        
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-green-900/60 to-teal-900/70"></div>
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0LjVjMC0xLjM4MS0xLjExOS0yLjUtMi41LTIuNVMzMSAzMy4xMTkgMzEgMzQuNSAzMi4xMTkgMzcgMzMuNSAzN1MzNiAzNS44ODEgMzYgMzQuNXptMS41IDBjMCAyLjIwOS0xLjc5MSA0LTQgNFMyOSAzNi43MDkgMjkgMzQuNSAzMC43OTEgMzAuNSAzMy41IDMwLjUgMzcgMzIuMjkxIDM3IDM0LjV6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-20 md:pt-32">
        {/* Main Heading - Optimized for Mobile */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight drop-shadow-lg">
            Rent, Buy/Sell, <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Zero commision<br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-teal-300">
              No Agent Fee & Inspection
            </span>
          </h1>
          <p className="text-white/90 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-2 drop-shadow-md">
            Find eco-friendly, affordable housing in the most sustainable neighborhoods
          </p>
        </div>

        {/* Search Bar Component */}
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <SearchBar />
        </div>

        {/* Stats/Features - Responsive Grid with Glass Effect */}
        <div className="mt-12 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto mb-6">
          <div className="text-center p-4 sm:p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-300 mb-2">500+</div>
            <div className="text-white text-sm sm:text-base font-medium">Green Properties</div>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-2xl sm:text-3xl font-bold text-green-300 mb-2">98%</div>
            <div className="text-white text-sm sm:text-base font-medium">Tenant Satisfaction</div>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-2xl sm:text-3xl font-bold text-teal-300 mb-2">24/7</div>
            <div className="text-white text-sm sm:text-base font-medium">Eco Support</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator for Mobile */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:hidden z-20">
        <div className="animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Gradient Fade at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-emerald-900/30 to-transparent pointer-events-none"></div>
    </section>
  )
}

export default Hero