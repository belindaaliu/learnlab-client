import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/Api";
import Button from "../../components/common/Button";
import { Lock } from "lucide-react";

const Checkout = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [plan, setPlan] = useState(location.state?.plan || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!plan) {
      api.get(`/subscription/plans`)
        .then((res) => {
          const selected = res.data.data.find(p => String(p.id) === String(planId));
          if (selected) {
            setPlan(selected);
          }
        })
        .catch(err => console.error("Fetch error:", err));
    }
  }, [planId, plan]);

  if (!plan) {
    return <div className="p-10 text-center">Loading plan details...</div>;
  }

  const safePrice = plan?.price ? Number(plan.price).toFixed(2) : "0.00";

  const handleConfirmPurchase = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/subscription/subscribe", { planId });
      alert("Subscription successful!");
      navigate("/student/subscription");
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Checkout</h2>
        <p className="text-gray-500">
          Confirm your subscription to {plan?.name || "Selected Plan"}
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-2xl mb-8">
        <div className="flex justify-between mb-2">
          <span>{plan?.name || "Plan"}</span>
          <span className="font-bold">${safePrice}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 border-t pt-2">
          <span>Duration</span>
          <span>{plan?.duration_days || 0} Days</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-gray-400 justify-center mb-4">
          <Lock className="w-3 h-3" /> Secure Encrypted Payment
        </div>

        <Button
          variant="primary"
          className="w-full"
          isLoading={isSubmitting}
          onClick={handleConfirmPurchase}
        >
          Confirm & Pay ${safePrice}
        </Button>

        <Button
          variant="ghost"
          className="w-full text-gray-400"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Checkout;