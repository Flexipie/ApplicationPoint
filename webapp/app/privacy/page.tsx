import { LandingNav } from '@/components/landing/landing-nav';
import { Footer } from '@/components/landing/footer';

export const metadata = {
  title: 'Privacy Policy - ApplicationPoint',
  description: 'How we protect and handle your data',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              ApplicationPoint ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our job application tracking service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email address (via Google OAuth)</li>
              <li><strong>Job Application Data:</strong> Company names, job titles, application statuses, notes, and related information you enter</li>
              <li><strong>Contacts:</strong> Names, emails, and phone numbers of recruiters or hiring managers you add</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we never store your credit card details)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Information We Collect Automatically</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Usage Data:</strong> How you interact with our service, features used, time spent</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Log Data:</strong> Server logs, error reports, API requests</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Email Integration (Optional)</h3>
            <p className="text-gray-700 mb-4">
              If you grant us Gmail access, we:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Only read emails to detect job application updates</li>
              <li>Scan for keywords like "application received", "interview scheduled", etc.</li>
              <li>Never send emails on your behalf</li>
              <li>Never share your email content with third parties</li>
              <li>Store only metadata (subject, sender, date) and detected status changes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide and maintain our job tracking service</li>
              <li>Process your applications and reminders</li>
              <li>Detect job-related emails and update application statuses</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send service-related notifications</li>
              <li>Improve our service and develop new features</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">We do not sell your personal information. We share data only in these limited circumstances:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Service Providers:</strong> Stripe (payments), Supabase (database hosting), Vercel (hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">We implement industry-standard security measures:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Encryption in transit (HTTPS/TLS)</li>
              <li>Encryption at rest for sensitive data</li>
              <li>Secure authentication (OAuth 2.0)</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
              <li>Secure backup procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Privacy Rights</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 GDPR Rights (EU Users)</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Right to Object:</strong> Object to certain types of processing</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 CCPA Rights (California Users)</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Right to know what personal information we collect</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of sale of personal information (we don't sell data)</li>
              <li>Right to non-discrimination for exercising your rights</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 How to Exercise Your Rights</h3>
            <p className="text-gray-700 mb-4">
              You can exercise your rights at any time:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Export your data from Settings → Data & Privacy</li>
              <li>Delete your account from Settings → Data & Privacy</li>
              <li>Contact us at <a href="mailto:privacy@applicationpoint.com" className="text-blue-600 hover:underline">privacy@applicationpoint.com</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your data for as long as your account is active or as needed to provide services. When you delete your account:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>All personal data is deleted within 30 days</li>
              <li>Some data may be retained longer if required by law</li>
              <li>Backup copies are deleted within 90 days</li>
              <li>Anonymized usage statistics may be retained indefinitely</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">We use essential cookies to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Keep you signed in</li>
              <li>Remember your preferences</li>
              <li>Maintain security</li>
              <li>Analyze usage patterns (anonymized)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Google OAuth:</strong> Authentication (see <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>)</li>
              <li><strong>Stripe:</strong> Payment processing (see <a href="https://stripe.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a>)</li>
              <li><strong>Supabase:</strong> Database hosting (see <a href="https://supabase.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a>)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700">
              Our service is not intended for users under 16 years of age. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700">
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including Standard Contractual Clauses approved by the European Commission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice in our service. Your continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              For questions about this Privacy Policy or our privacy practices:
            </p>
            <ul className="list-none text-gray-700 space-y-2">
              <li><strong>Email:</strong> <a href="mailto:privacy@applicationpoint.com" className="text-blue-600 hover:underline">privacy@applicationpoint.com</a></li>
              <li><strong>Data Protection Officer:</strong> <a href="mailto:dpo@applicationpoint.com" className="text-blue-600 hover:underline">dpo@applicationpoint.com</a></li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
