import React from "react";
import { X, AlertCircle, HelpCircle, CheckCircle } from "lucide-react";
import Button from "./Button";

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children, 
  confirmText = "Confirm",
  type = "info", // "info", "danger", "warning", or "success"
  showCancel = false,
}) => {
  if (!isOpen) return null;

  const themes = {
    success: {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      bg: "bg-green-100",
    },
    info: {
      icon: <AlertCircle className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-100",
    },
    danger: { 
      icon: <X className="w-6 h-6 text-red-600" />, 
      bg: "bg-red-100" 
    },
    warning: {
      icon: <HelpCircle className="w-6 h-6 text-amber-600" />,
      bg: "bg-amber-100",
    },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-full ${themes[type].bg}`}>
              {themes[type].icon}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          
          {/* Display message if provided */}
          {message && <p className="text-gray-600 leading-relaxed mb-4">{message}</p>}
          
          {/* Display children (the form/inputs) if provided */}
          <div className="mt-2">
            {children}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          {showCancel && (
            <Button onClick={onClose} variant="outline" className="px-6">
              Cancel
            </Button>
          )}
          <Button
            onClick={() => {
              if (onConfirm) {
                onConfirm();
              } else {
                onClose();
              }
            }}
            variant={type === "danger" ? "danger" : "primary"}
            className="px-6"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;