'use client'

import React, { ReactNode, useState } from 'react'
import { useUser } from '../../context/UserContext'
import AdminSidebar from '../../components/dashboard/Bars/AdminSidebar'
import SuperAdminSidebar from '../../components/dashboard/Bars/SuperAdminSidebar'
import TenantSidebar from '../../components/dashboard/Bars/TenantSidebar'
import Header from '../../components/dashboard/Bars/Header'

interface DashboardLayoutProps {
  children: ReactNode
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function DashboardLayout({ 
  children, 
  activeTab = 'dashboard', 
  onTabChange = () => {} 
}: DashboardLayoutProps) {
  const { user } = useUser()
  const [currentPage, setCurrentPage] = useState('Dashboard')
  
  // Handle navigation
  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  // Render the appropriate sidebar based on user role
  const renderSidebar = () => {
    const commonProps = {
      currentPage,
      handleNavigate,
      activeTab,
      onTabChange
    }

    if (!user || !user.role) {
      return <TenantSidebar {...commonProps} />
    }

    switch (user.role.toLowerCase()) {
      case 'super_admin':
        return <SuperAdminSidebar {...commonProps} />
      
      case 'admin':
        return <AdminSidebar {...commonProps} />
      
      case 'tenant':
      default:
        return <TenantSidebar {...commonProps} />
    }
  }

  return (
    <div className="min-h-screen bg-emerald-50/30">
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Main Content - Fixed margin for all sidebars */}
      <div className="lg:ml-64">
        <Header user={user} />
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}