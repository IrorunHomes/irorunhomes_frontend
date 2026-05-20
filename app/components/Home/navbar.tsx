'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import logo from "../../../public/irorun-logo.png";
import Image from "next/image";
import Link from "next/link";
import { useUser } from '../../context/UserContext';
import { UserCircleIcon, HomeIcon, BuildingOfficeIcon, CurrencyDollarIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export const IrorunHomesLogo = () => (
  <Link href="/" className="flex items-center space-x-2">
    <Image 
      src={logo} 
      alt="Irorun Homes Logo" 
      className="w-20 h-auto sm:w-28 md:w-32 transition-all duration-300 mr-0" 
      priority
    />
    <p className="font-bold text-emerald-700 text-lg sm:text-xl md:text-xl">Irorun Homes</p>
  </Link>
);

const Navbar = () => {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/auth/login'
    
    switch (user.role) {
      case 'super_admin':
        return '/dashboard/super-admin'
      case 'admin':
        return '/dashboard/super-admin/admin'
      case 'tenant':
        return '/dashboard/tenant'
      default:
        return '/dashboard/tenant'
    }
  }

  // Get dashboard button text
  const getDashboardText = () => {
    if (!user) return 'Sign In'
    
    switch (user.role) {
      case 'super_admin':
        return 'Admin Dashboard'
      case 'admin':
        return 'Admin Dashboard'
      case 'tenant':
        return 'Dashboard'
      default:
        return 'Dashboard'
    }
  }

  const handleDashboardClick = () => {
    if (isAuthenticated && user) {
      router.push(getDashboardPath())
    } else {
      router.push('/auth/login')
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
    setIsMobileMenuOpen(false)
  }

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`sticky top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12">
        
        {/* Logo - Left aligned */}
        <div className="flex-shrink-0">
          <IrorunHomesLogo />
        </div>

        {/* Desktop Navigation Links - Center aligned */}
        <div className="hidden md:flex flex-1 justify-center items-center space-x-6">
          <Link 
            href="/" 
            className={`transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-emerald-50 text-sm lg:text-base ${
              isScrolled 
                ? 'text-gray-800 hover:text-emerald-700' 
                : 'text-gray-700 hover:text-emerald-700'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/properties" 
            className={`transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-emerald-50 text-sm lg:text-base ${
              isScrolled 
                ? 'text-gray-800 hover:text-emerald-700' 
                : 'text-gray-700 hover:text-emerald-700'
            }`}
          >
            Browse Properties
          </Link>
          <Link 
            href="/" 
            className={`transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-emerald-50 text-sm lg:text-base ${
              isScrolled 
                ? 'text-gray-800 hover:text-emerald-700' 
                : 'text-gray-700 hover:text-emerald-700'
            }`}
          >
            Sell/Buy <span className="text-xs text-emerald-600">(coming soon)</span>
          </Link>
          <Link 
            href="/pricing" 
            className={`transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-emerald-50 text-sm lg:text-base ${
              isScrolled 
                ? 'text-gray-800 hover:text-emerald-700' 
                : 'text-gray-700 hover:text-emerald-700'
            }`}
          >
            Pricing
          </Link>
          <Link 
            href="/contact-us" 
            className={`transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-emerald-50 text-sm lg:text-base ${
              isScrolled 
                ? 'text-gray-800 hover:text-emerald-700' 
                : 'text-gray-700 hover:text-emerald-700'
            }`}
          >
            Contact Us
          </Link>
          <Link 
            href="/about-us" 
            className={`transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-emerald-50 text-sm lg:text-base ${
              isScrolled 
                ? 'text-gray-800 hover:text-emerald-700' 
                : 'text-gray-700 hover:text-emerald-700'
            }`}
          >
            About Us
          </Link>
        </div>

        {/* Desktop CTA Button - Right aligned */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">          
          <button 
            onClick={handleDashboardClick}
            className={`px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200 text-sm lg:text-base ${
              isScrolled ? 'shadow-lg hover:shadow-xl' : 'shadow-md hover:shadow-lg'
            }`}
          >
            {getDashboardText()}
          </button>
        </div>

        {/* Mobile Menu Button - Right aligned */}
        <button 
          className={`md:hidden p-2 rounded-lg transition-colors ml-auto ${
            isScrolled 
              ? 'text-gray-800 hover:bg-gray-100' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown - Full width */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-40">
          <div className="flex flex-col px-4 py-3">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-emerald-700 font-medium py-3 px-4 rounded-lg hover:bg-emerald-50 transition-colors border-b border-gray-100 flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <Link 
              href="/properties" 
              className="text-gray-700 hover:text-emerald-700 font-medium py-3 px-4 rounded-lg hover:bg-emerald-50 transition-colors border-b border-gray-100 flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              Browse Properties
            </Link>
            <Link 
              href="/sell-buy" 
              className="text-gray-700 hover:text-emerald-700 font-medium py-3 px-4 rounded-lg hover:bg-emerald-50 transition-colors border-b border-gray-100 flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sell/Buy <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">coming soon</span>
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-700 hover:text-emerald-700 font-medium py-3 px-4 rounded-lg hover:bg-emerald-50 transition-colors border-b border-gray-100 flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10c0-.552.448-1 1-1h3m-4 0c-.552 0-1 .448-1 1v3m0-4c0-.552-.448-1-1-1H8m4 0c-.552 0-1 .448-1 1v3m0 4c0 .552.448 1 1 1h3m-4 0c-.552 0-1-.448-1-1v-3" />
              </svg>
              Pricing
            </Link>
            <Link 
              href="/contact-us" 
              className="text-gray-700 hover:text-emerald-700 font-medium py-3 px-4 rounded-lg hover:bg-emerald-50 transition-colors flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
            <Link 
              href="/about-us" 
              className="text-gray-700 hover:text-emerald-700 font-medium py-3 px-4 rounded-lg hover:bg-emerald-50 transition-colors flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3m-1.664 4L16 17m0 0l-4-4m4 4V3" />
              </svg>
              About Us
            </Link>
            
            {/* Mobile CTA Buttons */}
            <div className="pt-4 mt-2 border-t border-gray-200 flex flex-col space-y-3">
              {isAuthenticated && user ? (
                <>
                  <Link
                    href={getDashboardPath()}
                    className="w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition flex items-center justify-center shadow-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HomeIcon className="w-5 h-5 mr-2" />
                    {getDashboardText()}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-white text-red-600 font-medium rounded-lg border border-red-300 hover:bg-red-50 transition flex items-center justify-center"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDashboardClick}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-medium rounded-lg hover:opacity-90 transition shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </button>
                  <Link
                    href="/properties"
                    className="w-full py-3 bg-white text-emerald-700 font-medium rounded-lg border border-emerald-600 hover:bg-emerald-50 transition flex items-center justify-center shadow-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find Properties
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar