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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openModal = (plan = null) => {
    if (plan) {
      setEditingPlanId(plan.id);
      let currentFeatures = plan.features;
      if (typeof currentFeatures === 'string') {
        try { currentFeatures = JSON.parse(currentFeatures); } catch { currentFeatures = {}; }
      }
      setFormData({ 
        ...plan, 
        features: { ...defaultFeatures, ...(currentFeatures || {}) } 
      });
    } else {
      setEditingPlanId(null);
      setFormData({ name: "", price: 0, duration_days: 30, description: "", button_text: "Subscribe", slug: "", features: defaultFeatures });
    }
    setIsModalOpen(true);
  };

  const savePlan = async () => {
    try {
      const path = editingPlanId ? `/admin/subscriptions/plans/${editingPlanId}` : "/admin/subscriptions/plans";
      const payload = { 
        ...formData, 
        price: Number(formData.price), 
        duration_days: Number(formData.duration_days) 
      };
      editingPlanId ? await api.put(path, payload) : await api.post(path, payload);
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) { alert("Error saving plan."); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500">Manage pricing tiers and member permissions</p>
        </div>
        <Button onClick={() => openModal()} variant="primary" className="flex items-center gap-2">
          <Plus size={20} /> Create New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {plans.map((plan) => {
          const isVip = plan.slug?.toLowerCase().trim() === 'vip';
          return (
            <div key={plan.id} className={`p-6 border rounded-2xl bg-white shadow-sm relative flex flex-col transition-all hover:shadow-md ${isVip ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-100'}`}>
              
              {isVip && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5 z-10 whitespace-nowrap">
                  <Star size={12} fill="white" /> Best Value
                </div>
              )}

              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isVip ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {plan.slug || 'no-slug'}
                  </span>
                </div>
                <p className="text-3xl font-black text-gray-900">${Number(plan.price).toFixed(2)}</p>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">{plan.duration_days} Day Cycle</p>
                
                <div className="mt-4 space-y-1">
                   {plan.features?.all_courses_access && (
                     <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
                       <CheckCircle size={14} /> Full Access Enabled
                     </div>
                   )}
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-50">
                <button onClick={() => openModal(plan)} className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors">
                  <Edit2 size={16} /> Edit
                </button>
                <button className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={savePlan} 
        title={editingPlanId ? "Edit Subscription Plan" : "Create Subscription Plan"}
      >
        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
          <Input label="Plan Name" placeholder="e.g. Professional Scholar" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (CAD)" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            <Input label="Slug (type 'vip' for badge)" placeholder="vip" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
          </div>

          <Input label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

          <div className="bg-gray-50 p-4 rounded-2xl space-y-4 border border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Permissions & Perks</h3>
            
            <label className="flex items-center gap-3 p-3 bg-white border border-blue-100 rounded-xl cursor-pointer shadow-sm">
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-blue-600"
                checked={formData.features.all_courses_access} 
                onChange={(e) => setFormData({...formData, features: {...formData.features, all_courses_access: e.target.checked}})} 
              />
              <span className="text-sm font-bold text-blue-700">Grant Access to ALL Premium Courses</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Discount %" type="number" value={formData.features.discount_percent} onChange={(e) => setFormData({...formData, features: {...formData.features, discount_percent: e.target.value}})} />
              <Input label="Free Courses/Mo" type="number" value={formData.features.free_courses_per_month} onChange={(e) => setFormData({...formData, features: {...formData.features, free_courses_per_month: e.target.value}})} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Generic Perks (Press Enter)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.features.additional_perks?.map((p, i) => (
                  <span key={i} className="bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    {p} <X size={12} className="cursor-pointer" onClick={() => {
                      const filtered = formData.features.additional_perks.filter((_, idx) => idx !== i);
                      setFormData({...formData, features: {...formData.features, additional_perks: filtered}});
                    }}/>
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all" 
                placeholder="e.g. Certification Prep" 
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if(!e.target.value.trim()) return;
                    setFormData({...formData, features: {...formData.features, additional_perks: [...(formData.features.additional_perks || []), e.target.value.trim()]}});
                    e.target.value = "";
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