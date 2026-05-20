'use client'

import React from 'react'
import DashboardLayout from '../../../DashboardLayout'
import { DashboardPropertyDetailContent } from '../../../../../components/dashboard/DashboardPropertyDetail'

export default function DashboardPropertyDetail() {
  return (    
    <DashboardLayout>
      <div className="space-y-6">
      <DashboardPropertyDetailContent />
      </div>
    </DashboardLayout>
  )
}