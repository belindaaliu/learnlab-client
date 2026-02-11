import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CopyCertificateLink = ({ certId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/verify/${certId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-50 transition"
      >
        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
        {copied ? "Link Copied!" : "Copy Verification Link"}
      </button>

      {/* Tooltip Popup */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -45 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-3 rounded shadow-lg pointer-events-none"
          >
            Copied to clipboard!
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CopyCertificateLink;