
'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  HeartIcon,
  StarIcon,
  HomeModernIcon,
  BriefcaseIcon,
  SparklesIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import Navbar from '../../components/Home/navbar'
import Footer from '../../components/Home/footer'

export default function AboutPage() {
  const stats = [
    { label: 'Properties Listed', value: '500+', icon: BuildingOfficeIcon },
    { label: 'Happy Tenants', value: '2,000+', icon: UserGroupIcon },
    { label: 'Verified Properties', value: '100%', icon: ShieldCheckIcon },
    { label: 'Cities Covered', value: '10+', icon: GlobeAltIcon }
  ]

  const values = [
    {
      title: 'Trust & Transparency',
      description: 'We personally verify every property before listing. No scams, no fake listings, no surprises.',
      icon: ShieldCheckIcon
    },
    {
      title: 'Tenant First',
      description: 'Every decision we make prioritizes the needs and satisfaction of our tenants.',
      icon: HeartIcon
    },
    {
      title: 'Simplicity',
      description: 'Property owners don\'t need accounts. Just one call, and we handle everything for you.',
      icon: SparklesIcon
    },
    {
      title: 'Excellence',
      description: 'We strive for excellence in every interaction, every property, and every service we provide.',
      icon: StarIcon
    }
  ]

  const howWeWork = [
    {
      title: "For Property Owners",
      description: "You don't need an account. Just contact us, and we handle everything:",
      icon: BriefcaseIcon,
      items: [
        "Free property inspection and photography",
        "Professional listing creation",
        "Tenant screening and verification",
        "Viewing coordination",
        "Lease agreement preparation",
        "Rent collection setup"
      ]
    },
    {
      title: "For Tenants",
      description: "Create a free account to access verified properties:",
      icon: HomeModernIcon,
      items: [
        "Browse admin-verified properties only",
        "Submit rental requests on the platform",
        "Track your rental request status in real-time",
        "Secure payment",
        "Digital lease agreements",
          "24/7 support for any issues or questions"
      ]
    }
  ]

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-600 to-green-700 text-white py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            We&apos;re on a mission to transform the property rental experience in Osun and beyond by doing the hard work for property owners and providing verified, scam-free homes for tenants.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                To eliminate the stress and uncertainty from property rental. For property owners, we handle everything from listing to tenant placement. For tenants, we provide 100% verified properties so you can rent with confidence, knowing you&apos;ll never fall victim to rental scams.
              </p>
              <div className="space-y-4">
                {[
                  'Every property is physically verified by our team',
                  'No landlord accounts needed - we do all the work',
                  'Simple, transparent pricing with no hidden fees',
                  'Building a trusted community of verified properties'
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600 mr-3" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/mission.jpg"
                alt="Our Mission"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">How We&apos;re Different</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            We don&apos;t just list properties - we manage the entire process for property owners and guarantee scam-free homes for tenants.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {howWeWork.map((section, index) => {
              const Icon = section.icon
              return (
                <div key={index} className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                      <Icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-6">{section.description}</p>
                  <ul className="space-y-3">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Verification Promise */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <ShieldCheckIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Our Verification Promise</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Every single property on Irorun Homes & properties is personally verified by our team. We physically inspect each property, meet with the owner, and validate all documents before any listing goes live.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-emerald-200">Properties Verified</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-white mb-1">Zero</div>
              <div className="text-emerald-200">Scam Reports</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-white mb-1">24h</div>
              <div className="text-emerald-200">Avg. Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Simple Process */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Simple, Transparent Process</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            No complicated accounts. No hidden fees. Just honest service.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm mr-2">1</span>
                For Property Owners
              </h3>
              <p className="text-gray-600">Contact us → We inspect & photograph → We list & market → We screen tenants → You collect rent</p>
              <p className="text-sm text-emerald-600 mt-3 font-medium">You never need an account. Just one call.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm mr-2">2</span>
                For Tenants
              </h3>
              <p className="text-gray-600">Create free account → Browse verified properties → Apply online → Get approved → Move in</p>
              <p className="text-sm text-emerald-600 mt-3 font-medium">Every property is verified. No scams, ever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              href="/"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Find a Home
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-emerald-200">
            <div className="flex items-center">
              <PhoneIcon className="w-4 h-4 mr-2" />
              <span>+234 123 456 7890</span>
            </div>
            <div className="flex items-center">
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              <span>hello@irorunhomes.com</span>
            </div>
          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  )
}