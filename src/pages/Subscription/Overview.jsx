import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/Api";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { Calendar, CreditCard, Info } from "lucide-react";

const SubscriptionOverview = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [modal, setModal] = useState({ isOpen: false });

  const fetchStatus = () => {
    api.get("/subscription/overview").then((res) => setStatus(res.data.data));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleChangePlan = () => {
    navigate("/student/subscription/plans");
  };

  const handleCancelClick = () => {
    setModal({
      isOpen: true,
      title: "Cancel Subscription?",
      message:
        "You will continue to have access until your billing period ends, but your plan will not renew.",
      type: "warning",
      showCancel: true,
      confirmText: "Yes, Cancel Plan",
    });
  };

  const processCancellation = async () => {
    setModal({ ...modal, isOpen: false });
    setLoading(true);
    try {
      await api.post("/subscription/cancel");
      fetchStatus();
    } catch (err) {
      // TODO: Show error modal logic here...
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Subscription Status</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          {status?.hasActiveSubscription ? (
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Current Plan
                  </label>
                  <p className="text-2xl font-bold text-primary">
                    {status.planName}
                  </p>
                </div>
                <div className="flex gap-10">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400 w-5 h-5" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Next Billing
                      </p>
                      <p className="font-semibold">
                        {new Date(status.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-gray-400 w-5 h-5" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Status
                      </p>
                      <p className="font-semibold text-green-600">Active</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button variant="outline" onClick={handleChangePlan}>
                  Change Plan
                </Button>
                <Button variant="danger" onClick={handleCancelClick}>
                  Cancel Subscription
                </Button>

                <Modal
                  {...modal}
                  onClose={() => setModal({ isOpen: false })}
                  onConfirm={processCancellation}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="text-gray-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Active Subscription</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Upgrade to a premium plan to unlock unlimited access to all
                courses and features.
              </p>
              <Button
                onClick={() =>
                  (window.location.href = "/student/subscription/plans")
                }
              >
                Explore Plans
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionOverview;
