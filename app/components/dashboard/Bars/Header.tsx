'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { User } from '../../../types/auth'
import { 
  BellIcon,
  ChevronDownIcon,
  UserCircleIcon,
  HomeIcon,
  ChevronRightIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'
import { useUser } from '../../../context/UserContext'
import Image from 'next/image'

interface HeaderProps {
  user: User
  onMenuClick?: () => void
}

const breadcrumbMap: Record<string, string> = {
  '/dashboard/admin': 'Dashboard',
  '/dashboard/admin/properties': 'Properties',
  '/dashboard/admin/properties/add': 'Add Property',
  '/dashboard/admin/rental-requests': 'Rental Requests',
  '/dashboard/admin/rental-requests/approved': 'Approved Requests',
  '/dashboard/admin/rental-requests/leases': 'Active Leases',
  '/dashboard/admin/rental-requests/renewals': 'Lease Renewals',
  '/dashboard/admin/users': 'Users',
  '/dashboard/admin/users/tenants': 'Tenants',
  '/dashboard/admin/users/admins': 'Admins',
  '/dashboard/admin/payments': 'Payments',
  '/dashboard/admin/payments/pending': 'Pending Payments',
  '/dashboard/admin/settings': 'Settings',
  '/dashboard/admin/settings/general': 'General Settings',
  '/dashboard/admin/settings/notifications': 'Notifications',
  '/dashboard/admin/help': 'Help & Support',
  
  // Super Admin paths
  '/dashboard/super-admin': 'Dashboard',
  '/dashboard/super-admin/properties': 'Properties',
  '/dashboard/super-admin/properties/add': 'Add Property',
  '/dashboard/super-admin/rental-requests': 'Rental Requests',
  '/dashboard/super-admin/rental-requests/approved': 'Approved Requests',
  '/dashboard/super-admin/rental-requests/leases': 'Active Leases',
  '/dashboard/super-admin/rental-requests/renewals': 'Lease Renewals',
  '/dashboard/super-admin/users': 'Users',
  '/dashboard/super-admin/add-admin': 'Add Admin',
  '/dashboard/super-admin/payments': 'Payments',
  '/dashboard/super-admin/payments/pending': 'Pending Payments',
  '/dashboard/super-admin/settings': 'Settings',
  '/dashboard/super-admin/settings/general': 'General Settings',
  '/dashboard/super-admin/settings/notifications': 'Notifications',
  
  // Tenant paths
  '/dashboard/tenant': 'Dashboard',
  '/dashboard/tenant/requests': 'My Requests',
  '/dashboard/tenant/rental-requests/leases': 'Active Leases',
  '/dashboard/tenant/rental-requests/renewals': 'Lease Renewals',
  '/dashboard/tenant/payments': 'Payments',
  '/dashboard/tenant/add-payments': 'Add Payments',
  '/dashboard/tenant/settings': 'Settings',
  '/dashboard/tenant/settings/general': 'General Settings',
  '/dashboard/tenant/settings/notifications': 'Notifications',
  '/dashboard/tenant/help': 'Help & Support'
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const { logout } = useUser()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showProfileMenu && !(e.target as Element).closest('.profile-menu')) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showProfileMenu])

  const handleLogout = () => {
    logout()
    setShowProfileMenu(false)
  }

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    let currentPath = ''
    for (let i = 0; i < paths.length; i++) {
      currentPath += `/${paths[i]}`
      const label = breadcrumbMap[currentPath]
      if (label) {
        breadcrumbs.push({
          path: currentPath,
          label
        })
      }
    }
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-emerald-100">
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        {/* Mobile Header - First Row */}
        <div className="flex items-center justify-between md:hidden mb-3">
          <div className="flex items-center">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 hover:bg-emerald-50 rounded-lg mr-2"
              >
                <Bars3Icon className="w-5 h-5 text-emerald-700" />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-emerald-50 rounded-lg relative">
              <BellIcon className="w-5 h-5 text-emerald-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Breadcrumbs - Responsive */}
        <div className="flex items-center text-xs sm:text-sm text-emerald-600 mb-2 md:mb-4 overflow-x-auto pb-1 scrollbar-hide">
          <Link href={pathname.includes('super-admin') ? '/dashboard/super-admin' : 
                        pathname.includes('admin') ? '/dashboard/admin' : 
                        '/dashboard/tenant'} 
                className="hover:text-emerald-800 flex-shrink-0">
            <HomeIcon className="w-4 h-4" />
          </Link>
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.path}>
              <ChevronRightIcon className="w-3 h-3 mx-1 sm:mx-2 flex-shrink-0" />
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-emerald-900 whitespace-nowrap">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.path}
                  className="hover:text-emerald-800 whitespace-nowrap"
                >
                  {breadcrumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Desktop Header - Second Row */}
        <div className="flex items-center justify-between">
          {/* Page Title - Hidden on mobile */}
          <div className="hidden md:block">
              <p className="text-emerald-600 font-bold text-3xl mt-1 pl-10">
                Irorun Homes
              </p>
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-end w-full md:w-auto space-x-2 sm:space-x-4">
            {/* Notifications */}
            <button className="hidden md:block p-2 hover:bg-emerald-50 rounded-lg relative">
              <BellIcon className="w-5 h-5 text-emerald-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative profile-menu">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.fullName} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <p className="font-medium text-emerald-900 text-sm lg:text-base">
                    {user?.fullName || 'Guest User'}
                  </p>
                  <p className="text-xs text-emerald-600 capitalize">
                    {user?.role?.replace('_', ' ') || 'Guest'}
                  </p>
                </div>
                <ChevronDownIcon className="w-4 h-5 text-emerald-600 hidden md:block" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-lg border border-emerald-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-emerald-50">
                    <p className="font-medium text-emerald-900 text-sm sm:text-base truncate">
                      {user?.fullName || 'Guest User'}
                    </p>
                    <p className="text-xs sm:text-sm text-emerald-600 truncate mt-0.5">
                      {user?.email || 'guest@example.com'}
                    </p>
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full capitalize">
                        {user?.role?.replace('_', ' ') || 'Guest'}
                      </span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`${pathname.includes('super-admin') ? '/dashboard/super-admin' : 
                           pathname.includes('admin') ? '/dashboard/admin' : 
                           '/dashboard/tenant'}/settings`} 
                    className="block px-4 py-2.5 text-left text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Account Settings
                  </Link>
                  
                  <div className="border-t border-emerald-100 mt-2 pt-2">
                    <button 
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => {
                        handleLogout()}}
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}