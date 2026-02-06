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
  const [userSub, setUserSub] = useState(null);

  const isDashboardView = location.pathname.startsWith("/student");

  useEffect(() => {
    api
      .get("/subscription/plans")
      .then((res) => {
        const formattedPlans = res.data.data.map((plan) => {
          let parsedFeatures = plan.features;
          // Handle stringified JSON from DB
          if (typeof plan.features === "string") {
            try {
              parsedFeatures = JSON.parse(plan.features);
            } catch (e) {
              parsedFeatures = {};
            }
          }
          return {
            ...plan,
            features: parsedFeatures || {},
          };
        });
        setPlans(formattedPlans);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to load plans.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      api
        .get("/subscription/overview")
        .then((res) => setUserSub(res.data.data))
        .catch((err) => console.error("Error fetching sub status", err));
    }
  }, [user]);

  const handleAction = (plan) => {
    if (plan.plan_type === "enterprise") {
      window.location.href = "mailto:sales@learnlab.ca";
      return;
    }

    if (!user) {
      const pendingCheckout = {
        type: "subscription",
        planId: plan.id,
        totalAmount: Number(plan.price),
      };
      localStorage.setItem("pending_checkout", JSON.stringify(pendingCheckout));
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

  // Helper to turn the Admin Object into a List for Students
  const formatFeatures = (features) => {
    if (Array.isArray(features)) return features; // Backward compatibility
    
    const list = [];
    if (features.discount_percent > 0) {
      list.push(`${features.discount_percent}% discount on all courses`);
    }
    if (features.free_courses_per_month > 0) {
      list.push(`${features.free_courses_per_month} free courses every month`);
    }
    if (features.subscriber_only_courses?.length > 0) {
      list.push("Access to exclusive subscriber-only courses");
    }
    if (features.special_pricing && Object.keys(features.special_pricing).length > 0) {
      list.push("Special member pricing on select content");
    }
    
    // Add a default if no features are defined
    if (list.length === 0) list.push("Full platform access");
    
    return list;
  };

  if (authLoading || loading)
    return <div className="p-10 text-center">Loading...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className={`${isDashboardView ? "p-0" : "max-w-7xl mx-auto px-4 py-20"}`}>
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
        {plans.map((plan) => {
          const isCurrentPlan =
            userSub?.hasActiveSubscription && userSub?.planName === plan.name;
          const hasAnyPlan = userSub?.hasActiveSubscription;
          const displayFeatures = formatFeatures(plan.features);

          return (
            <div
              key={plan.id.toString()}
              className={`bg-white border rounded-3xl p-8 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md ${
                plan.slug === "pro" || plan.plan_type === "team"
                  ? "border-blue-500 ring-4 ring-blue-50"
                  : "border-gray-100"
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${Number(plan.price).toFixed(2)}
                </span>
                <span className="text-gray-500 text-sm ml-1">
                  / {plan.duration_days === 30 ? "month" : `${plan.duration_days} days`}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-6 h-10 line-clamp-2">
                {plan.description}
              </p>

              <ul className="space-y-4 mb-10 flex-grow text-left w-full">
                {displayFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={isCurrentPlan ? "outline" : "primary"}
                className="w-full py-4 font-semibold"
                disabled={isCurrentPlan}
                onClick={() => handleAction(plan)}
              >
                {isCurrentPlan
                  ? "Current Plan"
                  : hasAnyPlan
                  ? "Switch Plan"
                  : plan.button_text || "Get Started"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;