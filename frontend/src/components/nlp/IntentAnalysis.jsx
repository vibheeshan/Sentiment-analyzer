import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';
import {
  Brain, TrendingUp, AlertCircle, HelpCircle, ShoppingCart,
  RefreshCw, ThumbsUp, Wrench, Truck, CreditCard, XCircle,
  Bug, Zap, MessageSquare, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.08)',
  fontSize: 12
};

const INTENTS = [
  { key: 'complaint',       label: 'Complaint',         color: '#ef4444', icon: AlertCircle,    pct: 18.4, trend: -2.1, desc: 'Negative service or product feedback' },
  { key: 'question',        label: 'Question',          color: '#0ea5e9', icon: HelpCircle,     pct: 14.2, trend: +1.4, desc: 'Customer inquiries and support requests' },
  { key: 'purchase',        label: 'Purchase Intent',   color: '#10b981', icon: ShoppingCart,   pct: 12.7, trend: +3.8, desc: 'Users expressing buying intent' },
  { key: 'refund',          label: 'Refund Request',    color: '#f43f5e', icon: RefreshCw,      pct: 8.3,  trend: -1.2, desc: 'Return or refund demands' },
  { key: 'recommendation',  label: 'Recommendation',    color: '#22c55e', icon: ThumbsUp,       pct: 11.9, trend: +2.3, desc: 'Positive word-of-mouth sharing' },
  { key: 'praise',          label: 'Praise',            color: '#fbbf24', icon: ThumbsUp,       pct: 9.6,  trend: +0.8, desc: 'Explicit positive sentiment' },
  { key: 'feature_request', label: 'Feature Request',   color: '#a78bfa', icon: Wrench,         pct: 6.8,  trend: +1.1, desc: 'Product improvement suggestions' },
  { key: 'technical_issue', label: 'Technical Issue',   color: '#fb923c', icon: Bug,            pct: 5.4,  trend: -0.6, desc: 'Software or hardware problems' },
  { key: 'shipping',        label: 'Shipping',          color: '#38bdf8', icon: Truck,          pct: 4.9,  trend: -0.9, desc: 'Delivery and logistics feedback' },
  { key: 'billing',         label: 'Billing',           color: '#e879f9', icon: CreditCard,     pct: 3.2,  trend: +0.4, desc: 'Payment and invoice issues' },
  { key: 'cancellation',    label: 'Cancellation',      color: '#94a3b8', icon: XCircle,        pct: 2.1,  trend: -0.3, desc: 'Subscription or order cancellations' },
  { key: 'bug_report',      label: 'Bug Report',        color: '#f87171', icon: Bug,            pct: 1.8,  trend: -0.5, desc: 'Specific software defect reports' },
  { key: 'urgent',          label: 'Urgent',            color: '#fde047', icon: Zap,            pct: 0.9,  trend: +0.2, desc: 'High-priority escalation signals' },
  { key: 'general',         label: 'General',           color: '#64748b', icon: MessageSquare,  pct: 0.7,  trend: -0.1, desc: 'Uncategorized or miscellaneous' },
];

const TREND_DATA = [
  { day: 'Mon', Complaint: 21, Purchase: 10, Praise: 8, Refund: 9 },
  { day: 'Tue', Complaint: 19, Purchase: 11, Praise: 9, Refund: 8 },
  { day: 'Wed', Complaint: 22, Purchase: 12, Praise: 8, Refund: 10 },
  { day: 'Thu', Complaint: 17, Purchase: 13, Praise: 10, Refund: 7 },
  { day: 'Fri', Complaint: 15, Purchase: 14, Praise: 11, Refund: 8 },
  { day: 'Sat', Complaint: 14, Purchase: 15, Praise: 12, Refund: 6 },
  { day: 'Sun', Complaint: 12, Purchase: 16, Praise: 13, Refund: 5 },
];

