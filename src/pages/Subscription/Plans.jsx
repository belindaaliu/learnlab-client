import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/Api";
import Button from "../../components/common/Button";
import { Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isDashboardView = location.pathname.startsWith("/student");

  useEffect(() => {
    api
      .get("/subscription/plans")
      .then((res) => {
        const formattedPlans = res.data.data.map((plan) => ({
          ...plan,
          features:
            typeof plan.features === "string"
              ? JSON.parse(plan.features)
              : plan.features,
        }));
        setPlans(formattedPlans);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to load plans.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (authLoading || loading)
    return <div className="p-10 text-center">Loading...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  const handleAction = (plan) => {
    if (plan.plan_type === "enterprise") {
      window.location.href = "mailto:sales@learnlab.ca";
      return;
    }

    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    navigate("/checkout", {
      state: {
        type: "subscription",
        planId: plan.id,
        totalAmount: Number(plan.price),
      },
    });
  };

  return (
    <div
      className={`${isDashboardView ? "p-0" : "max-w-7xl mx-auto px-4 py-20"}`}
    >
      {!isDashboardView && (
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-600 mt-4">
            No hidden fees. Switch plans anytime.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
        {plans.map((plan) => (
          <div
            key={plan.id.toString()}
            className={`bg-white border rounded-3xl p-8 shadow-sm flex flex-col items-center text-center ${
              plan.plan_type === "team"
                ? "border-purple-500 ring-2 ring-purple-50"
                : "border-gray-100"
            }`}
          >
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900">
                ${Number(plan.price).toFixed(2)}
              </span>
              <span className="text-gray-500 text-sm ml-1">
                /
                {plan.duration_days === 30
                  ? "month"
                  : `${plan.duration_days} days`}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-6">{plan.description}</p>

            <ul className="space-y-4 mb-10 flex-grow text-left w-full max-w-[250px]">
              {plan.features?.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.plan_type === "personal" ? "primary" : "outline"}
              className="w-full py-4 font-semibold"
              onClick={() => handleAction(plan)}
            >
              {plan.button_text || "Get Started"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
