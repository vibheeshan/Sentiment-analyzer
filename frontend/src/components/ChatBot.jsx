import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User, History, Download, Mic, Paperclip, ChartPie, TrendingUp, BarChart2, Copy, FileText, Sun, Moon, Share2 } from 'lucide-react';
import Popover from './ui/Popover';
import { Toast, ConfirmDialog } from './ui';
import { Z_INDEX } from '../styles/zIndex';
import { apiService } from '../services/api';

const SUGGESTED_CHIPS = [
  'Analyze overall sentiment trend',
  'What are the top complaint topics?',
  'List top mentioned products & entities',
  'Summarize recent BrandPulse insights',
  'Show underperforming categories this quarter',
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('bp_chat_history');
    return saved ? JSON.parse(saved) : [
      {
        sender: 'bot',
        text: 'Hello! I am your BrandPulse AI Assistant. Ask me anything about customer feedback, sentiment trends, or NLP metrics!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'insight',
        sentiment: 92,
        metrics: ['Positive sentiment +12%', 'Engagement up 8%', 'Churn risk down 3%']
      }
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const messageEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('bp_chat_history', JSON.stringify(messages));
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text: queryText, time: timeStr, type: 'question' }]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const data = await apiService.chatQuery(queryText, 1);
      setLoading(false);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.reply || "No context found.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: data.type || 'analysis',
        sentiment: data.sentiment || 84,
        metrics: data.metrics || ['Sentiment trend is strong', 'Positive feedback rising', 'Response time improved']
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "I'm having trouble retrieving live analysis data right now. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'error',
        sentiment: 45,
        metrics: []
      }]);
      setLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setToastMessage('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!listening) {
      setListening(true);
      recognition.start();
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        setListening(false);
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
    } else {
      setListening(false);
    }
  };

  const exportChat = () => {
    const chatContent = messages.map(m => `[${m.sender.toUpperCase()} - ${m.time || ''}]: ${m.text}`).join('\n\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'brandpulse_chat_history.txt' }).click();
  };

  const clearHistory = () => {
    setConfirmClear(true);
  };

  const handleUploadClick = () => {
    setToastMessage('Simulated file upload triggered. Select document files to extract brand intelligence.');
  };

  const handleThemeToggle = () => {
    setIsLightMode(prev => !prev);
  };

  const themeButtonLabel = isLightMode ? 'Dark' : 'Light';
  const themeButtonIcon = isLightMode ? Moon : Sun;

  return (
    <div className="chat-widget">
      <Toast message={toastMessage} visible={Boolean(toastMessage)} onClose={() => setToastMessage('')} />
      <ConfirmDialog
        open={confirmClear}
        title="Clear chat history"
        message="Clear all conversation history?"
        confirmLabel="Clear"
        onConfirm={() => {
          const initial = [{
            sender: 'bot',
            text: 'Hello! I am your BrandPulse AI Assistant. Ask me anything about customer feedback, sentiment trends, or NLP metrics!',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'insight',
            sentiment: 92,
            metrics: ['Positive sentiment +12%', 'Engagement up 8%', 'Churn risk down 3%']
          }];
          setMessages(initial);
          localStorage.removeItem('bp_chat_history');
          setConfirmClear(false);
          setToastMessage('Chat history cleared.');
        }}
        onClose={() => setConfirmClear(false)}
      />
      <AnimatePresence>
      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className={`chat-panel flex flex-col overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-[#0e1220] ${isLightMode ? 'chat-panel-light' : ''}`}
        zIndex={Z_INDEX.OVERLAY_PANEL}
      >
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex flex-shrink-0 flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 p-4 dark:border-white/5 dark:from-purple-500/20 dark:via-indigo-500/20 dark:to-cyan-500/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">BrandPulse AI Q&A</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ask questions, analyze campaigns, and surface instant sentiment insights.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={exportChat} title="Export conversation" className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
                  <Download className="w-4 h-4 inline-block mr-1" /> Export
                </button>
                <button onClick={clearHistory} title="Clear chat history" className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
                  <History className="w-4 h-4 inline-block mr-1" /> Clear
                </button>
                <button onClick={handleThemeToggle} className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
                  {React.createElement(themeButtonIcon, { className: 'w-4 h-4 inline-block mr-1' })} {themeButtonLabel}
                </button>
                <button onClick={() => setIsOpen(false)} className="rounded-xl border border-transparent bg-slate-900/90 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white/10 dark:text-slate-100">
                  Close
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Campaigns analyzed', value: 32, icon: ChartPie, accent: 'from-sky-500 to-indigo-500' },
                { label: 'Avg sentiment', value: '84/100', icon: TrendingUp, accent: 'from-emerald-500 to-cyan-500' },
                { label: 'Forecast accuracy', value: '91%', icon: BarChart2, accent: 'from-purple-500 to-pink-500' },
              ].map((metric) => (
                <div key={metric.label} className="rounded-3xl border border-slate-200 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-slate-950/80">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${metric.accent} text-white`}>
                    <metric.icon className="w-4 h-4" />
                  </div>
                  <div className="mt-3">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{metric.label}</div>
                    <div className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100">{metric.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4 scrollbar-thin">
            {messages.map((m, idx) => {
              const isUser = m.sender === 'user';
              const sentimentScore = Number(m.sentiment ?? 0);
              const sentimentLabel = sentimentScore >= 80 ? 'Strong signal' : sentimentScore >= 60 ? 'Balanced signal' : 'Review caution';
              return (
                <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isUser ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-700/20 dark:text-slate-200'}`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`flex flex-col gap-2 max-w-[78%] ${isUser ? 'items-end text-right' : 'items-start text-left'}`}>
                    <div className={`rounded-[26px] p-4 text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'bg-purple-600 text-white' : 'border border-slate-200 bg-slate-100 text-slate-800 shadow-sm dark:border-white/5 dark:bg-slate-900/95 dark:text-slate-200'}`}>
                      {m.text}
                    </div>

                    {!isUser && (
                      <div className="rounded-[20px] border border-slate-200/80 bg-white/80 p-3 text-[12px] text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-950/85 dark:text-slate-300">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                            {sentimentScore ? `${sentimentScore}%` : 'Insight'}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{sentimentLabel}</span>
                        </div>
                        {m.metrics?.length ? (
                          <ul className="mt-3 space-y-2">
                            {m.metrics.map((item, idz) => (
                              <li key={idz} className="flex items-start gap-2 text-[11px] leading-snug text-slate-700 dark:text-slate-300">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-slate-200 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="mt-2 text-[11px] text-slate-400">Generated analysis and concise action items help you stay aligned.</div>
                        )}
                      </div>
                    )}

                    {m.time && (
                      <span className={`text-[9px] text-slate-500 font-medium ${isUser ? 'text-right' : 'text-left'}`}>
                        {m.time}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-purple-400 font-medium animate-pulse pl-9">
                <span>AI Engine is processing context</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Suggested prompts chips */}
          <div className="flex flex-shrink-0 gap-1.5 overflow-x-auto whitespace-nowrap border-t border-slate-200 bg-slate-50/50 px-4 py-2 dark:border-white/5 dark:bg-slate-950/20 scrollbar-none">
            {SUGGESTED_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="rounded-full border border-transparent bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600 transition-all hover:border-purple-500/20 hover:bg-purple-600/10 hover:text-purple-400 dark:bg-white/5 dark:text-slate-300"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="flex flex-shrink-0 items-center gap-2 border-t border-slate-200 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-slate-950/80">
            <button
              onClick={handleUploadClick}
              title="Upload Document"
              className="shrink-0 rounded-xl bg-slate-200 p-2 text-slate-600 transition-all hover:text-slate-200 dark:bg-white/5 dark:text-slate-400"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about sentiment, drops, aspects..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-100 focus:border-purple-500 focus:outline-none dark:border-white/5 dark:bg-slate-900 dark:text-slate-200"
            />
            <button
              onClick={handleVoiceToggle}
              title={listening ? "Listening..." : "Voice Input"}
              className={`rounded-xl p-2 transition-all ${listening ? 'animate-pulse bg-rose-600 text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-200 dark:bg-white/5 dark:text-slate-400'}`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button onClick={() => handleSend()} className="rounded-xl bg-purple-600 p-2 font-bold text-white transition-colors hover:bg-purple-500">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Popover>
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

