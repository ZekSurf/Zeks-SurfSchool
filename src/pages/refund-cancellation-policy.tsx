import React from 'react';
import Head from 'next/head';
import { Layout } from '../components/Layout/Layout';

const RefundCancellationPolicy = () => {
  return (
    <>
      <Head>
        <title>Refund & Cancellation Policy - Zek's Surf School</title>
        <meta name="description" content="Refund and Cancellation Policy for Zek's Surf School lessons and services." />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
        <link rel="apple-touch-icon" href="/zeks-logo.png" />
      </Head>
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white py-16">
          <div className="container mx-auto px-4 min-[731px]:px-6 min-[1024px]:px-8 max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg p-8 min-[731px]:p-12">
              <h1 className="text-4xl font-bold text-[#2C5F7C] mb-8 text-center">
                Refund & Cancellation Policy
              </h1>
              
              <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                <p className="text-lg leading-relaxed">
                  At Zek's Surf School, we are committed to providing a great experience and fair policies to our clients. This Refund & Cancellation Policy outlines the terms for canceling or rescheduling your surf lessons.
                </p>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">1. Private and Group Lessons</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Cancellations made 7 or more days before the scheduled lesson will receive a full refund, minus a small transaction fee (if applicable).</li>
                    <li>Cancellations made within 7 days of the scheduled lesson are non-refundable.</li>
                    <li>No-shows will not be eligible for a refund.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">2. Rescheduling Policy</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Clients may reschedule a lesson once for free if the request is made at least 72 hours in advance.</li>
                    <li>Rescheduling requests made less than 72 hours before the scheduled time may incur a $50 reschedule fee.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">3. Weather & Surf Conditions</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Lessons take place rain or shine unless conditions are deemed unsafe by a professional surf instructor or lifeguard.</li>
                    <li>If Zek's Surf School cancels due to unsafe conditions, clients will be offered a full refund or an opportunity to reschedule.</li>
                    <li>Dissatisfaction with surf conditions (such as small or large waves) is not grounds for a refund.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">4. Lesson Packages</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Unused lessons in a multi-lesson package are non-refundable but transferable to another person.</li>
                    <li>Each package holder is entitled to one free reschedule per package. Additional reschedules will incur a $50 fee.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">5. Kids Lessons & Camps (if applicable)</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Cancellations made 7+ days in advance are eligible for a full refund, minus a $10–$30 processing fee depending on the type of session.</li>
                    <li>Reschedules requested within 72 hours of the start time will incur a $50 fee.</li>
                    <li>No refunds or reschedules for missed days or cancellations made within 72 hours.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">6. Third-Party Bookings</h2>
                  <p>
                    If your lesson was booked through a third-party platform (e.g., Groupon, Viator), please contact them directly for refund or cancellation requests. Zek's Surf School is not responsible for third-party refund processing.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-[#2C5F7C] mb-4">7. Contact Us</h2>
                  <p>
                    For questions regarding refunds or cancellations, please email:
                  </p>
                  <div className="bg-[#E8F4F8] p-4 rounded-lg mt-4">
                    <p>Email: <a href="mailto:zeksurfschool@gmail.com" className="text-[#1DA9C7] hover:underline font-semibold">zeksurfschool@gmail.com</a></p>
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

export default RefundCancellationPolicy; 