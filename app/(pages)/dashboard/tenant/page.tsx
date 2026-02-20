
'use client'

import React from 'react'
import DashboardLayout from '../../../(pages)/dashboard/DashboardLayout'
import PropertyListings from '../../../components/Property/PropertyListings'

export default function TenantDashboard() {
  return (
    <DashboardLayout activeTab="dashboard" onTabChange={() => {}}>
        <PropertyListings />
    </DashboardLayout>
  )
}