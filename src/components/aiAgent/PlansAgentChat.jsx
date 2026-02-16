import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/Api";
import { Send, Sparkles, User, X, ChevronDown, Info } from "lucide-react";

/**
 * PlansAgentChat
 * @param {Array} plans - List of available subscription plans
 * @param {Object} userSub - Current user subscription status
 * @param {Function} onClose - Function to hide the chat widget
 */
const PlansAgentChat = ({ plans, userSub, onClose }) => {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Hello! I'm your Plan Copilot. I can help you compare our subscription tiers, explain features, or find the best value for your learning goals. What are you looking for today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Ref for the bottom anchor to handle auto-scrolling
  const messagesEndRef = useRef(null);

  // Helper: Auto-scroll to bottom
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Trigger scroll whenever messages change or loading starts
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/agent", {
        message: input,
        contextType: "plans",
        plansContext: plans 
      });

      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: res.data.reply }
      ]);
    } catch (err) {
      console.error("AI Agent Error:", err);
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "I'm having trouble connecting to my brain right now. Please try again in a few seconds." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-8 w-[380px] h-[580px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[100] animate-in fade-in zoom-in duration-200">
      
      {/* --- HEADER --- */}
      <div className="px-5 py-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-100">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-800 leading-tight">Plan Copilot</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[11px] text-slate-500 font-medium">Smart Assistant</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-lg"
          title="Close Assistant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* --- MESSAGE AREA --- */}

      <div className="flex-1 overflow-y-auto bg-slate-50/30 px-5 scroll-smooth">
        <div className="flex flex-col min-h-full justify-end py-6">
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`flex mb-5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[88%] flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar icons */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border shadow-sm ${
                  m.role === "user" ? "bg-white border-slate-200" : "bg-indigo-50 border-indigo-100"
                }`}>
                  {m.role === "user" ? 
                    <User className="w-4 h-4 text-slate-500" /> : 
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                  }
                </div>
                
                {/* Message Bubble */}
                <div className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${
                  m.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none font-medium" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start mb-5">
              <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          
          {/* Invisible anchor for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            className="w-full text-[13.5px] bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3.5 outline-none text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all"
            placeholder="Ask about upgrades or pricing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`absolute right-2 p-2 rounded-xl transition-all ${
              input.trim() 
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-3 px-1 text-slate-400">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            <p className="text-[10px] font-medium uppercase tracking-tight">Enterprise-grade AI</p>
          </div>
          <button 
            onClick={() => scrollToBottom()}
            className="hover:text-indigo-500 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlansAgentChat;