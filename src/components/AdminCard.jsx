import React from "react";

// Card wrapper
export const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card header
export const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card title
export const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-100 ${className}`} {...props}>
      {children}
    </h3>
  );
};

// Card content
export const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
