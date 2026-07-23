import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeatmapCalendar() {
  const [tooltip, setTooltip] = useState(null);

  // Generate last 90 days with deterministic values
  const days = Array.from({ length: 91 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (90 - i));
    const score = Math.min(100, Math.max(10,
      Math.floor(Math.sin(i * 0.18) * 22 + 72) + Math.floor((i % 7) * 1.5)
    ));
    const totalReviews = Math.floor(Math.sin(i * 0.12) * 9 + 14);
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    const year = d.getFullYear();
    return { date: `${month} ${day}, ${year}`, score, totalReviews, dayOfWeek: d.getDay(), month };
  });

  const getColor = (score) => {
    if (score >= 88) return { bg: 'bg-emerald-500', shadow: 'shadow-sm shadow-emerald-500/30', label: 'Excellent' };
    if (score >= 72) return { bg: 'bg-emerald-600/70', shadow: '', label: 'Good' };
    if (score >= 58) return { bg: 'bg-amber-500/70', shadow: '', label: 'Moderate' };
    if (score >= 40) return { bg: 'bg-orange-500/60', shadow: '', label: 'Concerning' };
    return { bg: 'bg-red-500/70', shadow: '', label: 'Poor' };
  };

  // Group into weeks for GitHub-style layout
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Determine start day of first entry and group into weeks
  const firstDay = days[0].dayOfWeek;
  const paddedDays = Array(firstDay).fill(null).concat(days);
  
  // Group padded days into weeks
  const weeks = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }
  
  // Get unique months for headers
  const monthHeaders = [];
  let currentMonth = null;
  let monthStartWeek = 0;
  days.forEach((day, idx) => {
    if (day.month !== currentMonth) {
      currentMonth = day.month;
      monthStartWeek = Math.floor((idx + firstDay) / 7);
      monthHeaders.push({ month: currentMonth, startWeek: monthStartWeek });
    }
  });

  const avg = Math.round(days.reduce((s, d) => s + d.score, 0) / days.length);
  const best = days.reduce((a, b) => a.score > b.score ? a : b);
  const worst = days.reduce((a, b) => a.score < b.score ? a : b);

  return (
    <div className="card p-5 relative overflow-hidden">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              📅 90-Day Brand Sentiment Heatmap
            </h4>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
              GitHub-style activity grid — hover cells for detailed metrics
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Mini stats */}
            <div className="flex gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span>Avg: <strong className="text-sky-500 dark:text-sky-400">{avg}%</strong></span>
              <span>Best: <strong className="text-emerald-500 dark:text-emerald-400">{best.score}%</strong></span>
              <span>Worst: <strong className="text-red-500 dark:text-red-400">{worst.score}%</strong></span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <span>Negative</span>
              {['bg-red-500/70', 'bg-orange-500/60', 'bg-amber-500/70', 'bg-emerald-600/70', 'bg-emerald-500'].map((c, i) => (
                <span key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
              ))}
              <span>Positive</span>
            </div>
          </div>
        </div>

        <div className="heatmap-wrapper">
          <div className="flex gap-2">
            {/* Day labels on the left */}
            <div className="flex flex-col gap-1 pt-6">
              {DAYS.map((d, i) => (
                <div key={i} className="w-12 h-[18px] text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center">
                  {d}
                </div>
              ))}
            </div>

            {/* Month headers and grid */}
            <div className="flex flex-col gap-0">
              {/* Month header row */}
              <div className="flex gap-1 mb-1 h-5">
                {weeks.map((week, weekIdx) => {
                  const firstDateInWeek = week.find(d => d !== null);
                  const isMonthStart = firstDateInWeek && (weekIdx === 0 || week.find(d => d !== null)?.month !== weeks[weekIdx - 1]?.find(d => d !== null)?.month);
                  return (
                    <div key={weekIdx} className="w-[115px] h-5 px-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 flex items-center">
                      {isMonthStart && firstDateInWeek ? firstDateInWeek.month : ''}
                    </div>
                  );
                })}
              </div>
              
              {/* Grid of cells */}
              <div className="flex gap-1">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1" style={{ width: '115px' }}>
                    {week.map((day, dayIdx) => {
                      if (!day) {
                        return <div key={dayIdx} className="w-[13px] h-[13px]" />;
                      }
                      const { bg, shadow, label } = getColor(day.score);
                      return (
                        <motion.div
                          key={`${weekIdx}-${dayIdx}`}
                          className={`heatmap-cell ${bg} ${shadow}`}
                          onMouseEnter={(e) => {
                            const rect = e.target.getBoundingClientRect();
                            setTooltip({ ...day, label, x: rect.left, y: rect.top });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-[200] pointer-events-none"
            style={{ top: tooltip.y - 80, left: tooltip.x - 60 }}
          >
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 shadow-2xl flex flex-col gap-0.5">
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{tooltip.date}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Health: <strong className="text-slate-800 dark:text-slate-200">{tooltip.score}%</strong></span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Reviews: <strong className="text-slate-800 dark:text-slate-200">{tooltip.totalReviews}</strong></span>
              <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5"
                style={{
                  color: tooltip.score >= 72 ? '#10B981' : tooltip.score >= 58 ? '#F59E0B' : '#EF4444'
                }}
              >
                {tooltip.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
