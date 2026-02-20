'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LoginCredentials } from '../../../types/auth'
import Navbar from '../../../components/Home/navbar'
import { useUser } from '../../../context/UserContext'
import { authService } from '../../../api/auth'
import { AxiosError } from 'axios'

const LoginPage = () => {
  const router = useRouter()
  const { login } = useUser()
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setError(null)

    // Validation
    if (!formData.email.trim() || !formData.password) {
      setErrors({ general: 'Please fill in all fields' })
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setErrors({ email: 'Please enter a valid email address' })
      setIsLoading(false)
      return
    }

    try {     
      const response = await authService.login({ 
        email: formData.email.trim().toLowerCase(), 
        password: formData.password 
      })

      
      // Check if we have the required data
      if (!response || !response.user || !response.accessToken) {
        setError('Invalid response from server. Please try again.')
        setIsLoading(false)
        return
      }

      // Handle email verification
      if (response.user && (!response.user.isEmailVerified || !response.user.isVerified)) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email.trim().toLowerCase())}`)
        setIsLoading(false)
        return
      }

      // Update context - This is the key change!
      login(response.user, response.accessToken)
      
      // Redirect based on role
      setTimeout(() => {
        if (response.user?.role === 'tenant' && !response.user.kycVerified) {
          router.push('/dashboard/tenant')
        } else if (response.user?.role === 'super_admin') {
          router.push('/dashboard/super-admin')
        } else if (response.user?.role === 'admin') {
          router.push('/dashboard/super-admin/admin')
        } else {
          // Fallback or default route
          redirectBasedOnRole(response.user?.role || 'tenant', router)
        }
      }, 100) // Short delay to ensure context updates

    } catch (err: unknown) {
      console.error('Login error:', err)
      
      // Handle Axios errors
      if (err instanceof AxiosError) {
        const errorData = err.response?.data as unknown as { message?: string; error?: string }
        const errorMessage = errorData?.message || 
                            errorData?.error || 
                            err.message || 
                            'Login failed. Please check your credentials.'
        
        if (err.code === 'ECONNABORTED' || err.message?.includes('Network')) {
          setError('Network error. Please check your connection.')
        } else {
          setError(errorMessage)
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Login failed. Please check your credentials.')
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    // Clear general error
    if (error) {
      setError(null)
    }
  }

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/register" className="font-medium text-emerald-600 hover:text-emerald-500">
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
            {/* Display general errors */}
            {(error || errors.general) && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error || errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-emerald-600 hover:text-emerald-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="font-medium text-emerald-600 hover:text-emerald-500">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="font-medium text-emerald-600 hover:text-emerald-500">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage

function redirectBasedOnRole(role: string, router: ReturnType<typeof useRouter>) {
  switch (role) {
    case 'tenant':
      router.push('/dashboard/tenant')
      break
    case 'admin':
      router.push('/dashboard/admin')
      break
    case 'super_admin':
      router.push('/dashboard/super-admin') // Fixed: was '/dashboard/super_admin'
      break
    default:
      router.push('/dashboard')
  }
}