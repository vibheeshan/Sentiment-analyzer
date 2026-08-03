import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

const KEYWORDS = [
  { text: 'fast setup',     type: 'positive', count: 184, growth: +24, sentiment: 92 },
  { text: 'responsive UI',  type: 'positive', count: 165, growth: +18, sentiment: 88 },
  { text: 'pricing model',  type: 'neutral',  count: 120, growth: +4,  sentiment: 54 },
  { text: 'mobile crash',   type: 'negative', count: 95,  growth: -12, sentiment: 12 },
  { text: 'billing issue',  type: 'negative', count: 82,  growth: +32, sentiment: 8 },
  { text: 'sleek dark mode',type: 'positive', count: 76,  growth: +41, sentiment: 96 },
  { text: 'export timeout', type: 'negative', count: 54,  growth: -8,  sentiment: 19 },
  { text: 'API delay',      type: 'negative', count: 48,  growth: +15, sentiment: 22 },
  { text: 'documentation',  type: 'neutral',  count: 42,  growth: +2,  sentiment: 61 },
];

export default function KeywordAnalytics() {
  const keywordTypes = useMemo(() => {
    return {
      positive: KEYWORDS.filter(k => k.type === 'positive'),
      negative: KEYWORDS.filter(k => k.type === 'negative'),
      neutral: KEYWORDS.filter(k => k.type === 'neutral'),
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-purple-400" /> Keyword Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1">Deep-dive keyword cloud and frequency tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Word Cloud Visualizer Mock */}
        <div className="card rounded-[18px] p-6 lg:col-span-1 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-slate-200">Word Cloud Cloud Map</h3>
          <div className="h-[260px] flex items-center justify-center flex-wrap gap-2.5 p-4 bg-slate-950/40 rounded-2xl border border-white/5 relative overflow-hidden">
            {KEYWORDS.map((k, idx) => {
              const colors = {
                positive: 'text-emerald-400',
                negative: 'text-rose-400',
                neutral: 'text-slate-400'
              };
              const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
              const sizeIdx = Math.min(sizes.length - 1, Math.floor(k.count / 30));
              return (
                <motion.span
                  key={idx}
                  whileHover={{ scale: 1.15, rotate: idx % 2 === 0 ? 3 : -3 }}
                  className={`font-black tracking-tight cursor-default ${colors[k.type]} ${sizes[sizeIdx]}`}
                >
                  {k.text}
                </motion.span>
              );
            })}
          </div>
        </div>

        {/* Detailed Keyword Analytics */}
        <div className="card rounded-[18px] p-6 lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-slate-200">Keyword Sentiments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Positive Buzzwords
              </h4>
              <div className="flex flex-col gap-2">
                {keywordTypes.positive.map((k, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{k.text}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{k.count} mentions</div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      +{k.growth}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> Critical Complaining Terms
              </h4>
              <div className="flex flex-col gap-2">
                {keywordTypes.negative.map((k, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{k.text}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{k.count} mentions</div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${k.growth >= 0 ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' : 'text-slate-400 bg-white/5'}`}>
                      {k.growth >= 0 ? `+${k.growth}%` : `${k.growth}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
