import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User } from 'lucide-react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your BrandPulse AI Assistant. Ask me anything about your customer feedback, sentiment trends, or product performance!' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, user_id: 1 })
      });
      const data = await res.json();
      
      // Simulate streaming response slightly for premium UI feel
      setLoading(false);
      let replyText = data.reply || "No context found.";
      setMessages(prev => [...prev, { sender: 'bot', text: replyText }]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'bot', text: "I'm having trouble retrieving live analysis data right now. Please try again." }]);
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="chat-panel"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 border-b border-slate-200 dark:border-white/5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-600 text-white rounded-xl font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">BrandPulse AI Q&A</h4>
                  <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online Context Assistant
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.sender === 'user' ? 'bg-purple-600 text-white font-bold' : 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'}`}>
                    {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[78%] ${m.sender === 'user' ? 'bg-purple-600 text-white font-medium' : 'bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-purple-400 font-medium animate-pulse pl-9">
                  <span>AI is streaming brand context</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-white/5 flex items-center gap-2 flex-shrink-0">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about sentiment, drops, aspects..."
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <button onClick={handleSend} className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="chat-fab"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </motion.button>
    </div>
  );
}
