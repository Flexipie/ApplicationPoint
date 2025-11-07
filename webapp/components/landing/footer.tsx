'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">
                ApplicationPoint
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Track your job applications effortlessly with our modern platform.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Product</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/#features" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} ApplicationPoint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