function IntentCard({ intent, rank }) {
  const Icon = intent.icon;
  const positive = intent.trend >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${intent.color}18`, border: `1px solid ${intent.color}30` }}
      >
        <Icon className="w-4 h-4" style={{ color: intent.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-200 truncate">{intent.label}</span>
          <span className="text-xs font-black shrink-0" style={{ color: intent.color }}>{intent.pct}%</span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${intent.pct}%` }}
            transition={{ duration: 0.8, delay: rank * 0.04, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: intent.color }}
          />
        </div>
      </div>
      <span className={`text-[10px] font-bold shrink-0 flex items-center gap-0.5 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(intent.trend)}%
      </span>
    </motion.div>
  );
}

export default function IntentAnalysis({ analyses = [] }) {
  const [filter, setFilter] = useState('all');
  const [view,   setView]   = useState('overview');

  const pieData = useMemo(() =>
    INTENTS.map(i => ({ name: i.label, value: i.pct, color: i.color })),
  []);

  const barData = useMemo(() =>
    [...INTENTS]
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 8)
      .map(i => ({ name: i.label.split(' ')[0], value: i.pct, color: i.color })),
  []);

  const filteredIntents = filter === 'all'
    ? INTENTS
    : filter === 'positive'
    ? INTENTS.filter(i => i.trend > 0)
    : INTENTS.filter(i => i.trend < 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" /> Intent Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">AI-classified customer intent across 14 categories</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['overview', 'trends', 'detailed'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                view === v
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Intents Detected',  value: '14',    color: '#a78bfa' },
          { label: 'Top Intent',        value: 'Complaint', color: '#ef4444' },
          { label: 'Purchase Signals',  value: '12.7%', color: '#10b981' },
          { label: 'Escalation Risk',   value: 'Medium',color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="card rounded-[14px] p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{s.label}</div>
            <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {view === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Pie Chart */}
          <div className="card rounded-[18px] p-6 lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-slate-200">Intent Distribution</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={65} outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top intents list */}
          <div className="card rounded-[18px] p-6 lg:col-span-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-200">Top Intents by Volume</h3>
              <div className="flex items-center gap-1.5">
                {['all', 'positive', 'negative'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                      filter === f ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[280px] pr-1">
              {filteredIntents.sort((a, b) => b.pct - a.pct).map((intent, i) => (
                <IntentCard key={intent.key} intent={intent} rank={i} />
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'trends' && (
        <div className="card rounded-[18px] p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" /> Intent Trend — 7 Days
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                <defs>
                  {['Complaint', 'Purchase', 'Praise', 'Refund'].map((k, i) => (
                    <linearGradient key={k} id={`ig${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={INTENTS.find(x => x.label.startsWith(k))?.color || '#a78bfa'} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={INTENTS.find(x => x.label.startsWith(k))?.color || '#a78bfa'} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [`${v}%`, n]} />
                <Area type="monotone" dataKey="Complaint" stroke="#ef4444" fill="url(#ig0)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Purchase"  stroke="#10b981" fill="url(#ig1)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Praise"    stroke="#fbbf24" fill="url(#ig2)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Refund"    stroke="#f43f5e" fill="url(#ig3)" strokeWidth={2} dot={false} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {view === 'detailed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Horizontal Bar */}
          <div className="card rounded-[18px] p-6 flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-slate-200">Intent Volume Ranking</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20, top: 0, bottom: 0 }}>
                  <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fontSize: 11, fontWeight: 700 }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Share']} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* All intents table */}
          <div className="card rounded-[18px] p-6 flex flex-col gap-3">
            <h3 className="text-sm font-extrabold text-slate-200">All Intent Categories</h3>
            <div className="overflow-y-auto max-h-[320px] flex flex-col gap-1.5 pr-1">
              {INTENTS.map((intent, i) => (
                <div key={intent.key} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all">
                  <span className="text-[10px] font-black text-slate-600 w-4 shrink-0">#{i + 1}</span>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: intent.color }} />
                  <span className="text-xs font-bold text-slate-300 flex-1 truncate">{intent.label}</span>
                  <span className="text-xs font-black" style={{ color: intent.color }}>{intent.pct}%</span>
                  <span className={`text-[10px] font-bold ${intent.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {intent.trend >= 0 ? '+' : ''}{intent.trend}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
