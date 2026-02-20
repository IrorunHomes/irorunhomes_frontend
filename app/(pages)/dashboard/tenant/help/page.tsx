
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useUser } from '../../../../context/UserContext'
import DashboardLayout from '../../DashboardLayout'
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  LifebuoyIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  XCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

interface SupportTicket {
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high'
  category: string
}

const faqs: FAQ[] = [
  {
    id: '1',
    category: 'Account',
    question: 'How do I create an account?',
    answer: 'Click on the "Sign Up" button on the homepage. Fill in your details including name, email, and password. Verify your email address through the confirmation link sent to your inbox, and you\'re ready to start exploring properties!'
  },
  {
    id: '2',
    category: 'Account',
    question: 'I forgot my password. How can I reset it?',
    answer: 'On the login page, click "Forgot Password". Enter your registered email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
  },
  {
    id: '3',
    category: 'Account',
    question: 'How do I update my profile information?',
    answer: 'Go to Settings > Profile Information from your dashboard. You can update your name, phone number, and profile picture there. Email address cannot be changed for security reasons.'
  },
  {
    id: '4',
    category: 'Properties',
    question: 'How do I search for properties?',
    answer: 'Use the search bar on the homepage or Properties page. You can filter by location, price range, property type, bedrooms, and more. Save your favorite properties by clicking the heart icon on any property card.'
  },
  {
    id: '5',
    category: 'Properties',
    question: 'What do property statuses mean?',
    answer: 'Properties have different statuses: "Available" means you can apply, "Pending" means applications are being reviewed, "Rented" means the property is no longer available, and "Maintenance" means the property is temporarily unavailable.'
  },
  {
    id: '6',
    category: 'Rental Requests',
    question: 'How do I apply for a property?',
    answer: 'Navigate to the property details page and click "Request to Rent". Fill in your message and preferred move-in date. Your request will be sent to the admin for review.'
  },
  {
    id: '7',
    category: 'Rental Requests',
    question: 'How long does it take to get a response?',
    answer: 'Rental requests are typically reviewed within 24-48 hours. You\'ll receive an email notification once a decision is made, and you can track the status in your dashboard under "My Requests".'
  },
  {
    id: '8',
    category: 'Rental Requests',
    question: 'Can I cancel a rental request?',
    answer: 'Yes, you can cancel pending requests from the request details page. Once a request is approved or rejected, it cannot be cancelled.'
  },
  {
    id: '9',
    category: 'Payments',
    question: 'How do I make a payment?',
    answer: 'After your request is approved, go to the request details page and click "Upload Payment Receipt". Fill in the payment details and upload your receipt. The admin will verify your payment within 24-48 hours.'
  },
  {
    id: '10',
    category: 'Payments',
    question: 'What payment methods are accepted?',
    answer: 'We accept bank transfers, mobile money, cash, and checks. Make sure to include the transaction reference when uploading your receipt for faster verification.'
  },
  {
    id: '11',
    category: 'Leases',
    question: 'What happens after my payment is verified?',
    answer: 'Once your payment is verified, your lease will be activated. You\'ll receive a confirmation email and can view your lease details in the "Active Leases" section of your dashboard.'
  },
  {
    id: '12',
    category: 'Leases',
    question: 'How do I renew my lease?',
    answer: 'When your lease is approaching expiration (within 60 days), you\'ll see a "Request Renewal" button on your lease details page. Click it, fill in the renewal form, and your request will be sent to the admin.'
  },
  {
    id: '13',
    category: 'Leases',
    question: 'What is auto-renewal?',
    answer: 'Auto-renewal automatically extends your lease for another term when it expires. You can enable or disable this feature in your lease details page. If enabled, you\'ll receive a notification before auto-renewal occurs.'
  },
  {
    id: '14',
    category: 'Technical',
    question: 'The website is not loading properly. What should I do?',
    answer: 'Try clearing your browser cache and cookies. If the problem persists, try using a different browser or device. You can also contact our support team for assistance.'
  },
  {
    id: '15',
    category: 'Technical',
    question: 'I\'m not receiving email notifications. Why?',
    answer: 'Check your spam/junk folder. Add our email address to your contacts. Ensure your email settings in the dashboard are enabled. If problems continue, contact support.'
  }
]

const categories = [...new Set(faqs.map(faq => faq.category))]

const supportArticles = [
  {
    title: 'Getting Started Guide',
    description: 'Learn the basics of using SackAgent platform',
    icon: AcademicCapIcon,
    link: '/help/guides/getting-started',
    readTime: '5 min'
  },
  {
    title: 'How to Find Your Perfect Property',
    description: 'Tips and tricks for effective property search',
    icon: MagnifyingGlassIcon,
    link: '/help/guides/property-search',
    readTime: '4 min'
  },
  {
    title: 'Understanding Rental Requests',
    description: 'Complete guide to the rental application process',
    icon: DocumentTextIcon,
    link: '/help/guides/rental-requests',
    readTime: '6 min'
  },
  {
    title: 'Payment and Verification Process',
    description: 'How to make payments and get verified',
    icon: CheckCircleSolidIcon,
    link: '/help/guides/payments',
    readTime: '3 min'
  },
  {
    title: 'Lease Management Guide',
    description: 'Managing your active leases and renewals',
    icon: LifebuoyIcon,
    link: '/help/guides/leases',
    readTime: '4 min'
  },
  {
    title: 'Account Security Best Practices',
    description: 'Keep your account safe and secure',
    icon: ShieldCheckIcon,
    link: '/help/guides/security',
    readTime: '3 min'
  }
]

