import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, X, TrendingDown, Clock } from 'lucide-react';

export default function AnomalyBanner({ onJump, anomalyData = null }) {
  const [dismissed, setDismissed] = useState(false);

  const data = anomalyData || {
    type: 'Negative Spike',
    change: '+34%',
    aspect: 'Pricing',
    timeframe: '24h',
    severity: 'critical'
  };

  if (dismissed) return null;

  const severityColors = {
    critical: { bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.30)', text: '#ef4444', badge: 'bg-red-500/15 text-red-400 border-red-500/25' },
    warning:  { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.30)', text: '#f59e0b', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  };
  const colors = severityColors[data.severity] || severityColors.warning;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className="rounded-xl border px-4 py-3.5 flex items-center justify-between gap-4 flex-wrap"
        style={{
          background: `linear-gradient(135deg, ${colors.bg}, rgba(13,21,38,0.85))`,
          borderColor: colors.border
        }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="p-2 rounded-xl flex-shrink-0"
            style={{ background: `${colors.text}20`, color: colors.text }}
          >
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-extrabold text-slate-100">
                🚨 Sentiment Anomaly Detected!
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${colors.badge}`}
              >
                <TrendingDown className="w-3 h-3" />
                {data.type}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Negative customer sentiment spiked by{' '}
              <strong style={{ color: colors.text }}>{data.change}</strong>{' '}
              in <strong className="text-slate-200">{data.aspect}</strong> feedback over the past{' '}
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {data.timeframe}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onJump}
            className="px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
            style={{ background: `${colors.text}20`, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            Inspect Period <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
