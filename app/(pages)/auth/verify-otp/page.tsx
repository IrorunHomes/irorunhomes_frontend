// app/(auth)/verify-otp/page.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authService } from '../../../api/auth'
import { AuthError, EmailNotVerifiedError } from '../../../api/auth'

interface ErrorResponse {
  message?: string
  success?: boolean
  error?: string
  errors?: Record<string, string[]> | string[]
  email?: string
}

const VerifyOTPPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Initialize the refs array
    inputRefs.current = inputRefs.current.slice(0, 6)
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1]
    }
    
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')
    setSuccessMessage('')
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const pastedDigits = pastedData.replace(/\D/g, '').split('').slice(0, 6)
    
    if (pastedDigits.length === 6) {
      const newOtp = [...otp]
      pastedDigits.forEach((digit, index) => {
        newOtp[index] = digit
      })
      setOtp(newOtp)
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.some(digit => !digit)) {
      setError('Please enter the complete 6-digit code')
      return
    }
    
    setIsLoading(true)
    setError('')
    setSuccessMessage('')
    
    try {
      // Combine OTP digits into a single string
      const otpCode = otp.join('')
      
      // Call the auth service to verify OTP
      const response = await authService.verifyEmail(email, otpCode)
      
      if (response.success) {
        setSuccessMessage('Email verified successfully! Redirecting...')
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        throw new Error(response.message || 'OTP verification failed')
      }
    } catch (error: unknown) {
      console.error('OTP verification failed:', error)
      
      // Handle specific error cases with proper type checking
      if (error instanceof AuthError) {
        setError(error.message)
      } else if (error instanceof EmailNotVerifiedError) {
        setError(`${error.message}. Please check your email.`)
      } else if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        
        if (errorMessage.includes('invalid') || errorMessage.includes('invalid')) {
          setError('Invalid verification code. Please try again.')
        } else if (errorMessage.includes('expired')) {
          setError('This verification code has expired. Please request a new one.')
        } else if (errorMessage.includes('already verified')) {
          setError('This email is already verified. Please proceed to login.')
          setTimeout(() => {
            router.push('/auth/login')
          }, 3000)
        } else {
          setError(error.message || 'Verification failed. Please try again.')
        }
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: ErrorResponse } }
        const errorData = axiosError.response?.data
        
        if (errorData?.errors) {
          if (Array.isArray(errorData.errors)) {
            setError(errorData.errors.join(', '))
          } else if (typeof errorData.errors === 'object') {
            const errorMessages = Object.values(errorData.errors).flat().join(', ')
            setError(errorMessages)
          } else {
            setError('Verification failed. Please try again.')
          }
        } else if (errorData?.message) {
          setError(errorData.message)
        } else {
          setError('Verification failed. Please try again.')
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend || !email) return
    
    setIsLoading(true)
    setError('')
    setSuccessMessage('')
    
    try {
      // Call the auth service to resend OTP
      const response = await authService.resendOtp(email)
      
      if (response.message) {
        setSuccessMessage('A new verification code has been sent to your email.')
        
        // Reset countdown
        setCountdown(60)
        setCanResend(false)
        
        // Clear OTP fields and refocus first input
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        throw new Error('Failed to resend verification code')
      }
    } catch (error: unknown) {
      console.error('Failed to resend OTP:', error)
      
      if (error instanceof AuthError) {
        const errorMessage = error.message.toLowerCase()
        if (errorMessage.includes('rate limit') || errorMessage.includes('wait')) {
          setError('Please wait a moment before requesting a new code.')
        } else {
          setError(error.message)
        }
      } else if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        if (errorMessage.includes('rate limit') || errorMessage.includes('wait')) {
          setError('Please wait a moment before requesting a new code.')
        } else {
          setError('Failed to resend code. Please try again.')
        }
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: ErrorResponse } }
        const errorData = axiosError.response?.data
        
        if (errorData?.errors) {
          if (Array.isArray(errorData.errors)) {
            setError(errorData.errors.join(', '))
          } else if (typeof errorData.errors === 'object') {
            const errorMessages = Object.values(errorData.errors).flat().join(', ')
            setError(errorMessages)
          } else {
            setError('Failed to resend code. Please try again.')
          }
        } else if (errorData?.message) {
          setError(errorData.message)
        } else {
          setError('Failed to resend code. Please try again.')
        }
      } else {
        setError('Failed to resend code. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-emerald-600">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                6-digit verification code
              </label>
              <div className="flex justify-between space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={isLoading}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify Email'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Did not receive the code?{' '}
              <button
                onClick={handleResendOTP}
                disabled={!canResend || isLoading}
                className={`font-medium ${canResend && !isLoading ? 'text-emerald-600 hover:text-emerald-500' : 'text-gray-400 cursor-not-allowed'}`}
              >
                {canResend ? 'Resend code' : `Resend in ${countdown}s`}
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <Link
                href="/auth/register"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
              >
                ← Back to registration
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <div className="bg-emerald-50 p-6 rounded-lg">
            <h4 className="text-sm font-medium text-emerald-800 mb-2">Need help?</h4>
            <p className="text-sm text-emerald-700">
              Check your spam folder or contact{' '}
              <a href="mailto:support@sackagent.com" className="font-medium underline">
                support@sackagent.com
              </a>
            </p>
            <p className="text-sm text-emerald-600 mt-2">
              The code is valid for 10 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTPPage