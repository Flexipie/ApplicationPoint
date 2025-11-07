import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PricingCards } from '@/components/pricing/pricing-cards';
import { LandingNav } from '@/components/landing/landing-nav';
import { Footer } from '@/components/landing/footer';

export const metadata = {
  title: 'Pricing - ApplicationPoint',
  description: 'Choose the perfect plan for your job search journey',
};

export default async function PricingPage() {
  const session = await auth();

  // If logged in, show authenticated pricing (with current plan)
  // If not logged in, show public pricing
  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <LandingNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-12 sm:pt-32">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 opacity-20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 opacity-20 blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Simple, transparent{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                pricing
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your job search journey. Start free, upgrade when you need more.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PricingCards isAuthenticated={isAuthenticated} userId={session?.user?.id} />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently asked questions
          </h2>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I switch plans at any time?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately,
                and we'll prorate any charges.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens when I reach my application limit?
              </h3>
              <p className="text-gray-600">
                You'll be notified when you're approaching your limit. You can either upgrade your plan
                or wait until the next billing cycle. Your existing applications remain accessible.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                The Free plan is available forever with no credit card required. You can try out the core
                features and upgrade when you need more capacity or premium features like email integration.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) through Stripe,
                our secure payment processor. Your payment information is never stored on our servers.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. Your plan will remain active until
                the end of your current billing period, and you won't be charged again.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
