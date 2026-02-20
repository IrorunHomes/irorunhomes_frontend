// app/(auth)/register/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RegistrationData } from '../../../types/auth'
import Navbar from '../../../components/Home/navbar'
import { authService } from '../../../api/auth'
import { AuthError } from '../../../api/auth'

interface ErrorResponse {
  message?: string
  success?: boolean
  error?: string
  errors?: Record<string, string[]> | string[]
  email?: string
}

const RegisterPage = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'tenant',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email address'
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    } else if (step === 2) {
      if (!formData.password) newErrors.password = 'Password is required'
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase and numbers'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    } else if (step === 3) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')
    
    // If it starts with 0, replace with +234
    if (digits.startsWith('0')) {
      return '+234' + digits.substring(1)
    }
    
    // If it starts with 234, add + prefix
    if (digits.startsWith('234')) {
      return '+' + digits
    }
    
    // If it starts with +234, leave as is
    if (digits.startsWith('234')) {
      return '+' + digits
    }
    
    // If it's 10 digits (no country code), assume it's Nigerian and add +234
    if (digits.length === 10) {
      return '+234' + digits
    }
    
    // If it's already formatted with +, return as is
    if (phone.startsWith('+')) {
      return phone
    }
    
    // Default: add +234 prefix
    return '+234' + digits
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep()) return
    
    setIsLoading(true)
    
    try {
      // Format phone number with +234
      const formattedPhone = formatPhoneNumber(formData.phone)
      
      // Call the auth service to register
      const response = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formattedPhone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        agreeToTerms: formData.agreeToTerms
      })
      
      if (response.success) {
        // Redirect to OTP verification
        router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`)
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error: unknown) {
      console.error('Registration failed:', error)
      
      // Handle specific error cases
      if (error instanceof AuthError) {
        setErrors({ submit: error.message })
      } else if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        
        if (errorMessage.includes('email already exists') || errorMessage.includes('email taken')) {
          setErrors({ email: 'This email is already registered. Please try logging in.' })
        } else if (errorMessage.includes('phone') && errorMessage.includes('taken')) {
          setErrors({ phone: 'This phone number is already registered.' })
        } else {
          setErrors({ submit: error.message || 'Registration failed. Please try again.' })
        }
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: ErrorResponse } }
        const errorData = axiosError.response?.data
        
        if (errorData?.errors) {
          const errorMessages: Record<string, string> = {}
          
          if (Array.isArray(errorData.errors)) {
            setErrors({ submit: errorData.errors.join(', ') })
          } else if (typeof errorData.errors === 'object') {
            Object.entries(errorData.errors).forEach(([key, messages]) => {
              errorMessages[key] = Array.isArray(messages) ? messages.join(', ') : messages
            })
            setErrors(errorMessages)
          }
        } else if (errorData?.message) {
          setErrors({ submit: errorData.message })
        } else {
          setErrors({ submit: 'Registration failed. Please try again.' })
        }
      } else {
        setErrors({ submit: 'An unexpected error occurred. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Remove all non-digit characters for processing
    const digits = value.replace(/\D/g, '')
    
    // If user starts typing with 0, auto-add +234
    if (digits.startsWith('0')) {
      value = '+234' + digits.substring(1)
    }
    // If user types 234, add + prefix
    else if (digits.startsWith('234') && !value.startsWith('+')) {
      value = '+' + digits
    }
    // If user types +, allow them to type whatever they want
    else if (value.startsWith('+')) {
      // Keep as is
    }
    // If user types 10 digits (no prefix), auto-add +234
    else if (digits.length === 10 && !value.startsWith('+')) {
      value = '+234' + digits
    }
    
    setFormData(prev => ({
      ...prev,
      phone: value
    }))
    
    // Clear phone error if it exists
    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.phone
        return newErrors
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name === 'phone') {
      handlePhoneChange(e as React.ChangeEvent<HTMLInputElement>)
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const displayPhone = formData.phone || ''

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt- text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-500">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
            {/* Progress Steps */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((stepNumber) => (
                  <React.Fragment key={stepNumber}>
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${step >= stepNumber 
                          ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white' 
                          : 'bg-gray-200 text-gray-400'
                        }
                        ${step === stepNumber ? 'ring-4 ring-emerald-100' : ''}
                      `}>
                        {step > stepNumber ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          stepNumber
                        )}
                      </div>
                      <span className="mt-2 text-xs font-medium">
                        {stepNumber === 1 && 'Personal Info'}
                        {stepNumber === 2 && 'Account Setup'}
                        {stepNumber === 3 && 'Confirmation'}
                      </span>
                    </div>
                    {stepNumber < 3 && (
                      <div className={`flex-1 h-1 mx-4 ${step > stepNumber ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.fullName ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

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
                      className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">+234</span>
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={displayPhone}
                        onChange={handlePhoneChange}
                        className={`mt-1 block w-full pl-16 pr-3 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                        placeholder="8123456789"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Account Setup</h3>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password *
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Must be at least 8 characters with uppercase, lowercase, and numbers
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="hidden">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      I am a *
                    </label>
                    <input
                      type="hidden"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Review & Confirm</h3>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">{formData.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{formData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{formData.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Account Type</p>
                          <p className="font-medium capitalize">
                            {formData.role === 'tenant' ? 'Tenant' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="agreeToTerms"
                          name="agreeToTerms"
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={handleChange}
                          className={`h-4 w-4 ${errors.agreeToTerms ? 'border-red-300 text-red-600' : 'border-gray-300 text-emerald-600'} rounded focus:ring-emerald-500`}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                          I agree to the{' '}
                          <Link href="/terms" className="text-emerald-600 hover:text-emerald-500">
                            Terms of Service
                          </Link>
                          {' '}and{' '}
                          <Link href="/privacy" className="text-emerald-600 hover:text-emerald-500">
                            Privacy Policy
                          </Link>
                        </label>
                        {errors.agreeToTerms && (
                          <p className="mt-1 text-red-600">{errors.agreeToTerms}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="newsletter"
                          name="newsletter"
                          type="checkbox"
                          className="h-4 w-4 border-gray-300 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="newsletter" className="text-gray-700">
                          I want to receive updates, offers, and news from SackAgent
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-2 flex justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default RegisterPage