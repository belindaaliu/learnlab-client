import React from "react";
import { Check, Minus } from "lucide-react";

const PlanComparison = ({ plans }) => {
  const comparisonRows = [
    { label: "All Premium Courses Access", key: "all_courses_access", type: "boolean" },
    { label: "Free Courses / mo", key: "free_courses_per_month", type: "number" },
    { label: "Discount on Content", key: "discount_percent", type: "percent" },
    { label: "Certification", key: "has_certificates", type: "boolean" },
    { label: "Offline Viewing", key: "offline_access", type: "boolean" },
    { label: "Priority Support", key: "priority_support", type: "boolean" },
  ];

  return (
    <div className="mt-24 max-w-5xl mx-auto overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-gray-900">Compare features</h2>
        <p className="text-gray-500 mt-2">Find the right fit for your career goals.</p>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-3xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-6 px-8 text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                Features
              </th>
              {plans.map((plan) => {
                const isVip = plan.slug?.toLowerCase() === "vip";
                return (
                  <th
                    key={plan.id}
                    className={`py-6 px-8 text-center transition-colors ${
                      isVip ? "bg-blue-50/40 border-x border-blue-100/50" : "bg-gray-50/50"
                    }`}
                  >
                    <span className={`text-lg font-black ${isVip ? "text-blue-700" : "text-gray-900"}`}>
                      {plan.name}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                <td className="py-5 px-8 text-sm font-bold text-gray-700">{row.label}</td>
                
                {plans.map((plan) => {
                  const isVip = plan.slug?.toLowerCase() === "vip";
                  const planSlug = plan.slug?.toLowerCase() || "";
                  let val = plan.features[row.key];

                  // Fallback logic for empty fields
                  if (val === undefined || val === null) {
                    if (row.key === "has_certificates") val = planSlug !== "free";
                    if (row.key === "offline_access") val = planSlug === "vip" || planSlug === "personal";
                    if (row.key === "priority_support") val = planSlug === "vip";
                  }

                  return (
                    <td 
                      key={plan.id} 
                      className={`py-5 px-8 text-center text-sm transition-colors ${
                        isVip ? "bg-blue-50/40 border-x border-blue-100/50" : ""
                      }`}
                    >
                      {row.type === "boolean" ? (
                        val ? (
                          <Check className="mx-auto text-green-500 stroke-[3px]" size={20} />
                        ) : (
                          <Minus className="mx-auto text-gray-300" size={18} />
                        )
                      ) : (
                        <span className={`font-bold ${isVip ? "text-blue-700" : "text-gray-900"}`}>
                          {val || 0}{row.type === "percent" ? "%" : ""}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanComparison;