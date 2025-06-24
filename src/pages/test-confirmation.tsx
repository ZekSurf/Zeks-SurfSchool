import React, { useState } from 'react';
import Head from 'next/head';

export default function TestConfirmation() {
  const [paymentIntent, setPaymentIntent] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!paymentIntent.trim()) {
      alert('Please enter a payment intent ID');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/booking/lookup-by-payment-intent?payment_intent=${paymentIntent}`);
      const data = await response.json();
      setResult({ status: response.status, data });

      if (data.success && data.booking_id) {
        // Successful lookup - redirect to confirmation
        window.location.href = `/confirmation?booking_id=${data.booking_id}`;
      }
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Test Confirmation Lookup - Zek's Surf School</title>
      </Head>

      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Test Confirmation Lookup</h1>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="paymentIntent" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Intent ID:
              </label>
              <input
                type="text"
                id="paymentIntent"
                value={paymentIntent}
                onChange={(e) => setPaymentIntent(e.target.value)}
                placeholder="pi_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleLookup}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Looking up...' : 'Lookup Booking'}
            </button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 