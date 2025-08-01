import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import getStripe from '@/lib/stripe';

interface PaymentFormProps {
  clientSecret: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const CheckoutForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  customerInfo,
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate customer information before processing payment
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone) {
      onError('Please complete all customer information fields above before proceeding with payment.');
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/redirect-to-confirmation`,
          receipt_email: customerInfo.email,
          payment_method_data: {
            billing_details: {
              name: `${customerInfo.firstName} ${customerInfo.lastName}`,
              email: customerInfo.email,
              phone: customerInfo.phone,
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment failed:', error);
        onError(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // SECURITY: Removed payment intent logging - contains payment data
        console.log('Payment succeeded, attempting redirect...');
        try {
          onSuccess(paymentIntent.id);
        } catch (redirectError) {
          console.error('Error during redirect:', redirectError);
          // Fallback: force navigation if callback fails
          window.location.href = `/redirect-to-confirmation?payment_intent=${paymentIntent.id}`;
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      onError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Information</h2>
        
        <div className="mb-6">
          <PaymentElement 
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card'],
              fields: {
                billingDetails: {
                  name: 'auto',
                  email: 'auto',
                  phone: 'auto',
                  address: {
                    country: 'auto',
                    postalCode: 'auto',
                  },
                },
              },
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className={`w-full px-6 py-3 rounded-lg font-medium shadow-lg transition-all
            ${isProcessing || !stripe || !elements
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#1DA9C7] text-white hover:bg-[#1897B2] hover:shadow-xl hover:scale-[1.02]'
            }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            'Complete Purchase'
          )}
        </button>
        

      </div>
    </form>
  );
};

interface StripePaymentFormProps {
  amount: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: any[];
  discountInfo?: {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    amount: number;
    discountAmount: number;
  };
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  customerInfo,
  items,
  discountInfo,
  onSuccess,
  onError,
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only create PaymentIntent if we have valid customer info
    if (!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone) {
      return;
    }

    // Create PaymentIntent as soon as the component loads
    const createPaymentIntent = async () => {
      try {
        // Get contact info from localStorage if available
        const contactInfoJson = localStorage.getItem('contactInfo');
        const contactInfo = contactInfoJson ? JSON.parse(contactInfoJson) : {};

        // Get waiver data array from localStorage if available
        const waiverDataArrayJson = localStorage.getItem('waiverDataArray');
        const waiverDataArray = waiverDataArrayJson ? JSON.parse(waiverDataArrayJson) : [];

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            customerInfo,
            items,
            contactInfo, // Include contact info with wetsuit size
            discountInfo, // Include discount information
            waiverDataArray, // Include array of waiver signature data
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        onError(error instanceof Error ? error.message : 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, customerInfo, items, discountInfo, onError]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-[#1DA9C7] border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-gray-600">Initializing secure payment...</span>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Payment initialization failed</div>
          <p className="text-gray-600">Please refresh the page and try again.</p>
        </div>
      </div>
    );
  }

  const stripePromise = getStripe();

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#1DA9C7',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm
        clientSecret={clientSecret}
        customerInfo={customerInfo}
        onSuccess={onSuccess}
        onError={onError}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    </Elements>
  );
}; 