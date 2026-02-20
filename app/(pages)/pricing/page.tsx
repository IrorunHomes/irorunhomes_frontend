
'use client'

import React from 'react'
import Link from 'next/link'
import {
  CheckCircleIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  HomeModernIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Navbar from '../../components/Home/navbar'
import Footer from '../../components/Home/footer'

export default function PricingPage() {
  const pricingModels = [
    {
      title: "For Property Owners",
      description: "We handle everything. You just collect rent.",
      icon: BuildingOfficeIcon,
      price: "10%",
      period: "commission",
      features: [
        "Professional property listing by our team",
        "High-quality photography included",
        "Thorough tenant screening and verification",
        "Digital lease agreement preparation",
        "Rent collection and management",
        "Maintenance coordination",
        "Legal document handling",
        "Dedicated property manager",
        "Regular property inspections",
        "Tenant communication management"
      ],
      note: "Only 10% of first month's rent when we place a tenant. No other fees.",
      actionText: "Contact Us to List",
      actionLink: "/contact"
    },
    {
      title: "For Tenants",
      description: "Find your verified dream home",
      icon: HomeModernIcon,
      price: "10%",
      period: "of annual rent",
      features: [
        "Access to all verified properties",
        "Save favorite properties",
        "Submit rental applications",
        "Real-time application tracking",
        "Digital lease signing",
        "Secure payment processing",
        "Maintenance request portal",
        "24/7 tenant support",
        "All properties are admin-verified",
        "No agent meetings required"
      ],
      note: "One-time fee of 10% of annual rent when approved",
      actionText: "Register as Tenant",
      actionLink: "/register/tenant"
    }
  ]

  const howItWorksLandlord = [
    {
      step: "1",
      title: "Contact Us",
      description: "Reach out to our team via phone, email, or contact form."
    },
    {
      step: "2",
      title: "Property Inspection",
      description: "We visit your property for assessment and professional photography."
    },
    {
      step: "3",
      title: "Listing Creation",
      description: "Our team creates a compelling listing with all details."
    },
    {
      step: "4",
      title: "Tenant Screening",
      description: "We handle all inquiries, viewings, and tenant verification."
    },
    {
      step: "5",
      title: "Lease & Rent",
      description: "We prepare the lease and you start collecting rent."
    }
  ]

  const howItWorksTenant = [
    {
      step: "1",
      title: "Create Account",
      description: "Register for free and complete your tenant profile."
    },
    {
      step: "2",
      title: "Browse Properties",
      description: "Search through our verified property listings."
    },
    {
      step: "3",
      title: "Submit Application",
      description: "Apply to properties you're interested in."
    },
    {
      step: "4",
      title: "Get Approved",
      description: "Receive notification when your application is approved."
    },
    {
      step: "5",
      title: "Pay & Move In",
      description: "Pay the one-time fee and move into your new home."
    }
  ]

  const whatsIncluded = [
    {
      category: "For Property Owners",
      items: [
        "✓ Free property listing - we do all the work",
        "✓ Professional photography at no cost",
        "✓ Comprehensive tenant background checks",
        "✓ Digital lease agreement preparation",
        "✓ Automated rent collection",
        "✓ Maintenance request management",
        "✓ Legal document assistance",
        "✓ Dedicated property manager",
        "✓ Property marketing and exposure",
        "✓ Tenant communication handling",
        "✓ Regular property inspections",
        "✓ Move-in/move-out coordination"
      ]
    },
    {
      category: "For Tenants",
      items: [
        "✓ Browse unlimited properties for free",
        "✓ All properties are verified by our team",
        "✓ Save and compare favorites",
        "✓ Submit applications online",
        "✓ Track application status in real-time",
        "✓ Digital document upload",
        "✓ Secure payment portal",
        "✓ Maintenance request system",
        "✓ Lease renewal management",
        "✓ 24/7 customer support",
        "✓ No agent meetings required",
        "✓ Verified property listings only"
      ]
    }
  ]

  const whatsNotIncluded = [
    {
      category: "No Hidden Fees Ever",
      items: [
        "✗ No agent fees",
        "✗ No inspection fees",
        "✗ No application fees",
        "✗ No viewing fees",
        "✗ No administration fees",
        "✗ No processing fees",
        "✗ No listing fees",
        "✗ No marketing fees",
        "✗ No photography fees",
        "✗ No document fees"
      ]
    }
  ]

  const faqs = [
    {
      q: 'How do I list my property?',
      a: 'Simply contact us through our website, phone, or email. Our team will schedule a visit to assess your property, take professional photos, and handle the entire listing process for you. You don\'t need to create an account or do any of the work.'
    },
    {
      q: 'Do I need to create an account as a landlord?',
      a: 'No! Property owners don\'t need accounts. We handle everything for you. Just contact us, and we\'ll take care of listing, tenant screening, viewings, and paperwork. You only get involved when it\'s time to collect rent.'
    },
    {
      q: 'How does the 10% commission work for property owners?',
      a: 'You only pay when we successfully place a tenant in your property. The 10% commission is a one-time fee based on the first month\'s rent. After that, you keep 100% of the rent. There are no ongoing fees or hidden charges.'
    },
    {
      q: 'What does the 10% tenant fee cover?',
      a: 'The one-time 10% fee (based on annual rent) covers our comprehensive tenant screening, application processing, digital lease agreement, and ongoing support throughout your tenancy. You pay nothing else - no agent fees, no inspection fees, no hidden charges.'
    },
    {
      q: 'Are properties verified?',
      a: 'Yes! Every property on our platform is physically inspected and verified by our team before listing. We ensure all listings are legitimate, accurately represented, and meet our quality standards.'
    },
    {
      q: 'How do I know the property is legitimate?',
      a: 'All properties are admin-verified. Our team personally inspects every property, meets with the owner, and verifies all documentation before any property is listed. You can rent with confidence knowing we\'ve done the due diligence.'
    },
    {
      q: 'What about maintenance and repairs?',
      a: 'We coordinate all maintenance requests between tenants and property owners. Simply submit a request through your tenant portal, and we\'ll handle communication with the owner and arrange for repairs. We never charge fees for coordinating maintenance.'
    }
  ]

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            Property owners: We do all the work. Tenants: Find verified homes. No hidden fees, no landlord accounts needed.
          </p>
        </div>
      </section>

      {/* Commission Model Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingModels.map((model, index) => {
              const Icon = model.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow"
                >
                  <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-8 text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{model.title}</h2>
                    <p className="text-emerald-100">{model.description}</p>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-baseline mb-6">
                      <span className="text-5xl font-bold text-gray-900">{model.price}</span>
                      <span className="text-lg text-gray-600 ml-2">{model.period}</span>
                    </div>
                    
                    <p className="text-sm text-emerald-600 font-medium mb-6 bg-emerald-50 p-3 rounded-lg">
                      {model.note}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {model.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircleSolidIcon className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={model.actionLink}
                      className="block w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-700 text-white text-center font-semibold rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-xl"
                    >
                      {model.actionText}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Landlord */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full mb-4">
              <BriefcaseIcon className="w-5 h-5 mr-2" />
              <span className="font-semibold">For Property Owners</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">We Do All The Work</h2>
            <p className="text-xl text-gray-600 mt-2">No account needed. Just contact us and relax.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {howItWorksLandlord.map((step, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md text-center relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 mt-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/contact-us"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Contact Us to List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - Tenant */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full mb-4">
              <HomeModernIcon className="w-5 h-5 mr-2" />
              <span className="font-semibold">For Tenants</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Find Your Verified Home</h2>
            <p className="text-xl text-gray-600 mt-2">All properties are admin-verified for your peace of mind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {howItWorksTenant.map((step, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-md text-center relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 mt-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Register as Tenant
            </Link>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">What&apos;s Included</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Everything you need, no hidden costs
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {whatsIncluded.map((section, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{section.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's NOT Included - No Hidden Fees */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-200">
            <h2 className="text-3xl font-bold text-red-800 text-center mb-4">No Hidden Fees. Period.</h2>
            <p className="text-lg text-red-700 text-center mb-8 max-w-3xl mx-auto">
              We don&apos;t believe in nickel-and-diming our users. Here&apos;s what you&apos;ll NEVER pay with SackAgent:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {whatsNotIncluded[0].items.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <XCircleIcon className="w-6 h-6 text-red-500 mx-auto mb-1" />
                  <span className="text-xs text-gray-700">{item.replace('✗ ', '')}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center bg-green-100 text-green-800 px-6 py-3 rounded-full">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                <span className="font-semibold">Just pay our simple commission when we deliver results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Badge */}
      <section className="py-12 bg-gradient-to-r from-emerald-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
            <ShieldCheckIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">All Properties Are Admin-Verified</h2>
          <p className="text-xl text-emerald-100 mb-6">
            Every single property on our platform has been physically inspected and verified by our team.
            No scams, no fake listings, no wasting your time.
          </p>
          <div className="flex justify-center space-x-8 text-white">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              <span>Physical inspection</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              <span>Owner verification</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              <span>Document validation</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Property owners: Let us handle everything. Tenants: Find your verified home today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact-us"
              className="px-8 py-4 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              List Your Property
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Register as Tenant
            </Link>
          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  )
}