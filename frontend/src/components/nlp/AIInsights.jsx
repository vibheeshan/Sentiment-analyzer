import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';

export default function AIInsights() {
  const insights = [
    {
      title: 'Accelerate Mobile Performance Fixes',
      type: 'critical',
      tag: 'Risk',
      desc: 'Mobile crashes represent 12% of recent billing & technical complaint entries. A 10% decrease in crash rates is forecasted to improve overall Brand Health by +3.2 points.',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.08)'
    },
    {
      title: 'Leverage Sleek Dark Mode PRAISE',
      type: 'opportunity',
      tag: 'Opportunity',
      desc: 'Users absolutely love the premium dark mode look, representing a +41% week-over-week mention growth. Spotlight this visual feature in upcoming campaign creatives.',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.08)'
    },
    {
      title: 'Optimize API Response Latency',
      type: 'caution',
      tag: 'Caution',
      desc: 'Integrations from United Kingdom users exhibit high API delay complaints. Investigate edge server latency or region-specific CDN configurations.',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.08)'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--text-1)] flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" /> AI Insights & Recommendations
        </h2>
        <p className="text-xs text-[var(--text-2)] mt-1">Automatic generative summaries and suggested business mitigations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive summary panel */}
        <div className="card rounded-[18px] p-6 lg:col-span-1 flex flex-col gap-4 relative overflow-hidden" style={{ background: 'var(--bg-card)' }}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
          <h3 className="text-sm font-extrabold text-[var(--text-1)]">Executive Summary</h3>
          <p className="text-xs text-[var(--text-2)] leading-relaxed">
            Sentiment is trending upward overall (<strong className="text-emerald-500 dark:text-emerald-400">+8.4% WoW</strong>) driven by visual praises. However, friction points persist in <strong className="text-rose-500 dark:text-rose-400">mobile platform stability</strong> and <strong className="text-amber-500 dark:text-amber-400">logistics/shipping delays</strong>.
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card2)' }}>
              <span className="text-[11px] font-bold text-[var(--text-3)]">Total Insights Generated</span>
              <span className="text-xs font-black text-[var(--text-1)]">3 Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card2)' }}>
              <span className="text-[11px] font-bold text-[var(--text-3)]">Reliability Index</span>
              <span className="text-xs font-black text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> High (95.4%)
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Action items */}
        <div className="card rounded-[18px] p-6 lg:col-span-2 flex flex-col gap-4" style={{ background: 'var(--bg-card)' }}>
          <h3 className="text-sm font-extrabold text-[var(--text-1)]">AI Recommendations</h3>
          <div className="flex flex-col gap-3">
            {insights.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl border flex gap-4"
                style={{ borderLeft: `4px solid ${item.color}`, backgroundColor: item.bg, borderColor: 'var(--border)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border shrink-0 whitespace-nowrap"
                      style={{ color: item.color, borderColor: `${item.color}40`, backgroundColor: `${item.color}10` }}
                    >
                      {item.tag}
                    </span>
                    <h4 className="text-xs font-extrabold text-[var(--text-1)] truncate">{item.title}</h4>
                  </div>
                  <p className="text-[11px] text-[var(--text-2)] mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
                <button
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-[var(--text-2)] hover:text-[var(--text-1)] transition-all shrink-0 self-center"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card2)' }}
                  aria-label="Mitigate risk"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
