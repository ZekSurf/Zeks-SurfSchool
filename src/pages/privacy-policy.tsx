import React from 'react';
import Head from 'next/head';
import { Layout } from '../components/Layout/Layout';

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - Zek's Surf School</title>
        <meta name="description" content="Privacy Policy for Zek's Surf School - how we collect, use, and protect your personal information." />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
        <link rel="apple-touch-icon" href="/zeks-logo.png" />
      </Head>
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white py-16">
          <div className="container mx-auto px-4 min-[731px]:px-6 min-[1024px]:px-8 max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg p-8 min-[731px]:p-12">
              <h1 className="text-4xl font-bold text-[#2C5F7C] mb-8 text-center">
                Privacy Policy
              </h1>
              
              <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                <p className="text-lg leading-relaxed">
                  Zek's Surf School ("we," "our," or "us") values your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or engage with our services. By accessing or using our website, you agree to this Privacy Policy.
                </p>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">1. Information We Collect</h2>
                  <p className="mb-4">
                    When you visit our website or register for a surf lesson, we may collect the following personal information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Payment details (processed via secure third-party platforms)</li>
                    <li>Any other information voluntarily submitted via contact forms or booking tools</li>
                  </ul>
                  <p className="mb-4">
                    We also collect non-personally identifiable information via cookies and analytics tools, such as:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Browser type</li>
                    <li>Device type</li>
                    <li>Pages visited</li>
                    <li>Time spent on the site</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">2. How We Use Your Information</h2>
                  <p className="mb-4">We use your personal information to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Process bookings and payments</li>
                    <li>Communicate important lesson details or updates</li>
                    <li>Respond to inquiries</li>
                    <li>Improve website performance and customer experience</li>
                    <li>Send marketing communications (only if you've opted in)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">3. How We Protect Your Information</h2>
                  <p className="mb-4">We implement industry-standard security measures, including:</p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>SSL encryption</li>
                    <li>Restricted access to customer data</li>
                    <li>Secure third-party payment processing</li>
                  </ul>
                  <p>We do not store sensitive payment information on our servers.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">4. Cookies & Tracking</h2>
                  <p className="mb-4">
                    We use Google Analytics and other tools to monitor user behavior and improve our website. These tools use cookies to collect standard internet log information and visitor behavior data.
                  </p>
                  <p>
                    You can manage or disable cookies in your browser settings. Note that disabling cookies may limit certain functionality.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">5. Sharing Your Information</h2>
                  <p className="mb-4">
                    We do not sell or trade your personal information. We may share it with trusted third-party service providers who assist in operating our website or conducting our business, provided they agree to keep this information confidential.
                  </p>
                  <p>
                    We may also disclose your information if required by law or to protect the rights and safety of our users or business.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">6. Third-Party Links</h2>
                  <p>
                    Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">7. Children's Privacy</h2>
                  <p>
                    We do not knowingly collect personal information from children under 13. If we discover that we have received information from a child under 13 without parental consent, we will delete it immediately.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">8. Your Rights & Choices</h2>
                  <p className="mb-4">You may:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Request access to or deletion of your personal data</li>
                    <li>Opt out of marketing emails by clicking "unsubscribe" in any message</li>
                    <li>Contact us at any time regarding your data</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">9. Changes to This Policy</h2>
                  <p>
                    We may update this Privacy Policy periodically. Updates will be posted on this page with the effective date at the top.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">10. Contact Us</h2>
                  <p>
                    If you have any questions about this Privacy Policy or how we handle your data, contact us at:
                  </p>
                  <div className="bg-[#E8F4F8] p-4 rounded-lg mt-4">
                    <p className="font-semibold text-[#2C5F7C]">Zek's Surf School</p>
                    <p>Email: <a href="mailto:zeksurfschool@gmail.com" className="text-[#1DA9C7] hover:underline">zeksurfschool@gmail.com</a></p>
                  </div>
                </section>

                <div className="border-t border-gray-200 pt-6 mt-8">
                  <p className="text-sm text-gray-500 text-center">
                    Last updated: {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PrivacyPolicy; 