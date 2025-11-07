'use client';

import Link from 'next/link';

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white/10 backdrop-blur-lg p-8 shadow-2xl ring-1 ring-white/20 sm:p-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to take control of your job search?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
              Join thousands of job seekers who are staying organized and landing their dream jobs with ApplicationPoint.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/login"
                className="group relative overflow-hidden rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-600 shadow-xl transition-all hover:shadow-2xl hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Tracking Now
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
            <p className="mt-6 text-sm text-indigo-200">
              No credit card required • Free forever • 2 minute setup
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
