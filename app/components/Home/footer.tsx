import React from 'react'
import Link from 'next/link'
import Image from 'next/image';
import logo from "../../../public/irorun-logo.png";
import { FaFacebook, FaTwitter, FaInstagram, FaTiktok } from 'react-icons/fa';

export const IrorunHomesLogo = () => (
  <Link href="/" className="flex flex-col items-center">
    <Image 
      src={logo} 
      alt="Irorun Homes Logo" 
      className="w-24 h-auto sm:w-28 md:w-32 transition-all duration-300" 
      priority
    />
    <p className="font-bold text-2xl mt-2">Irorun Homes</p>
  </Link>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/share/1LFxiEcuCY/',
      icon: FaFacebook,
      color: 'hover:text-blue-500'
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/irorunhomes',
      icon: FaTwitter,
      color: 'hover:text-blue-400'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/irorunhomes',
      icon: FaInstagram,
      color: 'hover:text-pink-500'
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@irorunhomes',
      icon: FaTiktok,
      color: 'hover:text-gray-300'
    }
  ];

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Browse Properties', href: '/properties' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Contact Us', href: '/contact-us' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Blog', href: '/blog' }
  ];

  const resourceLinks = [
    { name: 'Pricing', href: '/pricing' },
    { name: 'Legal Documents', href: '/legal' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' }
  ];

  return (
    <footer className="bg-gradient-to-b from-emerald-900 to-green-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          
          {/* Company Info - Column 1 */}
          <div className="text-center sm:text-left">
            <div className="flex justify-center sm:justify-start">
              <IrorunHomesLogo />
            </div>
            
            {/* Social Links - Mobile optimized */}
            <div className="flex justify-center sm:justify-start space-x-4 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-emerald-300 hover:text-white transition-all duration-300 transform hover:scale-110 ${social.color}`}
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links - Column 2 */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-5 text-emerald-300 relative inline-block sm:block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-emerald-500 rounded-full hidden sm:block"></span>
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-emerald-100 hover:text-white duration-200 text-sm block py-1 hover:translate-x-1 transition-transform"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources - Column 3 */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-5 text-emerald-300 relative inline-block sm:block">
              Resources
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-emerald-500 rounded-full hidden sm:block"></span>
            </h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-emerald-100 hover:text-white duration-200 text-sm block py-1 hover:translate-x-1 transition-transform"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - Column 4 */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-5 text-emerald-300 relative inline-block sm:block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-emerald-500 rounded-full hidden sm:block"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center justify-center sm:justify-start space-x-3">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-emerald-100 text-sm">Osogbo, Osun State, Nigeria</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start space-x-3">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+2348167436407" className="text-emerald-100 hover:text-white transition-colors text-sm">
                  (+234) 0816-743 6407
                </a>
              </li>
              <li className="flex items-center justify-center sm:justify-start space-x-3">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@irorunhomes.com" className="text-emerald-100 hover:text-white transition-colors text-sm break-all">
                  info@irorunhomes.com
                </a>
              </li>
            </ul>
            
            {/* Newsletter Subscription - Mobile optimized */}
            <div className="mt-8">
              <h4 className="text-sm font-semibold mb-3 text-emerald-300 text-center sm:text-left">
                Subscribe to our newsletter
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2.5 rounded-lg sm:rounded-r-none text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <button className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-lg sm:rounded-l-none hover:opacity-90 transition-opacity text-sm whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-emerald-400 mt-2 text-center sm:text-left">
                Get updates on new properties
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Mobile optimized */}
        <div className="mt-10 pt-6 border-t border-emerald-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="text-emerald-200 text-xs sm:text-sm">
              © {currentYear} Irorun Vista Realty Solution LTD. All rights reserved.
            </div>
            <div className="text-emerald-200 text-xs sm:text-sm">
              <Link 
                href="https://quiqerr.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 hover:text-white transition-colors"
              >
                Powered by Quiqerr Tech Nigeria
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer