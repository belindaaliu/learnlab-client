import React, { useState, useEffect, useMemo } from "react";
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
import Modal from "../../components/common/Modal";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ totalAmount, type, planId, autoRenew }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);

    const params = new URLSearchParams({
      type,
      // only needed for subscriptions:
      ...(type === "subscription" && {
        planId: String(planId || ""),
        autoRenew: autoRenew ? "1" : "0",
      }),
    });

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?${params.toString()}`,
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
        Complete Purchase CA${(totalAmount || 0).toFixed(2)}
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

  const [clientSecret, setClientSecret] = useState("");
  const [initError, setInitError] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // DATA RECOVERY LOGIC
  const checkoutData = useMemo(() => {
    if (location.state) return location.state;

    const saved = sessionStorage.getItem("checkout_recovery");
    if (saved) {
      const parsed = JSON.parse(saved);
      sessionStorage.removeItem("checkout_recovery");
      return parsed;
    }
    return null;
  }, [location.state]);

  const {
    cartItems = [],
    totalAmount = 0,
    planId = null,
    type = "cart",
    autoRenew = false,
  } = checkoutData || {};

  useEffect(() => {
    if (!totalAmount && !location.state) {
      const timer = setTimeout(() => navigate("/"), 500);
      return () => clearTimeout(timer);
    }

    const initializePayment = async () => {
      try {
        const response = await api.post("/order/create-payment-intent", {
          cartItems: cartItems,
          planId: planId,
          checkoutType: type,
        });

        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error("Payment Initialization Error:", err);
        setInitError(true);
      }
    };

    const verifyEligibility = async () => {
      try {
        // Check for active subscription ONLY if this is a subscription checkout
        if (type === "subscription") {
          const statusRes = await api.get("/subscription/overview");
          if (statusRes.data.data.hasActiveSubscription) {
            setModalConfig({
              isOpen: true,
              title: "Already Subscribed",
              message:
                "You currently have an active plan. Please manage your subscription from the dashboard if you'd like to make changes.",
              type: "warning",
            });
            return;
          }
        }

        initializePayment();
      } catch (err) {
        console.error("Eligibility Check Error:", err);
        setInitError(true);
      }
    };

    if (totalAmount > 0) {
      verifyEligibility();
    }
  }, [cartItems, planId, type, totalAmount, navigate, location.state]);

  const handleModalClose = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
    navigate("/student/dashboard");
  };

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
    <>
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        title={modalConfig.title}
        type={modalConfig.type}
        message={modalConfig.message}
      />
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-12 bg-white">
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
                <CheckoutForm
                  totalAmount={totalAmount}
                  type={type}
                  planId={planId}
                  autoRenew={autoRenew}
                />
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

        <div className="lg:col-span-1 bg-gray-50 p-8 rounded-2xl h-fit sticky top-24 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-900">
            Order summary
          </h2>
          <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
            {type === "subscription" ? (
              <div className="flex justify-between font-medium">
                <span>Subscription Plan</span>
                <span>CA${totalAmount.toFixed(2)}</span>
              </div>
            ) : (
              <>
                {cartItems.map((item) => (
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
              </>
            )}
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-3xl font-black text-gray-900">
                CA${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
