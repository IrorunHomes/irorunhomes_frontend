
'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: [
        'Personal information you provide (name, email, phone, address)',
        'Property information when listing',
        'Payment information (processed securely through third-party providers)',
        'Usage data and cookies',
        'Communications with our support team'
      ]
    },
    {
      title: '2. How We Use Your Information',
      content: [
        'To provide and improve our services',
        'To process your transactions',
        'To communicate with you about your account',
        'To send you updates and marketing communications (with consent)',
        'To prevent fraud and ensure security',
        'To comply with legal obligations'
      ]
    },
    {
      title: '3. Information Sharing',
      content: [
        'We do not sell your personal information',
        'Information is shared with landlords/tenants as necessary for rental agreements',
        'Payment information is shared with our payment processors',
        'We may share information to comply with legal requirements',
        'Aggregated, anonymized data may be used for analytics'
      ]
    },
    {
      title: '4. Data Security',
      content: [
        'We use industry-standard encryption to protect your data',
        'Regular security audits and monitoring',
        'Access controls and authentication requirements',
        'Secure data centers and backup systems',
        'Employee training on data protection'
      ]
    },
    {
      title: '5. Your Rights',
      content: [
        'Access your personal data',
        'Correct inaccurate information',
        'Request deletion of your data',
        'Opt-out of marketing communications',
        'Export your data',
        'Withdraw consent at any time'
      ]
    },
    {
      title: '6. Cookies and Tracking',
      content: [
        'Essential cookies for site functionality',
        'Analytics cookies to improve our service',
        'Marketing cookies for personalized content',
        'You can control cookie preferences in your browser'
      ]
    },
    {
      title: '7. Third-Party Services',
      content: [
        'Payment processors (secure, PCI compliant)',
        'Analytics providers',
        'Cloud hosting services',
        'Email communication services',
        'Customer support tools'
      ]
    },
    {
      title: '8. Children\'s Privacy',
      content: [
        'Our services are not intended for users under 18',
        'We do not knowingly collect information from minors',
        'If you believe a minor has provided information, contact us immediately'
      ]
    },
    {
      title: '9. International Data Transfers',
      content: [
        'Your information may be processed in different countries',
        'We ensure appropriate safeguards are in place',
        'Compliance with international data protection regulations'
      ]
    },
    {
      title: '10. Changes to This Policy',
      content: [
        'We may update this policy periodically',
        'Significant changes will be notified via email',
        'Continued use of our services constitutes acceptance'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <ShieldCheckIcon className="w-20 h-20 text-emerald-200" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            Last Updated: February 15, 2024
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            At SackAgent, we take your privacy seriously. This policy describes how we collect, 
            use, and protect your personal information when you use our platform. By using our 
            services, you consent to the practices described in this policy.
          </p>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Your Privacy?</h2>
          <p className="text-lg text-gray-600 mb-8">
            If you have any questions or concerns about our privacy practices, please contact us.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Contact Our Privacy Team
          </Link>
        </div>
      </section>
    </div>
  )
}