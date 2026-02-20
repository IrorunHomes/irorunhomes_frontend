// app/(auth)/registration-success/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const RegistrationSuccessPage = () => {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-4 shadow-xl sm:rounded-lg sm:px-10 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-emerald-100 to-green-100">
            <svg className="h-12 w-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="mt-6 text-2xl font-bold text-gray-900">
            Account Created Successfully!
          </h3>
          
          <p className="mt-4 text-gray-600">
            Welcome to SackAgent! Your account has been created and is ready to use.
          </p>

          <div className="mt-8 space-y-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => router.push('/properties')}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Browse Properties
            </button>

            <div className="pt-4">
              <Link
                href="/"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-6 bg-emerald-50 p-6 rounded-lg">
          <h4 className="text-sm font-medium text-emerald-800 mb-3">Whats next?</h4>
          <ul className="space-y-2 text-sm text-emerald-700">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Complete your profile to get personalized recommendations
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Set up notifications for new property listings
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Explore our blog for housing tips and Bay Area insights
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RegistrationSuccessPage