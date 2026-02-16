import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/Api";
import { MessageCircle, Send, X, Sparkles, BarChart2, User, Zap } from "lucide-react";

const AdminAgentChat = ({ range, activeTab }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/agent", {
        message: input,
        range,
        activeTab,
        contextType: "admin",
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, I encountered an error accessing the analytics data. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 flex items-center gap-3 px-5 py-3 rounded-full bg-slate-900 text-white text-sm font-bold shadow-2xl hover:bg-indigo-600 transition-all duration-300 hover:scale-105 active:scale-95 group z-50"
      >
        <Zap size={18} className="text-yellow-400 fill-yellow-400 group-hover:text-white group-hover:fill-none transition-colors" />
        Analytics Intelligence
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-[400px] h-[550px] bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl flex flex-col overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header: Executive Style */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-lg">
            <BarChart2 size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-slate-900 leading-tight">Analytics Copilot</h3>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Data Access
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Chat Body with Scroll Fix */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30 px-5">
        <div className="flex flex-col min-h-full justify-end py-6">
          
          {messages.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-indigo-600">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-tight">Suggested Queries</span>
              </div>
              <ul className="space-y-3">
                {[
                  "Summarise this month’s revenue vs last month.",
                  "Which subscription plan is performing best?",
                  "Identify drop-off hotspots in my courses."
                ].map((text, idx) => (
                  <li 
                    key={idx}
                    onClick={() => setInput(text)}
                    className="text-[12px] text-slate-600 hover:text-indigo-600 cursor-pointer flex items-center gap-2 transition-colors p-1 -ml-1 rounded hover:bg-indigo-50"
                  >
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex mb-5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[88%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border ${
                  m.role === "user" ? "bg-white border-slate-200" : "bg-slate-900 border-slate-900"
                }`}>
                  {m.role === "user" ? <User size={14} className="text-slate-400" /> : <Sparkles size={14} className="text-white" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  m.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none font-medium" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start mb-5 ml-11">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-50 focus-within:border-indigo-400 transition-all">
          <textarea
            rows={1}
            className="flex-1 max-h-32 resize-none text-[13px] bg-transparent outline-none text-slate-700 py-1"
            placeholder="Ask a question about your data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-slate-900 text-white hover:bg-indigo-600 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all flex-shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
          Dashboard insights are cross-referenced with your live database.
        </p>
      </div>
    </div>
  );
};

export default AdminAgentChat;