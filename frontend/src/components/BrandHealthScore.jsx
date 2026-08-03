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
      className={`rounded-[18px] border border-slate-200 dark:border-white/5 overflow-hidden bg-gradient-to-br ${gradientFrom} to-white dark:to-slate-900/40 backdrop-blur-md`}
      style={{ boxShadow: `0 8px 32px -8px ${color}30` }}
    >
      {/* Header */}
      <div
        className="px-6 h-[48px] flex items-center gap-2 border-b border-white/5"
        style={{
          background: `linear-gradient(135deg, ${color}15, transparent)`,
          borderBottom: `1px solid ${color}20`
        }}
      >
        <span className="text-[13px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-400">
          Brand Health Index
        </span>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
          style={{ background: `${color}15`, borderColor: `${color}30`, color }}
        >
          {label}
        </span>
      </div>

      <div className="flex items-center gap-8 p-6 flex-wrap justify-center">
        {/* Circular progress ring */}
        <div className="relative w-[120px] h-[120px] shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 absolute inset-0">
            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
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
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none" style={{ zIndex: 'var(--z-sticky)' }}>
            <span className="text-[32px] font-black text-slate-800 dark:text-slate-100">{score}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">/ 100</span>
          </div>
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 20px ${color}30`, `0 0 0px ${color}00`] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4 flex-1 min-w-[240px]">
          <div>
            <h3 className="text-[24px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {emoji} {label} Brand Perception
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
              </span>
            </h3>
            <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-2 max-w-[480px] leading-relaxed">
              Calculated dynamically from real-time customer sentiment, model confidence, trend direction, and review authenticity metrics.
            </p>
          </div>

          {/* Mini stats */}
          <div className="flex gap-3 flex-wrap">
            {[
              { icon: TrendingUp, label: 'Positive Rate', value: positiveRate ? `${positiveRate.toFixed(1)}%` : '—', color: '#10B981' },
              { icon: Activity, label: 'Total Reviews', value: totalEntries || '—', color: '#0EA5E9' },
              { icon: Award, label: 'Health Band', value: label, color },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-[12px] px-4 py-2.5 border border-slate-200 dark:border-white/5">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: stat.color }} />
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
                    <div className="text-[15px] font-black text-slate-800 dark:text-slate-100">{stat.value}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Score bar - 12px height */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-0.5">
              <span>0</span>
              <span>40</span>
              <span>70</span>
              <span>100</span>
            </div>
            <div className="w-full h-[12px] bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #EF4444, #F59E0B 40%, #0EA5E9 70%, #10B981)` }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider px-0.5">
              <span className="text-red-500">Critical</span>
              <span className="text-amber-500">Warning</span>
              <span className="text-sky-500">Good</span>
              <span className="text-emerald-500">Excellent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
