
'use client'

import React from 'react'
import Link from 'next/link'
import {
  DocumentTextIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

export default function LegalPage() {
  const documents = [
    {
      title: 'Rental Agreement Template',
      description: 'Standard residential lease agreement compliant with Nigerian tenancy laws.',
      icon: DocumentTextIcon,
      downloadUrl: '/docs/rental-agreement.pdf',
      lastUpdated: 'January 2024'
    },
    {
      title: 'Property Listing Agreement',
      description: 'Agreement between property owner and Irorun Homes for listing services.',
      icon: BuildingOfficeIcon,
      downloadUrl: '/docs/listing-agreement.pdf',
      lastUpdated: 'January 2024'
    },
    {
      title: 'Tenant Application Form',
      description: 'Standard application form for prospective tenants.',
      icon: UserGroupIcon,
      downloadUrl: '/docs/application-form.pdf',
      lastUpdated: 'January 2024'
    },
    {
      title: 'Inspection Checklist',
      description: 'Property condition inspection form for move-in/move-out.',
      icon: ShieldCheckIcon,
      downloadUrl: '/docs/inspection-checklist.pdf',
      lastUpdated: 'January 2024'
    },
    {
      title: 'Rent Receipt Template',
      description: 'Official rent receipt template for payment documentation.',
      icon: CurrencyDollarIcon,
      downloadUrl: '/docs/rent-receipt.pdf',
      lastUpdated: 'January 2024'
    },
    {
      title: 'Notice of Termination',
      description: 'Form for terminating a rental agreement.',
      icon: ScaleIcon,
      downloadUrl: '/docs/termination-notice.pdf',
      lastUpdated: 'January 2024'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Legal Documents</h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            Access and download standard legal documents for your rental needs
          </p>
        </div>
      </section>

      {/* Documents Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {documents.map((doc, index) => {
              const Icon = doc.icon
              return (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{doc.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Updated: {doc.lastUpdated}</span>
                    <a
                      href={doc.downloadUrl}
                      download
                      className="inline-flex items-center text-emerald-600 hover:text-emerald-800"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Legal Disclaimer</h3>
            <p className="text-yellow-700 text-sm">
              These documents are provided as templates and for informational purposes only. 
              They do not constitute legal advice. We recommend consulting with a qualified 
              legal professional before using any of these documents for your specific situation.
            </p>
          </div>
        </div>
      </section>

      {/* Need Help */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Need Help with Legal Documents?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Our team can guide you through the legal requirements and help you choose the right documents.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Contact Legal Support
          </Link>
        </div>
      </section>
    </div>
  )
}