import React, { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { Trash2, Edit2, Plus, X, Star, CheckCircle } from "lucide-react";
import api from "../../utils/Api";

const Subscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [errors, setErrors] = useState({});

  const defaultFeatures = {
    discount_percent: 0,
    free_courses_per_month: 0,
    subscriber_only_courses: [],
    special_pricing: {},
    all_courses_access: false,
    additional_perks: [],
  };

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    duration_days: 30,
    description: "",
    button_text: "Subscribe",
    slug: "",
    features: defaultFeatures,
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/subscriptions/plans");
      setPlans(data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openModal = (plan = null) => {
    if (plan) {
      setEditingPlanId(plan.id);
      // Ensure features is an object, not a string, when editing
      let currentFeatures = plan.features;
      if (typeof currentFeatures === "string") {
        try {
          currentFeatures = JSON.parse(currentFeatures);
        } catch {
          currentFeatures = {};
        }
      }

      setFormData({
        ...plan,
        features: { ...defaultFeatures, ...(currentFeatures || {}) },
      });
    } else {
      setEditingPlanId(null);
      setFormData({
        name: "",
        price: 0,
        duration_days: 30,
        description: "",
        button_text: "Subscribe",
        slug: "",
        features: defaultFeatures,
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const validateForm = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = "Name is required";
    if (formData.price < 0) errs.price = "Price cannot be negative";
    if (formData.duration_days <= 0)
      errs.duration_days = "Duration must be positive";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const savePlan = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const path = editingPlanId
        ? `/admin/subscriptions/plans/${editingPlanId}`
        : "/admin/subscriptions/plans";

      // Clean data for Backend/Prisma
      const payload = {
        ...formData,
        price: Number(formData.price),
        duration_days: Number(formData.duration_days),
      };

      if (editingPlanId) {
        await api.put(path, payload);
      } else {
        await api.post(path, payload);
      }

      closeModal();
      fetchPlans();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      alert(
        err.response?.data?.message ||
          "An error occurred while saving the plan.",
      );
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await api.delete(`/admin/subscriptions/plans/${id}`);
      fetchPlans();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete plan.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Subscription Plans
          </h1>
          <p className="text-gray-500">
            Manage pricing tiers and member permissions
          </p>
        </div>
        <Button onClick={() => openModal()} size="md" variant="primary">
          <Plus size={16} className="mr-2" /> Create Plan
        </Button>
      </div>

      {loading && plans.length === 0 ? (
        <div className="text-center py-10">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="p-5 border rounded-xl shadow-sm bg-white relative hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-bold text-gray-800">{plan.name}</h2>
              <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                {plan.description}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xl font-bold text-blue-600">
                    ${plan.price}
                  </p>
                  <p className="text-xs text-gray-400">
                    {plan.duration_days} days
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal(plan)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={savePlan}
        title={editingPlanId ? "Edit Plan" : "Create Plan"}
        confirmText={loading ? "Saving..." : "Save Plan"}
        showCancel={true}
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
          <Input
            label="Plan Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (CAD)"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              error={errors.price}
            />
            <Input
              label="Duration (days)"
              type="number"
              value={formData.duration_days}
              onChange={(e) =>
                setFormData({ ...formData, duration_days: e.target.value })
              }
              error={errors.duration_days}
            />
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Button Text"
              value={formData.button_text}
              onChange={(e) =>
                setFormData({ ...formData, button_text: e.target.value })
              }
            />
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
            />
          </div>

          <div className="border-t pt-4 mt-2">
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
              Features & Perks
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input
                label="Discount %"
                type="number"
                value={formData.features.discount_percent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    features: {
                      ...formData.features,
                      discount_percent: Number(e.target.value),
                    },
                  })
                }
              />
              <Input
                label="Free Courses / Mo"
                type="number"
                value={formData.features.free_courses_per_month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    features: {
                      ...formData.features,
                      free_courses_per_month: Number(e.target.value),
                    },
                  })
                }
              />
            </div>

            {/* Tags for Courses */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                Subscriber Only Courses (IDs)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.features.subscriber_only_courses?.map((id, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    {id}
                    <X
                      size={12}
                      className="cursor-pointer"
                      onClick={() => {
                        const filtered =
                          formData.features.subscriber_only_courses.filter(
                            (_, i) => i !== idx,
                          );
                        setFormData({
                          ...formData,
                          features: {
                            ...formData.features,
                            subscriber_only_courses: filtered,
                          },
                        });
                      }}
                    />
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type ID and press Enter"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = e.target.value.trim();
                    if (val) {
                      setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          subscriber_only_courses: [
                            ...(formData.features.subscriber_only_courses ||
                              []),
                            val,
                          ],
                        },
                      });
                      e.target.value = "";
                    }
                  }
                }}
              />
            </div>

            {/* Special Pricing */}
            <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
                Special Course Pricing
              </label>
              <div className="space-y-2 mb-3">
                {Object.entries(formData.features.special_pricing || {}).map(
                  ([cid, price]) => (
                    <div
                      key={cid}
                      className="flex items-center justify-between bg-white border px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      <span className="text-xs font-mono font-medium">
                        {cid}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-green-600">
                          ${price}
                        </span>
                        <X
                          size={14}
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                          onClick={() => {
                            const nextSp = {
                              ...formData.features.special_pricing,
                            };
                            delete nextSp[cid];
                            setFormData({
                              ...formData,
                              features: {
                                ...formData.features,
                                special_pricing: nextSp,
                              },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
              <div className="flex gap-2">
                <input
                  id="sp_id"
                  placeholder="Course ID"
                  className="text-sm border rounded-lg px-3 py-1 w-full outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  id="sp_price"
                  type="number"
                  placeholder="$"
                  className="text-sm border rounded-lg px-3 py-1 w-20 outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const idInput = document.getElementById("sp_id");
                    const priceInput = document.getElementById("sp_price");
                    const id = idInput.value.trim();
                    const pr = priceInput.value;
                    if (id && pr) {
                      setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          special_pricing: {
                            ...formData.features.special_pricing,
                            [id]: Number(pr),
                          },
                        },
                      });
                      idInput.value = "";
                      priceInput.value = "";
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                General Perks (e.g. Certification prep)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.features.additional_perks?.map((perk, idx) => (
                  <span
                    key={idx}
                    className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    {perk}
                    <X
                      size={12}
                      className="cursor-pointer"
                      onClick={() => {
                        const filtered =
                          formData.features.additional_perks.filter(
                            (_, i) => i !== idx,
                          );
                        setFormData({
                          ...formData,
                          features: {
                            ...formData.features,
                            additional_perks: filtered,
                          },
                        });
                      }}
                    />
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type perk and press Enter"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = e.target.value.trim();
                    if (val) {
                      setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          additional_perks: [
                            ...(formData.features.additional_perks || []),
                            val,
                          ],
                        },
                      });
                      e.target.value = "";
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Subscriptions;
