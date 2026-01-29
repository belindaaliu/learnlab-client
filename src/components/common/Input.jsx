import React from 'react';

const Input = ({ label, error, icon: Icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          className={`
            w-full rounded-xl border border-gray-200 bg-gray-50 
            py-3 ${Icon ? 'pl-10' : 'pl-4'} pr-4 text-gray-900 placeholder-gray-400
            focus:bg-white focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition-all
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default Input;