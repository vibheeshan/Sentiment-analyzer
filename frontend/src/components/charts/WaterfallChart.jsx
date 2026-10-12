import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine, Cell, LabelList
} from 'recharts';

const DEFAULT_WATERFALL_DATA = [
  { name: 'Jan Baseline',    value: 62.0,  running: 62.0,  type: 'start',    delta: 0    },
  { name: '+ Product Launch',value: 8.4,   running: 70.4,  type: 'positive', delta: 8.4  },
  { name: '− Pricing Issue', value: -5.2,  running: 65.2,  type: 'negative', delta: -5.2 },
  { name: '+ Viral Campaign',value: 6.8,   running: 72.0,  type: 'positive', delta: 6.8  },
  { name: '− Competitor Ad', value: -3.1,  running: 68.9,  type: 'negative', delta: -3.1 },
  { name: '+ Seasonal Peak', value: 5.5,   running: 74.4,  type: 'positive', delta: 5.5  },
  { name: '− Delivery Bug',  value: -4.0,  running: 70.4,  type: 'negative', delta: -4.0 },
  { name: 'Jul Final',       value: 70.4,  running: 70.4,  type: 'end',      delta: 0    },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 p-3 text-xs shadow-2xl">
      <div className="font-black text-white mb-2">{label}</div>
      <div className="flex flex-col gap-1">
        {d.type !== 'start' && d.type !== 'end' && (
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Change</span>
            <span className={`font-black ${d.delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {d.delta > 0 ? '+' : ''}{d.delta?.toFixed(1)}%
            </span>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Running Total</span>
          <span className="font-bold text-white">{d.running?.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default function WaterfallChart({ data = DEFAULT_WATERFALL_DATA }) {
  const [view, setView] = useState('waterfall');

  // Transform for recharts: each bar has base + delta
  const chartData = data.map((d, i) => {
    const base = d.type === 'start' || d.type === 'end' ? 0 : Math.min(d.running, d.running - d.delta);
    const barVal = d.type === 'start' || d.type === 'end' ? d.value : Math.abs(d.delta);
    return { ...d, base, barVal };
  });

  const startVal = data[0]?.value || 0;
  const endVal = data[data.length - 1]?.running || 0;
  const netChange = endVal - startVal;

  return (
    <div className="card rounded-[18px] p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            Sentiment Change Waterfall
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Cumulative sentiment score drivers over time</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-black px-2.5 py-1 rounded-full ${netChange >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
            Net: {netChange >= 0 ? '+' : ''}{netChange.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Start Score', value: `${startVal}%`, color: '#6366f1' },
          { label: 'End Score', value: `${endVal.toFixed(1)}%`, color: netChange >= 0 ? '#10b981' : '#ef4444' },
          { label: 'Net Change', value: `${netChange >= 0 ? '+' : ''}${netChange.toFixed(1)}%`, color: netChange >= 0 ? '#10b981' : '#ef4444' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{kpi.label}</div>
            <div className="text-lg font-black mt-1" style={{ color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#475569"
              tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }}
              angle={-35}
              textAnchor="end"
              height={55}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#475569"
              tick={{ fontSize: 10, fill: '#64748b' }}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={startVal} stroke="#6366f1" strokeDasharray="4 2" strokeOpacity={0.5} />
            {/* Invisible base bar for stacking effect */}
            <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
            {/* Colored value bar */}
            <Bar dataKey="barVal" stackId="a" radius={[4, 4, 0, 0]} isAnimationActive>
              {chartData.map((entry, i) => {
                let color = '#6366f1';
                if (entry.type === 'positive') color = '#10b981';
                if (entry.type === 'negative') color = '#ef4444';
                if (entry.type === 'end') color = '#f59e0b';
                return <Cell key={i} fill={color} fillOpacity={0.85} />;
              })}
            </Bar>
            {/* Running line */}
            <Line dataKey="running" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} strokeDasharray="4 2" type="monotone" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-[10px] font-bold">
        {[
          { color: '#6366f1', label: 'Baseline' },
          { color: '#10b981', label: 'Positive driver' },
          { color: '#ef4444', label: 'Negative driver' },
          { color: '#f59e0b', label: 'End total' },
          { color: '#a78bfa', label: 'Running trend' },
        ].map(item => (
          <span key={item.label} className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
