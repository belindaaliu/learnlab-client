import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../utils/Api'; 
import Button from '../../components/common/Button';

// Initialize Stripe with the Publishable Key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ cartItems, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (cartItems.length === 0) return alert("Your cart is empty");

    setLoading(true);
    setError(null);

    try {
      // 1. Create PaymentIntent on the backend
      const { data } = await api.post('/orders/create-payment-intent', {
        cartItems: cartItems,
      });

      // 2. Confirm the payment with Stripe
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          navigate("/student/learning?purchase=success");
        }
      }
    } catch (err) {
      console.error("Payment failed", err);
      setError("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-gray-200 p-5 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <input type="radio" checked readOnly className="w-5 h-5 accent-primary" />
          <span className="font-bold text-gray-900">Credit/Debit Card</span>
          <div className="flex gap-2 ml-auto">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
          </div>
        </div>

        {/* Stripe Card Input */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
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

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="pt-4">
        <Button 
          type="submit"
          isLoading={loading}
          variant="primary"
          className="w-full py-4 text-lg rounded-xl"
          disabled={!stripe}
        >
          Complete Purchase CA${totalAmount.toFixed(2)}
        </Button>
      </div>
    </form>
  );
};

const CheckoutPage = () => {
  const location = useLocation();
  const { cartItems, totalAmount } = location.state || { cartItems: [], totalAmount: 0 };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-12 bg-white">
      {/* LEFT COLUMN: Billing & Payment */}
      <div className="lg:col-span-2 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

        <section>
          <h2 className="text-xl font-bold mb-4">Billing address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-bold mb-1.5 text-gray-700">Country</label>
              <select className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 outline-none focus:border-primary">
                <option>Canada</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold mb-1.5 text-gray-700">Province</label>
              <select className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 outline-none focus:border-primary">
                <option>Quebec</option>
                <option>Ontario</option>
                <option>British Columbia</option>
              </select>
            </div>
          </div>
        </section>

        <section className="border border-gray-200 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Payment method</h2>
            <span className="flex items-center gap-1 text-xs text-gray-500 font-medium uppercase tracking-widest">
              Secure and encrypted <Lock className="w-3 h-3" />
            </span>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm cartItems={cartItems} totalAmount={totalAmount} />
          </Elements>

          <div className="mt-4 border border-gray-200 p-5 flex items-center gap-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer opacity-60">
            <input type="radio" disabled name="payment" className="w-5 h-5 accent-primary" />
            <span className="font-bold text-gray-900">PayPal</span>
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 ml-auto" />
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: Summary Sidebar */}
      <div className="lg:col-span-1 bg-gray-50 p-8 rounded-xl h-fit sticky top-24 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-900">Order summary</h2>
        <div className="space-y-3 text-sm border-b border-gray-200 pb-6 text-gray-600">
          <div className="flex justify-between">
            <span>Original Price:</span>
            <span>CA${(totalAmount * 5.5).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discounts:</span>
            <span className="text-red-500">-CA${(totalAmount * 4.5).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center py-6">
          <span className="text-lg font-bold text-gray-900">Total:</span>
          <span className="text-3xl font-black text-gray-900">CA${totalAmount.toFixed(2)}</span>
        </div>

        <p className="text-[11px] text-gray-500 mt-6 text-center leading-relaxed">
          By completing your purchase, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and acknowledge our <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="font-bold text-sm text-gray-800">30-Day Money-Back Guarantee</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;