import React from 'react';
import Head from 'next/head';
import { Layout } from '../components/Layout/Layout';

const TermsAndConditions = () => {
  return (
    <>
      <Head>
        <title>Terms and Conditions - Zek's Surf School</title>
        <meta name="description" content="Terms and Conditions for Zek's Surf School services and website usage." />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
        <link rel="apple-touch-icon" href="/zeks-logo.png" />
      </Head>
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white py-16">
          <div className="container mx-auto px-4 min-[731px]:px-6 min-[1024px]:px-8 max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg p-8 min-[731px]:p-12">
              <h1 className="text-4xl font-bold text-[#2C5F7C] mb-8 text-center">
                Terms and Conditions
              </h1>
              
              <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                <p className="text-lg leading-relaxed">
                  Welcome to Zek's Surf School. By accessing or using our website and services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully. If you do not agree to these terms, please do not use our site or services.
                </p>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">1. Use of Website</h2>
                  <p className="mb-4">
                    You agree to use our website only for lawful purposes and in a manner that does not infringe the rights or restrict the use of this site by any third party. You may not:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Copy, reproduce, or modify any content</li>
                    <li>Attempt to gain unauthorized access to any part of the site</li>
                    <li>Use the site for any fraudulent or unlawful purpose</li>
                  </ul>
                  <p>
                    All content and materials on this website are the intellectual property of Zek's Surf School and may not be reused without our explicit written consent.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">2. Services Offered</h2>
                  <p>
                    We provide surf lessons for individuals or groups. All lessons are subject to availability and may be rescheduled due to weather or ocean conditions for safety purposes. Zek's Surf School reserves the right to refuse service to anyone at our discretion.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">3. Bookings and Payments</h2>
                  <p>
                    All bookings must be made through our website or an authorized representative. Payments are processed through secure third-party providers. We do not store credit card information.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">4. Cancellations and Refunds</h2>
                  <p>
                    Customers may cancel up to 7 days prior to the scheduled lesson for a full refund, minus a transaction fee. Cancellations within 7 days may be subject to a $50 rescheduling fee or be non-refundable. No-shows are not eligible for refunds.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">5. Waiver and Assumption of Risk</h2>
                  <p>
                    Surfing involves inherent risks including injury or even death. By booking a lesson, you acknowledge and accept these risks. You agree to release and hold harmless Zek's Surf School, its instructors, and affiliates from any claims related to your participation in surf lessons.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">6. Limitation of Liability</h2>
                  <p>
                    To the fullest extent permitted by law, Zek's Surf School shall not be liable for any damages arising from your use of this website or our services, including but not limited to direct, indirect, incidental, punitive, and consequential damages.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">7. Modifications to Terms</h2>
                  <p>
                    We reserve the right to update or modify these terms at any time. Changes will be posted on this page with a revised effective date. Continued use of the site or services after such changes constitutes your acceptance of the new terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">8. Governing Law</h2>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">9. Contact Information</h2>
                  <p>
                    For questions about these Terms and Conditions, please contact us:
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

export default TermsAndConditions; 