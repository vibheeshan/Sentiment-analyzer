import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, Filter, TrendingUp,
  TrendingDown, Minus, Info
} from 'lucide-react';

// Generate mock data for the past 6 months
function generateCalendarData() {
  const data = {};
  const now = new Date();
  for (let i = 180; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const rand = Math.random();
    // Cluster positive on weekdays
    const isWeekday = date.getDay() !== 0 && date.getDay() !== 6;
    const score = isWeekday
      ? Math.min(100, Math.round(55 + Math.random() * 35))
      : Math.round(30 + Math.random() * 40);
    const volume = Math.round(10 + Math.random() * 190);
    data[key] = { score, volume, entries: Math.round(volume * 0.8) };
  }
  return data;
}

const MOCK_DATA = generateCalendarData();

function getColor(score) {
  if (score === null || score === undefined) return null;
  if (score >= 75) return { bg: 'rgba(16,185,129,0.85)', border: 'rgba(16,185,129,0.3)' };
  if (score >= 55) return { bg: 'rgba(234,179,8,0.75)', border: 'rgba(234,179,8,0.3)' };
  if (score >= 35) return { bg: 'rgba(249,115,22,0.7)', border: 'rgba(249,115,22,0.3)' };
  return { bg: 'rgba(239,68,68,0.75)', border: 'rgba(239,68,68,0.3)' };
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarHeatmap({ data = MOCK_DATA }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const cells = buildMonthGrid(year, month);

  const goBack = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const goForward = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const currentData = Object.entries(data)
    .filter(([k]) => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));

  const avgScore = currentData.length
    ? Math.round(currentData.reduce((s, [, d]) => s + d.score, 0) / currentData.length)
    : 0;
  const totalVol = currentData.reduce((s, [, d]) => s + d.volume, 0);
  const bestDay = currentData.reduce((best, [k, d]) => d.score > (best[1]?.score || 0) ? [k, d] : best, ['', {}]);

  return (
    <div className="card rounded-[18px] p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            Sentiment Calendar Heatmap
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Daily sentiment scores — green = positive, red = negative</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="btn btn-icon-sm btn-ghost">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-black text-slate-200 min-w-[120px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={goForward} className="btn btn-icon-sm btn-ghost">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monthly KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Avg Score', value: `${avgScore}%`, color: getColor(avgScore)?.bg || '#6b7280' },
          { label: 'Total Volume', value: totalVol.toLocaleString(), color: '#6366f1' },
          { label: 'Best Day', value: bestDay[0] ? bestDay[0].slice(5) : '—', color: '#10b981' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{kpi.label}</div>
            <div className="text-base font-black mt-1" style={{ color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-[9px] font-black uppercase tracking-wider text-slate-500 text-center py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5 relative">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="aspect-square" />;
          const key = date.toISOString().slice(0, 10);
          const dayData = data[key];
          const colors = dayData ? getColor(dayData.score) : null;
          const isToday = key === new Date().toISOString().slice(0, 10);

          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.08, zIndex: 10 }}
              className="aspect-square rounded-lg cursor-pointer flex flex-col items-center justify-center relative transition-all"
              style={{
                background: colors ? colors.bg : 'rgba(255,255,255,0.03)',
                border: isToday
                  ? '2px solid rgba(168,85,247,0.8)'
                  : colors
                    ? `1px solid ${colors.border}`
                    : '1px solid rgba(255,255,255,0.05)',
              }}
              onMouseEnter={(e) => {
                setHoveredDate({ key, ...dayData });
                setTooltipPos({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <span className="text-[9px] font-black text-white/70 leading-none">
                {date.getDate()}
              </span>
              {dayData && (
                <span className="text-[8px] font-black text-white/90 mt-0.5 leading-none">
                  {dayData.score}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredDate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-[9999] pointer-events-none rounded-xl border border-white/10 bg-slate-900/98 p-3 text-xs shadow-2xl"
            style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 60 }}
          >
            <div className="font-black text-white mb-1.5">{hoveredDate.key}</div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Sentiment</span>
                <span className="font-bold" style={{ color: getColor(hoveredDate.score)?.bg }}>
                  {hoveredDate.score ?? '—'}%
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Volume</span>
                <span className="font-bold text-white">{hoveredDate.volume ?? 0}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Entries</span>
                <span className="font-bold text-white">{hoveredDate.entries ?? 0}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
        <span>Less</span>
        {[10, 35, 55, 75, 90].map(s => (
          <div
            key={s}
            className="w-4 h-4 rounded"
            style={{ background: getColor(s)?.bg }}
            title={`~${s}%`}
          />
        ))}
        <span>More positive</span>
      </div>
    </div>
  );
}
