import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { Maximize2, Info } from 'lucide-react';

const SOURCES = [
  { name: 'Twitter/X', volume: 2840, positive: 68, negative: 22, neutral: 10, color: '#1d9bf0' },
  { name: 'Amazon',    volume: 1920, positive: 74, negative: 18, neutral: 8,  color: '#ff9900' },
  { name: 'Reddit',    volume: 1340, positive: 45, negative: 42, neutral: 13, color: '#ff4500' },
  { name: 'Google',    volume: 980,  positive: 82, negative: 10, neutral: 8,  color: '#4285f4' },
  { name: 'Facebook',  volume: 760,  positive: 58, negative: 30, neutral: 12, color: '#1877f2' },
  { name: 'Yelp',      volume: 540,  positive: 61, negative: 29, neutral: 10, color: '#f43f5e' },
  { name: 'TrustPilot',volume: 420,  positive: 71, negative: 21, neutral: 8,  color: '#00b67a' },
];

const CustomBubbleTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl text-xs min-w-[160px]">
      <div className="font-black text-sm mb-2" style={{ color: d.color }}>{d.name}</div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-4"><span className="text-slate-400">Volume</span><span className="font-bold text-white">{d.volume.toLocaleString()}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">Positive</span><span className="font-bold text-emerald-400">{d.positive}%</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">Negative</span><span className="font-bold text-red-400">{d.negative}%</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">Neutral</span><span className="font-bold text-slate-300">{d.neutral}%</span></div>
      </div>
    </div>
  );
};

export default function BubbleChart({ data = SOURCES }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlighted, setHighlighted] = useState(null);

  const bubbleData = data.map(d => ({
    ...d,
    x: d.positive,
    y: d.negative,
    z: d.volume,
  }));

  const panel = (
    <div className="card rounded-[18px] p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Sentiment vs Volume by Source
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Bubble size = volume · X axis = positive% · Y axis = negative%</p>
        </div>
        <button onClick={() => setIsFullscreen(v => !v)} className="btn btn-icon btn-ghost">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="x" name="Positive %"
              domain={[30, 95]} unit="%"
              stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }}
              label={{ value: 'Positive %', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }}
            />
            <YAxis
              dataKey="y" name="Negative %"
              domain={[0, 55]} unit="%"
              stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }}
              label={{ value: 'Negative %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
            />
            <ZAxis dataKey="z" range={[60, 600]} name="Volume" />
            <Tooltip content={<CustomBubbleTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} />
            <Scatter
              data={bubbleData}
              onMouseEnter={(d) => setHighlighted(d.name)}
              onMouseLeave={() => setHighlighted(null)}
            >
              {bubbleData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  fillOpacity={highlighted === null || highlighted === entry.name ? 0.75 : 0.2}
                  stroke={entry.color}
                  strokeWidth={1.5}
                  strokeOpacity={0.4}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {data.map(s => (
          <button
            key={s.name}
            onMouseEnter={() => setHighlighted(s.name)}
            onMouseLeave={() => setHighlighted(null)}
            className={`flex items-center gap-1.5 text-[10px] font-bold transition-opacity ${
              highlighted && highlighted !== s.name ? 'opacity-30' : 'opacity-100'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-slate-400">{s.name}</span>
            <span className="text-slate-500">({(s.volume / 1000).toFixed(1)}k)</span>
          </button>
        ))}
      </div>

      {/* Source table */}
      <div className="overflow-x-auto rounded-xl border border-white/5 mt-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/8 bg-white/3">
              {['Source', 'Volume', 'Positive', 'Negative', 'Sentiment Index'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.sort((a, b) => b.volume - a.volume).map((s, i) => {
              const idx = ((s.positive - s.negative + 100) / 2).toFixed(0);
              return (
                <tr
                  key={s.name}
                  className="border-b border-white/5 transition-colors hover:bg-white/3"
                  onMouseEnter={() => setHighlighted(s.name)}
                  onMouseLeave={() => setHighlighted(null)}
                >
                  <td className="px-3 py-2 flex items-center gap-2 font-bold">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-slate-200">{s.name}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-300 font-mono">{s.volume.toLocaleString()}</td>
                  <td className="px-3 py-2 text-emerald-400 font-bold">{s.positive}%</td>
                  <td className="px-3 py-2 text-red-400 font-bold">{s.negative}%</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-purple-500" style={{ width: `${idx}%` }} />
                      </div>
                      <span className="text-purple-400 font-mono font-bold text-[10px]">{idx}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-lg flex flex-col p-6"
        >
          <div className="flex justify-end mb-4">
            <button onClick={() => setIsFullscreen(false)} className="btn btn-ghost">✕ Exit Fullscreen</button>
          </div>
          <div className="flex-1">{panel}</div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return panel;
}