export default function TenantHelpPage() {
  const { user } = useUser()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaqs, setExpandedFaqs] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showContactForm, setShowContactForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [ticketForm, setTicketForm] = useState<SupportTicket>({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  })
  const [ticketSubmitted, setTicketSubmitted] = useState(false)

  const toggleFaq = (faqId: string) => {
    setExpandedFaqs(prev => 
      prev.includes(faqId) 
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    )
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@sackagent.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would send the ticket to your backend
    console.log('Ticket submitted:', ticketForm)
    setTicketSubmitted(true)
    setTimeout(() => {
      setTicketSubmitted(false)
      setShowContactForm(false)
      setTicketForm({
        subject: '',
        message: '',
        priority: 'medium',
        category: 'general'
      })
    }, 3000)
  }

  return (
    <DashboardLayout activeTab="help" onTabChange={() => {}}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-3xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">How can we help you?</h1>
              <p className="text-emerald-100 text-lg max-w-2xl">
                Find answers to common questions, browse guides, or contact our support team
              </p>
            </div>
            <div className="hidden lg:block">
              <QuestionMarkCircleIcon className="w-24 h-24 text-white/20" />
            </div>
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <EnvelopeIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
            <p className="text-sm text-gray-500 mb-3">Get a response within 24h</p>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600 font-medium">support@sackagent.com</span>
              <button
                onClick={handleCopyEmail}
                className="p-2 hover:bg-emerald-50 rounded-lg transition-colors relative"
              >
                <ClipboardDocumentIcon className="w-5 h-5 text-emerald-600" />
                {copied && (
                  <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs py-1 px-2 rounded">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <PhoneIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Phone Support</h3>
            <p className="text-sm text-gray-500 mb-3">Mon-Fri, 9am-6pm</p>
            <a href="tel:+2341234567890" className="text-blue-600 font-medium hover:underline">
              +234 123 456 7890
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
            <p className="text-sm text-gray-500 mb-3">Instant responses</p>
            <button className="text-purple-600 font-medium hover:underline">
              Start Chat →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <LifebuoyIcon className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Submit Ticket</h3>
            <p className="text-sm text-gray-500 mb-3">Get personalized help</p>
            <button
              onClick={() => setShowContactForm(true)}
              className="text-amber-600 font-medium hover:underline"
            >
              Create Ticket →
            </button>
          </div>
        </div>

        {/* Support Articles */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Popular Support Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportArticles.map((article, index) => {
              const Icon = article.icon
              return (
                <Link
                  key={index}
                  href={article.link}
                  className="p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-emerald-100 transition-colors">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-emerald-700">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{article.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {article.readTime} read
                      </div>
                    </div>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full mr-3">
                        {faq.category}
                      </span>
                      <span className="font-medium text-gray-900">{faq.question}</span>
                    </div>
                    {expandedFaqs.includes(faq.id) ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedFaqs.includes(faq.id) && (
                    <div className="px-6 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <ExclamationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No FAQs match your search</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="mt-3 text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl shadow-lg p-8 border border-emerald-200">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
                <p className="text-gray-600 max-w-2xl">
                  Can not find what you are looking for? Our support team is here to help you with any questions or issues.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowContactForm(true)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Contact Support
              </button>
              <Link
                href="/help/guides"
                className="px-6 py-3 border border-emerald-600 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
              >
                Browse All Guides
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Contact Support</h2>
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircleIcon className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {ticketSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ticket Submitted!</h3>
                    <p className="text-gray-600 mb-6">
                      We have received your support request. You will hear back from us within 24 hours.
                    </p>
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTicket} className="space-y-6">
                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                        placeholder="Brief summary of your issue"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={ticketForm.category}
                        onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      >
                        <option value="general">General Inquiry</option>
                        <option value="account">Account Issues</option>
                        <option value="property">Property Questions</option>
                        <option value="payment">Payment Problems</option>
                        <option value="technical">Technical Support</option>
                        <option value="lease">Lease Concerns</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['low', 'medium', 'high'] as const).map((priority) => (
                          <button
                            key={priority}
                            type="button"
                            onClick={() => setTicketForm({ ...ticketForm, priority })}
                            className={`px-4 py-3 rounded-lg border font-medium capitalize ${
                              ticketForm.priority === priority
                                ? priority === 'low'
                                  ? 'bg-green-100 border-green-500 text-green-700'
                                  : priority === 'medium'
                                  ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                                  : 'bg-red-100 border-red-500 text-red-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {priority}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={ticketForm.message}
                        onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                        rows={5}
                        placeholder="Describe your issue in detail..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    {/* User Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Your account:</span> {user?.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        We will respond to this email address within 24 hours.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:opacity-90 transition-all font-medium"
                      >
                        Submit Ticket
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}