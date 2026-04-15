
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { 
  LockClosedIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { useUser } from '../../../context/UserContext'
import logo from '../../../../public/irorun-logo.png'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const { resetPassword, forgotPassword } = useUser()

  const [step, setStep] = useState<'otp' | 'password'>('otp')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (timer === 0) {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [timer, canResend])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code')
      setLoading(false)
      return
    }

    // For OTP verification, we'll just proceed to password step
    // The actual verification happens during reset
    setStep('password')
    setLoading(false)
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setError('')
    setTimer(60)
    setCanResend(false)

    try {
      await forgotPassword(email)
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to resend code')
      setCanResend(true)
    } finally {
      setLoading(false)
    }
  }

const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  // Validate password
  if (newPassword.length < 8) {
    setError('Password must be at least 8 characters')
    setLoading(false)
    return
  }

  if (newPassword !== confirmPassword) {
    setError('Passwords do not match')
    setLoading(false)
    return
  }

  try {
    const otpCode = otp.join('')
    const result = await resetPassword(email, otpCode, newPassword)
    
    setSuccess(true)
    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
  } catch (err: unknown) {
    setError((err as Error).message || 'Failed to reset password')
  } finally {
    setLoading(false)
  }
}

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-emerald-100 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successfully!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your password has been updated. You&apos;ll be redirected to login shortly.
            </p>
            <div className="animate-pulse text-xs text-gray-500">Redirecting...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <Image src={logo} alt="Irorun Homes Logo" className="h-12 w-auto" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {step === 'otp' ? 'Verify Your Email' : 'Create New Password'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'otp' 
            ? `We sent a verification code to ${email}`
            : 'Enter your new password below'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-emerald-100">
          
          {/* OTP Verification Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* OTP Input Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Enter 6-digit verification code
                </label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              {/* Resend Code */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || loading}
                  className="text-sm text-emerald-600 hover:text-emerald-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {canResend ? 'Resend Code' : `Resend code in ${timer}s`}
                </button>
              </div>

              {/* Back to Forgot Password */}
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Use different email
                </Link>
              </div>
            </form>
          )}

          {/* New Password Step */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4].map((level) => {
                      const hasLowercase = /[a-z]/.test(newPassword)
                      const hasUppercase = /[A-Z]/.test(newPassword)
                      const hasNumber = /\d/.test(newPassword)
                      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                      const isLongEnough = newPassword.length >= 8
                      
                      let strength = 0
                      if (isLongEnough) strength++
                      if (hasLowercase && hasUppercase) strength++
                      if (hasNumber) strength++
                      if (hasSpecial) strength++
                      
                      const isActive = level <= strength
                      
                      return (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            isActive
                              ? strength <= 2
                                ? 'bg-red-500'
                                : strength === 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Password strength: {
                      (() => {
                        const hasLowercase = /[a-z]/.test(newPassword)
                        const hasUppercase = /[A-Z]/.test(newPassword)
                        const hasNumber = /\d/.test(newPassword)
                        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                        const isLongEnough = newPassword.length >= 8
                        
                        let strength = 0
                        if (isLongEnough) strength++
                        if (hasLowercase && hasUppercase) strength++
                        if (hasNumber) strength++
                        if (hasSpecial) strength++
                        
                        if (strength <= 2) return 'Weak'
                        if (strength === 3) return 'Medium'
                        return 'Strong'
                      })()
                    }
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Reset Button */}
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}