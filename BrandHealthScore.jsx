import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Activity } from 'lucide-react';

export default function BrandHealthScore({ score = 84, label = 'Good', positiveRate = 0, totalEntries = 0 }) {
  const circumference = 251.3; // 2 * PI * 40
  const strokeDashoffset = circumference - (circumference * score) / 100;
  
  const color =
    score >= 80 ? '#10B981' :
    score >= 60 ? '#0EA5E9' :
    score >= 40 ? '#F59E0B' :
    '#EF4444';

  const gradientFrom =
    score >= 80 ? 'from-emerald-500/20' :
    score >= 60 ? 'from-sky-500/20' :
    score >= 40 ? 'from-amber-500/20' :
    'from-red-500/20';

  const emoji =
    score >= 80 ? '🚀' :
    score >= 60 ? '✅' :
    score >= 40 ? '⚠️' :
    '🚨';

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden bg-gradient-to-br ${gradientFrom} to-white dark:to-slate-900/40 backdrop-blur-md`}
      style={{ boxShadow: `0 8px 32px -8px ${color}30` }}
    >
      {/* Animated gradient hero header */}
      <div
        className="px-6 py-4 border-b border-white/5 flex items-center gap-2"
        style={{
          background: `linear-gradient(135deg, ${color}15, transparent)`,
          borderBottom: `1px solid ${color}20`
        }}
      >
        <span className="text-xs font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-400">
          Brand Health Index
        </span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
          style={{ background: `${color}15`, borderColor: `${color}30`, color }}
        >
          {label}
        </span>
      </div>

      <div className="flex items-start gap-6 p-6 flex-wrap">
        {/* Circular progress ring */}
        <div className="relative w-[130px] h-[130px] shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 absolute inset-0">
            {/* Track */}
            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
            {/* Progress */}
            <motion.circle
              cx="50" cy="50" r="40"
              stroke={color}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              strokeLinecap="round"
              filter={`drop-shadow(0 0 8px ${color}60)`}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none z-10">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{score}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">/ 100</span>
          </div>

          {/* Outer glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [`0 0 0px ${color}00`, `0 0 20px ${color}30`, `0 0 0px ${color}00`]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {emoji} {label} Brand Perception
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 max-w-[420px] leading-relaxed">
              Calculated dynamically from real-time customer sentiment share, model confidence, trend direction, and review authenticity metrics.
            </p>
          </div>

          {/* Mini stats */}
          <div className="flex gap-4 flex-wrap">
            {[
              { icon: TrendingUp, label: 'Positive Rate', value: positiveRate ? `${positiveRate.toFixed(1)}%` : '—', color: '#10B981' },
              { icon: Activity, label: 'Total Reviews', value: totalEntries || '—', color: '#0EA5E9' },
              { icon: Award, label: 'Health Band', value: label, color },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-xl px-3 py-2 border border-slate-200 dark:border-white/5">
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: stat.color }} />
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
                    <div className="text-sm font-black text-slate-800 dark:text-slate-100">{stat.value}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Score bar */}
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="grid grid-cols-4 gap-0 text-[8px] font-bold text-slate-500 uppercase tracking-wide">
              <span>0</span>
              <span className="text-center">40</span>
              <span className="text-center">70</span>
              <span className="text-right">100</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, #EF4444, #F59E0B 40%, #0EA5E9 70%, #10B981)`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <div className="grid grid-cols-4 gap-0 text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              <span>Critical</span>
              <span className="text-center">Warning</span>
              <span className="text-center">Good</span>
              <span className="text-right">Excellent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
