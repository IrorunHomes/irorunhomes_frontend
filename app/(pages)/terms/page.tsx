// app/(marketing)/terms/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

export default function TermsOfServicePage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using SackAgent, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not use our services.'
    },
    {
      title: '2. Description of Service',
      content: 'SackAgent provides a platform connecting property owners/landlords with potential tenants. We facilitate property listings, rental applications, payments, and lease management.'
    },
    {
      title: '3. User Accounts',
      items: [
        'You must be at least 18 years old to use our services',
        'You are responsible for maintaining account security',
        'Provide accurate and complete information',
        'Notify us immediately of unauthorized access',
        'We reserve the right to suspend accounts for violations'
      ]
    },
    {
      title: '4. For Landlords',
      items: [
        'You represent that you have the right to list properties',
        'Property information must be accurate and truthful',
        'Comply with all applicable housing laws',
        'Respond to tenant applications in a timely manner',
        'Honor approved rental agreements'
      ]
    },
    {
      title: '5. For Tenants',
      items: [
        'Provide accurate information in applications',
        'Use properties only as intended',
        'Pay rent and fees as agreed',
        'Comply with lease terms and conditions',
        'Report issues promptly to landlords'
      ]
    },
    {
      title: '6. Fees and Payments',
      items: [
        'Service fees are clearly displayed before transaction',
        'Payment processing fees may apply',
        'Fees are non-refundable except as required by law',
        'We may change fees with notice',
        'Taxes are your responsibility'
      ]
    },
    {
      title: '7. Prohibited Activities',
      items: [
        'Misrepresenting identity or property details',
        'Harassing or discriminating against users',
        'Posting false or misleading information',
        'Attempting to circumvent our fees',
        'Using the platform for illegal activities',
        'Interfering with platform operations'
      ]
    },
    {
      title: '8. Intellectual Property',
      content: 'All content on SackAgent, including logos, designs, and software, is owned by us or our licensors. You may not use our intellectual property without permission.'
    },
    {
      title: '9. Limitation of Liability',
      content: 'To the maximum extent permitted by law, SackAgent shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.'
    },
    {
      title: '10. Dispute Resolution',
      items: [
        'Informal resolution first',
        'Binding arbitration for unresolved disputes',
        'Class action waiver',
        'Jurisdiction in Lagos, Nigeria',
        'One-year statute of limitations'
      ]
    },
    {
      title: '11. Termination',
      content: 'We may terminate or suspend your account for violations of these terms. You may terminate your account at any time by contacting us.'
    },
    {
      title: '12. Changes to Terms',
      content: 'We may update these terms periodically. Continued use after changes constitutes acceptance.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <DocumentTextIcon className="w-20 h-20 text-emerald-200" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            Last Updated: February 15, 2024
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            Welcome to SackAgent. These terms govern your use of our platform and services. 
            Please read them carefully before using SackAgent.
          </p>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                {section.content && (
                  <p className="text-gray-700 mb-4">{section.content}</p>
                )}
                {section.items && (
                  <ul className="list-disc pl-6 space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Our Terms?</h2>
          <p className="text-lg text-gray-600 mb-8">
            If you have any questions about these terms, please contact our legal team.
          </p>
          <Link
            href="/contact-us"
            className="inline-block px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Contact Legal Team
          </Link>
        </div>
      </section>
    </div>
  )
}