import { LandingNav } from '@/components/landing/landing-nav';
import { Footer } from '@/components/landing/footer';

export const metadata = {
  title: 'Terms of Service - ApplicationPoint',
  description: 'Terms and conditions for using ApplicationPoint',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using ApplicationPoint ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              ApplicationPoint is a job application tracking service that helps you:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Track job applications and their statuses</li>
              <li>Organize contacts, reminders, and follow-ups</li>
              <li>Optionally integrate with Gmail to detect application updates</li>
              <li>Use a browser extension to save applications from job boards</li>
              <li>Export and manage your application data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Account Creation</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>You must provide accurate, current, and complete information</li>
              <li>You must be at least 16 years old to use the Service</li>
              <li>You are responsible for maintaining account security</li>
              <li>You are responsible for all activities under your account</li>
              <li>You must notify us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Account Termination</h3>
            <p className="text-gray-700 mb-4">
              We reserve the right to terminate or suspend accounts that violate these Terms or engage in prohibited activities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Permitted Use</h3>
            <p className="text-gray-700 mb-4">
              You may use the Service only for lawful purposes and in accordance with these Terms.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Prohibited Activities</h3>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to systems or data</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Scrape, harvest, or collect user data without permission</li>
              <li>Transmit viruses, malware, or malicious code</li>
              <li>Impersonate others or provide false information</li>
              <li>Use the Service to send spam or unsolicited communications</li>
              <li>Reverse engineer or decompile any part of the Service</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Use the Service to compete with us</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subscription and Payments</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Subscription Plans</h3>
            <p className="text-gray-700 mb-4">
              We offer Free, Premium, and Enterprise subscription plans. Plan features and pricing are described on our Pricing page.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Billing</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Paid subscriptions are billed monthly or annually</li>
              <li>Payments are processed securely through Stripe</li>
              <li>Billing begins immediately upon subscription</li>
              <li>Subscriptions auto-renew unless canceled</li>
              <li>You authorize us to charge your payment method</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Refunds</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>We offer a 14-day money-back guarantee for new subscriptions</li>
              <li>Refunds are provided at our discretion for valid reasons</li>
              <li>No refunds for partial billing periods after cancellation</li>
              <li>Contact support@applicationpoint.com for refund requests</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.4 Cancellation</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You may cancel your subscription at any time</li>
              <li>Access continues until the end of your billing period</li>
              <li>No automatic refunds for early cancellation</li>
              <li>Free plan users can delete their account anytime</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Our Property</h3>
            <p className="text-gray-700 mb-4">
              The Service, including its design, code, graphics, and content (excluding user content), is owned by ApplicationPoint and protected by copyright, trademark, and other laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Your Content</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>You retain ownership of all data you provide to the Service</li>
              <li>You grant us a limited license to use your data to provide the Service</li>
              <li>We do not claim ownership of your application data</li>
              <li>You can export or delete your data at any time</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Feedback</h3>
            <p className="text-gray-700">
              Any feedback, suggestions, or ideas you provide become our property and may be used without compensation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
            <p className="text-gray-700">
              Your use of the Service is also governed by our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>. We are committed to protecting your data in compliance with GDPR, CCPA, and other applicable privacy laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              The Service integrates with third-party services:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Google OAuth:</strong> For authentication and Gmail access</li>
              <li><strong>Stripe:</strong> For payment processing</li>
              <li><strong>LinkedIn & Indeed:</strong> Via browser extension (optional)</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Your use of these services is subject to their respective terms and policies. We are not responsible for third-party service availability or actions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimers and Limitations</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">9.1 Service Availability</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>The Service is provided "as is" and "as available"</li>
              <li>We do not guarantee uninterrupted or error-free service</li>
              <li>We may modify or discontinue features at any time</li>
              <li>We perform regular maintenance which may cause downtime</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">9.2 No Warranties</h3>
            <p className="text-gray-700 mb-4">
              WE MAKE NO WARRANTIES, EXPRESS OR IMPLIED, REGARDING THE SERVICE, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">9.3 Limitation of Liability</h3>
            <p className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, APPLICATIONPOINT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="text-gray-700">
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless ApplicationPoint, its officers, directors, employees, and agents from any claims, losses, damages, liabilities, and expenses (including legal fees) arising from your use of the Service, violation of these Terms, or violation of any rights of another party.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Dispute Resolution</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.1 Governing Law</h3>
            <p className="text-gray-700 mb-4">
              These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.2 Arbitration</h3>
            <p className="text-gray-700 mb-4">
              Any disputes arising from these Terms or the Service shall be resolved through binding arbitration, except where prohibited by law. You waive your right to a jury trial.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.3 Exceptions</h3>
            <p className="text-gray-700">
              Either party may seek injunctive relief in court for intellectual property disputes or breach of confidentiality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or prominent notice. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account and access to the Service immediately, without notice, for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>At our sole discretion for any reason</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Upon termination, your right to use the Service ceases immediately. You may export your data before deletion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. General Provisions</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">14.1 Entire Agreement</h3>
            <p className="text-gray-700 mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and ApplicationPoint.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">14.2 Severability</h3>
            <p className="text-gray-700 mb-4">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">14.3 Waiver</h3>
            <p className="text-gray-700 mb-4">
              Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">14.4 Assignment</h3>
            <p className="text-gray-700">
              You may not assign or transfer these Terms without our written consent. We may assign these Terms without restriction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms:
            </p>
            <ul className="list-none text-gray-700 space-y-2">
              <li><strong>Email:</strong> <a href="mailto:support@applicationpoint.com" className="text-blue-600 hover:underline">support@applicationpoint.com</a></li>
              <li><strong>Legal:</strong> <a href="mailto:legal@applicationpoint.com" className="text-blue-600 hover:underline">legal@applicationpoint.com</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <p className="text-gray-700 italic">
              By using ApplicationPoint, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
