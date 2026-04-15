'use client'

import React from 'react'
import {
  PlusCircleIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export default function QuickActions() {
  const actions = [
    {
      title: 'Add New Property',
      description: 'Create a new property listing',
      icon: PlusCircleIcon,
      color: 'from-emerald-500 to-green-500',
      path: '/dashboard/super-admin/properties/add'
    },
    {
      title: 'Review Requests',
      description: 'Check pending rental requests',
      icon: DocumentCheckIcon,
      color: 'from-blue-500 to-cyan-500',
      path: '/dashboard/super-admin/rental-requests'
    },
    {
      title: 'Add Admin User',
      description: 'Create a new admin account',
      icon: UserGroupIcon,
      color: 'from-purple-500 to-pink-500',
      path: '/dashboard/super-admin/add-admin'
    },
    {
      title: 'Send Notifications',
      description: 'Broadcast announcements',
      icon: BellIcon,
      color: 'from-red-500 to-rose-500',
      path: '/dashboard/super-admin/settings/notifications'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Cog6ToothIcon,
      color: 'from-gray-500 to-slate-500',
      path: '/dashboard/super-admin/settings'
    },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-emerald-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.path}
            className="group p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-medium text-emerald-900 group-hover:text-emerald-700 mb-1">
              {action.title}
            </h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}