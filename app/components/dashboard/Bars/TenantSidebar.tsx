
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import logo from "../../../../public/irorun-logo.png";
import Image from "next/image";
import {
  HomeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  DocumentCheckIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  activeTab: string
  currentPage: string
  handleNavigate: (page: string) => void
  onTabChange: (tab: string) => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  path: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: HomeIcon,
    path: '/dashboard/tenant'
  },
  { 
    id: 'rental-requests', 
    label: 'Rental Requests', 
    icon: DocumentTextIcon,
    path: '/dashboard/tenant/requests',
    children: [
      { id: 'my-requests', label: 'My Requests', icon: CheckCircleIcon, path: '/dashboard/tenant/requests' },
      { id: 'active-leases', label: 'Active Leases', icon: DocumentCheckIcon, path: '/dashboard/tenant/active-lease' },
    ]
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Cog6ToothIcon,
    path: '/dashboard/tenant/settings',
  },
  { 
    id: 'help', 
    label: 'Help & Support', 
    icon: QuestionMarkCircleIcon,
    path: '/dashboard/tenant/help'
  },
]

export default function TenantSidebar({ onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard'])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setMobileOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleItem = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId))
    } else {
      setExpandedItems([...expandedItems, itemId])
    }
  }

  const isItemActive = (item: MenuItem) => {
    if (item.path === pathname) return true
    if (item.children) {
      return item.children.some((child: MenuItem) => child.path === pathname)
    }
    return false
  }

  const handleLinkClick = (item: MenuItem) => {
    if (isMobile) {
      setMobileOpen(false)
    }
    if (!item.children) {
      onTabChange(item.id)
    }
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isActive = isItemActive(item)
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)

    return (
      <div key={item.id}>
        <Link
          href={item.path}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault()
              toggleItem(item.id)
            } else {
              handleLinkClick(item)
            }
          }}
          className={`flex items-center ${
            collapsed ? 'justify-center px-2' : 'justify-between px-3 sm:px-4'
          } py-2.5 sm:py-3 rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-emerald-800 text-white shadow-lg'
              : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
          } ${level > 0 ? 'pl-6 sm:pl-8' : ''} ${collapsed && 'justify-center'}`}
          title={collapsed ? item.label : ''}
        >
          <div className="flex items-center">
            <item.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
            {!collapsed && <span className="text-sm sm:text-base truncate">{item.label}</span>}
          </div>
          {!collapsed && hasChildren && (
            <ChevronRightIcon 
              className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'transform rotate-90' : ''}`} 
            />
          )}
        </Link>

        {/* Children */}
        {!collapsed && hasChildren && isExpanded && (
          <div className="ml-2 sm:ml-4 border-l border-emerald-700/50 pl-2">
            {item.children.map((child: MenuItem) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Mobile Menu Button
  const MobileMenuButton = () => (
    <button
      onClick={() => setMobileOpen(!mobileOpen)}
      className="fixed top-4 left-4 z-50 md:hidden bg-emerald-800 text-white p-2 rounded-lg shadow-lg"
    >
      {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
    </button>
  )

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <>
        <aside className={`fixed inset-y-0 left-0 z-40 border-r-4 border-emerald-800 bg-gradient-to-b from-emerald-900 to-green-900 text-white transition-all duration-300 hidden md:block ${
          collapsed ? 'w-20' : 'w-64'
        }`}>
          {/* Logo */}
          <div className="flex flex-col items-center py-6">
            {!collapsed ? (
              <Link href="/dashboard/tenant" className="flex items-center justify-center px-4">
                <Image 
                  src={logo} 
                  alt="Irorun Homes Logo" 
                  className="w-24 sm:w-28 md:w-32 h-auto transition-all duration-300" 
                  priority
                />
              </Link>
            ) : (
              <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">SA</span>
              </div>
            )}
            
            {/* Collapse Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="absolute -right-3 top-16 bg-emerald-800 border-2 border-emerald-600 rounded-full p-1 hover:bg-emerald-700 transition-colors"
            >
              <ChevronRightIcon className={`w-4 h-4 text-white transition-transform duration-300 ${
                collapsed ? 'rotate-180' : ''
              }`} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-2 sm:px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-transparent">
            {menuItems.map((item) => renderMenuItem(item))}
          </nav>

          {/* Version */}
          {!collapsed && (
            <div className="absolute bottom-6 left-0 right-0 px-4">
              <div className="text-center">
                <p className="text-xs text-white/70">v1.0.0 • Tenant Panel</p>
                <p className="text-[10px] text-white/50 mt-2">
                  © {new Date().getFullYear()} Irorun Homes
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Menu Button (hidden on desktop) */}
        <MobileMenuButton />
      </>
    )
  }

  // Mobile Sidebar
  return (
    <>
      <MobileMenuButton />
      
      {/* Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-emerald-900 to-green-900 text-white transform transition-transform duration-300 ease-in-out md:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-800">
          <Link href="/dashboard/tenant" className="flex items-center" onClick={() => setMobileOpen(false)}>
            <Image 
              src={logo} 
              alt="Irorun Homes Logo" 
              className="w-28 h-auto" 
              priority
            />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 hover:bg-emerald-800/50 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>

        {/* Version */}
        <div className="absolute bottom-6 left-0 right-0 px-4">
          <div className="text-center">
            <p className="text-xs text-white/70">v1.0.0 • Tenant Panel</p>
            <p className="text-[10px] text-white/50 mt-2">
              © {new Date().getFullYear()} Irorun Homes
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}