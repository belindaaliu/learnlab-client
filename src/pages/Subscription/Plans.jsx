import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/Api";
import Button from "../../components/common/Button";
import PlansAgentChat from "../../components/aiAgent/PlansAgentChat";
import {
  Check,
  Star,
  ArrowRight,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import PlanComparison from "../../components/PlanComparison";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSub, setUserSub] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    api
      .get("/subscription/plans")
      .then((res) => {
        const formatted = (res.data.data || []).map((p) => ({
          ...p,
          features:
            typeof p.features === "string"
              ? JSON.parse(p.features)
              : p.features || {},
        }));
        setPlans(formatted);
      })
      .catch((err) => console.error("Error loading plans", err))
      .finally(() => setLoading(false));

    if (user) {
      api
        .get("/subscription/overview")
        .then((res) => setUserSub(res.data.data))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
  if (showComparison) {
    setTimeout(() => {
      window.scrollTo({
        top: window.scrollY + 600, 
        behavior: "smooth",
      });
    }, 150);
  }
}, [showComparison]);

  const formatFeatures = (f) => {
    const list = [];
    if (f.all_courses_access) {
      list.push("Unlimited access to ALL premium courses");
    } else if (f.subscriber_only_courses > 0) {
      list.push(
        `Access to over ${f.subscriber_only_courses} exclusive courses`,
      );
    }

    if (f.discount_percent > 0)
      list.push(`${f.discount_percent}% off additional content`);
    if (f.free_courses_per_month > 0)
      list.push(`${f.free_courses_per_month} free courses every month`);

    if (f.additional_perks && Array.isArray(f.additional_perks)) {
      f.additional_perks.forEach((p) => list.push(p));
    }

    return list.length > 0 ? list : ["Basic platform access"];
  };

  const handleAction = async (plan, finalPrice) => {
    const amount = finalPrice ?? Number(plan.price);

    if (!user) {
      localStorage.setItem(
        "pending_checkout",
        JSON.stringify({
          type: "subscription",
          planId: plan.id,
          totalAmount: amount,
        }),
      );
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!userSub?.hasActiveSubscription) {
      navigate("/checkout", {
        state: { type: "subscription", planId: plan.id, totalAmount: amount },
      });
      return;
    }

    try {
      await api.post("/subscription/schedule-plan-change", {
        planId: plan.id,
        autoRenew: userSub.autoRenew,
      });

      toast.success(
        `Your plan will switch to "${plan.name}" at the end of your current billing period.`,
      );

      const res = await api.get("/subscription/overview");
      setUserSub(res.data.data);
    } catch (err) {
      console.error("Schedule plan change error:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to schedule plan change. Please try again.",
      );
    }
  };

  if (loading || authLoading) {
    return (
      <div className="p-20 text-center font-bold text-gray-400">
        Loading your options...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">
          Invest in your future.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Flexible plans designed to help you master new skills at your own
          pace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
        {plans.map((plan) => {
          const isVip = plan.slug?.toLowerCase().trim() === "vip";
          const isCurrentPlan =
            userSub?.hasActiveSubscription && userSub?.planName === plan.name;
          const isNextPlan =
            userSub?.nextPlanId &&
            String(userSub.nextPlanId) === String(plan.id);
          const displayFeatures = formatFeatures(plan.features);

          const basePrice = Number(plan.price || 0);
          const hasDiscount =
            plan.discount_active &&
            plan.discount_type &&
            plan.discount_value != null &&
            (!plan.discount_starts_at ||
              new Date(plan.discount_starts_at) <= new Date()) &&
            (!plan.discount_ends_at ||
              new Date(plan.discount_ends_at) >= new Date());

          let finalPrice = basePrice;
          let discountPercent = 0;

          if (hasDiscount) {
            if (plan.discount_type === "percent") {
              discountPercent = Number(plan.discount_value);
              finalPrice = Number(
                (basePrice * (1 - discountPercent / 100)).toFixed(2),
              );
            } else if (plan.discount_type === "fixed") {
              const discountValue = Number(plan.discount_value);
              finalPrice = Math.max(
                0,
                Number((basePrice - discountValue).toFixed(2)),
              );
              discountPercent =
                basePrice > 0
                  ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
                  : 0;
            }
          }

          return (
            <div
              key={plan.id}
              className={`bg-white border-2 rounded-[2.5rem] p-10 flex flex-col relative transition-all duration-300 hover:-translate-y-2 ${
                isVip
                  ? "border-blue-600 shadow-2xl shadow-blue-100"
                  : "border-gray-100 shadow-xl shadow-gray-50"
              }`}
            >
              {isVip && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-lg tracking-widest whitespace-nowrap uppercase">
                  <Star size={14} fill="currentColor" /> Best Value
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col">
                    <span className="text-5xl font-black text-gray-900 leading-none">
                      $
                      {hasDiscount
                        ? finalPrice.toFixed(2)
                        : basePrice.toFixed(2)}
                    </span>

                    {hasDiscount && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400 line-through">
                          ${basePrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 font-semibold">
                          {discountPercent}% off
                        </span>
                      </div>
                    )}
                  </div>

                  <span className="text-gray-400 font-bold text-lg mt-2">
                    /{" "}
                    {plan.duration_days === 30
                      ? "mo"
                      : `${plan.duration_days}d`}
                  </span>
                </div>

                <p className="mt-4 text-gray-500 leading-relaxed text-sm font-medium">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-5 mb-12 flex-grow">
                {displayFeatures.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-4 text-sm font-semibold text-gray-700"
                  >
                    <div className="mt-0.5 bg-green-100 p-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5 text-green-600 stroke-[3px]" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={isVip ? "primary" : "outline"}
                className={`w-full py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  isVip
                    ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                    : ""
                }`}
                disabled={isCurrentPlan}
                onClick={() => handleAction(plan, finalPrice)}
              >
                {isCurrentPlan ? (
                  "Active Subscription"
                ) : isNextPlan ? (
                  "Scheduled for Next Period"
                ) : (
                  <>
                    {plan.button_text || "Get Started"} <ArrowRight size={20} />
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="mt-16 text-center">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
        >
          {showComparison ? (
            <>
              Hide detailed features <ChevronUp size={20} />
            </>
          ) : (
            <>
              Compare plan features <ChevronDown size={20} />
            </>
          )}
        </button>
      </div>

      {showComparison && plans.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <PlanComparison plans={plans} />
        </div>
      )}

      {/* AI Agent Logic */}
      {isChatOpen ? (
        <PlansAgentChat onClose={() => setIsChatOpen(false)} plans={[]} />
      ) : (
        /* Launcher Button */
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 z-50 group"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-indigo-600 rounded-full"></span>
          </div>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ask Copilot
          </span>
        </button>
      )}
    </div>
  );
};

export default SubscriptionPlans;
