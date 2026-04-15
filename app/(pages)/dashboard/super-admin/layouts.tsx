
'use client'

import React from 'react'
import DashboardLayout from '../../dashboard/DashboardLayout'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}