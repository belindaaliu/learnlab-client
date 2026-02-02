import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../utils/Api';
import Button from '../common/Button';

const StripePaymentForm = ({ totalAmount, cartItems }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Call backend to create the PaymentIntent
      const { data } = await api.post('/orders/create-payment-intent', {
        cartItems: cartItems
      });

      // 2. Confirm the payment with Stripe
      const paymentResult = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // Optional: Add name/email from  user context here
            name: 'Student Name', 
          },
        },
      });

      if (paymentResult.error) {
        setErrorMessage(paymentResult.error.message);
      } else {
        if (paymentResult.paymentIntent.status === 'succeeded') {
          // Success! Redirect to my-courses
          window.location.href = '/student/learning?purchase=success';
        }
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="py-2">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1f2937',
                  '::placeholder': { color: '#9ca3af' },
                },
                invalid: { color: '#ef4444' },
              },
            }} 
          />
        </div>
      </div>

      {errorMessage && (
        <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      <Button 
        type="submit" 
        variant="primary" 
        className="w-full py-4 text-lg rounded-xl"
        isLoading={isProcessing}
        disabled={!stripe}
      >
        Complete Payment (CA${totalAmount.toFixed(2)})
      </Button>
    </form>
  );
};

export default StripePaymentForm;