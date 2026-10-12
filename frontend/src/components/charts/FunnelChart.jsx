import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, FunnelChart as RFunnelChart, Funnel, LabelList, Tooltip, Cell
} from 'recharts';
import { ChevronRight } from 'lucide-react';

const DEFAULT_DATA = [
  { name: 'Raw Text Ingested',   value: 10000, color: '#6366f1', icon: '📥', description: 'Total raw input from all sources' },
  { name: 'Pre-processed',        value: 9420,  color: '#8b5cf6', icon: '⚙️', description: 'Cleaned, tokenized, normalized' },
  { name: 'Language Detected',    value: 9100,  color: '#a78bfa', icon: '🌐', description: 'Language classified (en/es/fr/etc.)' },
  { name: 'Spam Filtered',        value: 8650,  color: '#0ea5e9', icon: '🛡️', description: 'Bot & spam entries removed' },
  { name: 'Sentiment Analyzed',   value: 8200,  color: '#10b981', icon: '🧠', description: 'Sentiment classification complete' },
  { name: 'Insights Generated',   value: 7900,  color: '#22d3ee', icon: '💡', description: 'AI insights & recommendations ready' },
];

const CustomFunnelTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const dropRate = d.fill && DEFAULT_DATA[DEFAULT_DATA.findIndex(x => x.name === d.name) - 1]
    ? (((DEFAULT_DATA[DEFAULT_DATA.findIndex(x => x.name === d.name) - 1].value - d.value) / DEFAULT_DATA[DEFAULT_DATA.findIndex(x => x.name === d.name) - 1].value) * 100).toFixed(1)
    : null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 p-3 text-xs shadow-2xl min-w-[180px]">
      <div className="font-black text-sm text-white mb-2">{d.name}</div>
      <div className="flex justify-between gap-4 mb-1">
        <span className="text-slate-400">Records</span>
        <span className="font-bold text-white">{d.value?.toLocaleString()}</span>
      </div>
      {dropRate && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Drop-off</span>
          <span className="font-bold text-red-400">-{dropRate}%</span>
        </div>
      )}
      {d.description && (
        <div className="mt-2 text-slate-500 border-t border-white/5 pt-2">{d.description}</div>
      )}
    </div>
  );
};

export default function FunnelChart({ data = DEFAULT_DATA }) {
  const [view, setView] = useState('chart'); // 'chart' | 'table'

  const chartData = data.map(d => ({ ...d, fill: d.color }));

  const conversionRate = data.length >= 2
    ? ((data[data.length - 1].value / data[0].value) * 100).toFixed(1)
    : 100;

  return (
    <div className="card rounded-[18px] p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            Analysis Pipeline Funnel
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            From raw text ingestion to actionable insights — {conversionRate}% conversion rate
          </p>
        </div>
        <div className="flex gap-1">
          {['chart', 'table'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all capitalize ${
                view === v ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >{v}</button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Input Volume', value: data[0]?.value?.toLocaleString(), color: '#6366f1' },
          { label: 'Final Output', value: data[data.length - 1]?.value?.toLocaleString(), color: '#10b981' },
          { label: 'Conversion', value: `${conversionRate}%`, color: '#f59e0b' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{kpi.label}</div>
            <div className="text-lg font-black mt-1" style={{ color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {view === 'chart' ? (
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <RFunnelChart>
              <Tooltip content={<CustomFunnelTooltip />} />
              <Funnel dataKey="value" data={chartData} isAnimationActive={true} animationDuration={800}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.fill} fillOpacity={0.9} />
                ))}
                <LabelList
                  dataKey="name"
                  position="right"
                  style={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                />
              </Funnel>
            </RFunnelChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                {['Stage', 'Records', 'Retention', 'Drop-off'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((stage, i) => {
                const prev = i > 0 ? data[i - 1].value : stage.value;
                const retention = i === 0 ? 100 : ((stage.value / data[0].value) * 100).toFixed(1);
                const dropOff = i === 0 ? 0 : (((prev - stage.value) / prev) * 100).toFixed(1);
                return (
                  <tr key={stage.name} className="border-b border-white/5 hover:bg-white/3">
                    <td className="px-3 py-2.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stage.color }} />
                      <span className="font-semibold text-slate-200">{stage.name}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-white">{stage.value.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${retention}%`, background: stage.color }} />
                        </div>
                        <span className="text-slate-300 font-bold">{retention}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {dropOff > 0 ? (
                        <span className="text-red-400 font-bold">-{dropOff}%</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
