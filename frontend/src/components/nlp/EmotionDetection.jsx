import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip
} from 'recharts';
import { Heart, Sparkles, AlertTriangle, AlertCircle } from 'lucide-react';

const EMOTIONS = [
  { emotion: 'Joy',          score: 82, color: '#f59e0b', desc: 'Satisfaction, delight, and customer praise' },
  { emotion: 'Trust',        score: 75, color: '#10b981', desc: 'Brand reliance, reliability, and security' },
  { emotion: 'Surprise',     score: 42, color: '#a78bfa', desc: 'Unexpected feature delight or service events' },
  { emotion: 'Sadness',      score: 18, color: '#3b82f6', desc: 'Product disappointment or unmet expectations' },
  { emotion: 'Fear',         score: 12, color: '#ec4899', desc: 'Data security concerns or project risks' },
  { emotion: 'Anger',        score: 8,  color: '#ef4444', desc: 'Billing issues or severe system outages' },
  { emotion: 'Disgust',      score: 4,  color: '#84cc16', desc: 'Strong negative aversion to service updates' },
  { emotion: 'Anticipation', score: 68, color: '#0ea5e9', desc: 'Excitement for future feature launches' },
];

export default function EmotionDetection() {
  const [selected, setSelected] = useState(EMOTIONS[0]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" /> Emotion Detection
        </h2>
        <p className="text-xs text-slate-400 mt-1">Granular emotional breakdown of customer sentiment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Radar Chart */}
        <div className="card rounded-[18px] p-6 lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-slate-200">Emotional Wheel</h3>
          <div className="h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={EMOTIONS}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="emotion" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                <Radar name="Customer Emotions" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Details / Insights */}
        <div className="card rounded-[18px] p-6 lg:col-span-3 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-slate-200">Granular Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EMOTIONS.map((e, idx) => (
              <button
                key={idx}
                onClick={() => setSelected(e)}
                className={`flex flex-col gap-2 p-4 rounded-xl border text-left transition-all ${
                  selected.emotion === e.emotion
                    ? 'bg-purple-600/10 border-purple-500/30'
                    : 'bg-white/5 border-transparent hover:border-white/5'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-extrabold text-slate-200">{e.emotion}</span>
                  <span className="text-xs font-black" style={{ color: e.color }}>{e.score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${e.score}%`, backgroundColor: e.color }} />
                </div>
              </button>
            ))}
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 mt-2 flex gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/15 border border-purple-500/20 text-purple-400 shrink-0 h-10 w-10 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-100 flex items-center gap-1">
                Active Insight: High {selected.emotion}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {selected.desc}. This represents a core driver in active feedback channels this week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
