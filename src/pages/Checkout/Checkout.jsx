import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "../../utils/Api";
import Button from "../../components/common/Button";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ totalAmount, type }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?type=${type}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        isLoading={loading}
        variant="primary"
        className="w-full py-4 text-lg rounded-xl"
        disabled={!stripe || loading}
      >
        Complete Purchase CA${totalAmount.toFixed(2)}
      </Button>

      <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        Your payment information is encrypted and secure.
      </p>
    </form>
  );
};

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    cartItems,
    totalAmount,
    planId,
    type = "cart",
  } = location.state || {};

  const [clientSecret, setClientSecret] = useState("");
  const [initError, setInitError] = useState(false);

  useEffect(() => {
    if (!totalAmount) {
      navigate("/");
      return;
    }

    const initializePayment = async () => {
      try {
        const response = await api.post("/order/create-payment-intent", {
          cartItems: cartItems || [],
          planId: planId || null,
          checkoutType: type,
        });

        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error("Payment Initialization Error:", err);
        setInitError(true);
      }
    };

    initializePayment();
  }, [cartItems, planId, type, totalAmount, navigate]);

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#4f46e5", 
      colorBackground: "#ffffff",
      colorText: "#1f2937",
      borderRadius: "12px",
    },
  };

  if (initError) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-red-600">
          Initialization Failed
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't connect to the payment gateway. Please try again.
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-12 bg-white">
      {/* LEFT COLUMN: Payment */}
      <div className="lg:col-span-2 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

        <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Payment Method</h2>
            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Secure SSL <Lock className="w-3 h-3" />
            </span>
          </div>

          {clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance }}
            >
              <CheckoutForm totalAmount={totalAmount} type={type} />
            </Elements>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-gray-500 font-medium">
                Securing connection to Stripe...
              </p>
            </div>
          )}
        </section>
      </div>

      {/* RIGHT COLUMN: Order Summary */}
      <div className="lg:col-span-1 bg-gray-50 p-8 rounded-2xl h-fit sticky top-24 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-900">Order summary</h2>

        <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
          {type === "subscription" ? (
            <div className="flex justify-between font-medium">
              <span>Subscription Plan</span>
              <span>CA${(totalAmount || 0).toFixed(2)}</span>
            </div>
          ) : (
            <>
              {cartItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm py-1"
                >
                  <span className="truncate max-w-[150px] text-gray-600 font-medium">
                    {item.title}
                  </span>
                  <span className="font-bold text-gray-900">
                    CA${Number(item.price).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="pt-4 space-y-2 text-xs text-gray-500 border-t border-gray-100 mt-4">
                <div className="flex justify-between">
                  <span>Original Price:</span>
                  <span>CA${(totalAmount * 5.5 || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>Discounts:</span>
                  <span>-CA${(totalAmount * 4.5 || 0).toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total:</span>
            <span className="text-3xl font-black text-gray-900">
              CA${(totalAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="font-bold text-sm text-gray-800">
            30-Day Money-Back Guarantee
          </p>
          <p className="text-xs text-gray-500 mt-1">No questions asked.</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
