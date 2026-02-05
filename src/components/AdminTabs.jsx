import React, { useState } from "react";

export const Tabs = ({ children, defaultValue, className = "" }) => {
  const [active, setActive] = useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { active, setActive })
      )}
    </div>
  );
};

export const TabsList = ({ children, className = "" }) => (
  <div className={`flex gap-2 mb-2 ${className}`}>{children}</div>
);

export const TabsTrigger = ({ value, children, active, setActive, className = "" }) => (
  <button
    className={`px-3 py-1 rounded ${active === value ? "bg-purple-600 text-white" : "bg-gray-200"} ${className}`}
    onClick={() => setActive(value)}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, children, active, className = "" }) => {
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
};
