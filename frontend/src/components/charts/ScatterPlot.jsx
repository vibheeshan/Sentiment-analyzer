import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, Cell, LabelList
} from 'recharts';
import { ZoomIn, Download, Maximize2 } from 'lucide-react';

const SENTIMENT_COLORS = {
  Positive: '#10b981',
  Negative: '#ef4444',
  Neutral: '#6b7280',
  Mixed: '#a78bfa',
};

const MOCK_DATA = Array.from({ length: 60 }, (_, i) => {
  const sent = ['Positive', 'Negative', 'Neutral', 'Mixed'][Math.floor(Math.random() * 4)];
  return {
    id: i + 1,
    confidence: Math.round(50 + Math.random() * 50),
    sentiment_score: parseFloat((-1 + Math.random() * 2).toFixed(2)),
    sentiment: sent,
    volume: Math.floor(5 + Math.random() * 50),
    text: `Sample review #${i + 1}`,
  };
});

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const color = SENTIMENT_COLORS[payload.sentiment] || '#888';
  return (
    <circle cx={cx} cy={cy} r={5} fill={color} fillOpacity={0.8}
      stroke={color} strokeWidth={1} strokeOpacity={0.4} />
  );
};

const CustomTooltipContent = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const color = SENTIMENT_COLORS[d.sentiment];
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl text-xs">
      <div className="font-black mb-1" style={{ color }}>{d.sentiment}</div>
      <div className="text-slate-400">Confidence: <span className="text-white font-bold">{d.confidence}%</span></div>
      <div className="text-slate-400">Score: <span className="text-white font-bold">{d.sentiment_score}</span></div>
      <div className="text-slate-400 mt-1 max-w-[160px] truncate opacity-70">{d.text}</div>
    </div>
  );
};

export default function ScatterPlot({ data = MOCK_DATA }) {
  const [filter, setFilter] = useState('All');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filtered = filter === 'All' ? data : data.filter(d => d.sentiment === filter);

  const panel = (
    <div className="card rounded-[18px] p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            Confidence vs Sentiment Score
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Each point represents one review entry</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {['All', 'Positive', 'Negative', 'Neutral', 'Mixed'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                  filter === s
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >{s}</button>
            ))}
          </div>
          <button
            onClick={() => setIsFullscreen(v => !v)}
            className="btn btn-icon btn-ghost"
            title="Toggle fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {Object.entries(SENTIMENT_COLORS).map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="confidence"
              name="Confidence"
              unit="%"
              stroke="#475569"
              tick={{ fontSize: 10, fill: '#64748b' }}
              label={{ value: 'Confidence %', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }}
            />
            <YAxis
              dataKey="sentiment_score"
              name="Score"
              domain={[-1, 1]}
              stroke="#475569"
              tick={{ fontSize: 10, fill: '#64748b' }}
              label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltipContent />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} />
            <Scatter data={filtered} shape={<CustomDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
        {Object.entries(SENTIMENT_COLORS).map(([label, color]) => {
          const count = data.filter(d => d.sentiment === label).length;
          const pct = data.length > 0 ? ((count / data.length) * 100).toFixed(0) : 0;
          return (
            <div key={label} className="flex flex-col gap-0.5">
              <div className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>{label}</div>
              <div className="text-xl font-black" style={{ color }}>{count}</div>
              <div className="text-[10px] text-slate-500">{pct}% of total</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-lg flex flex-col p-6"
        >
          <div className="flex justify-end mb-4">
            <button onClick={() => setIsFullscreen(false)} className="btn btn-ghost">
              ✕ Exit Fullscreen
            </button>
          </div>
          <div className="flex-1">{panel}</div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return panel;
}
