import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, ArrowUpRight } from 'lucide-react';

const REGIONS = [
  { country: 'United States',  code: 'US', positive: 78, negative: 12, neutral: 10, total: 1420 },
  { country: 'United Kingdom',  code: 'GB', positive: 74, negative: 16, neutral: 10, total: 680 },
  { country: 'Germany',         code: 'DE', positive: 81, negative: 10, neutral: 9,  total: 410 },
  { country: 'Canada',          code: 'CA', positive: 70, negative: 18, neutral: 12, total: 390 },
  { country: 'Australia',       code: 'AU', positive: 85, negative: 8,  neutral: 7,  total: 350 },
  { country: 'India',           code: 'IN', positive: 65, negative: 22, neutral: 13, total: 280 },
  { country: 'Japan',           code: 'JP', positive: 89, negative: 5,  neutral: 6,  total: 190 },
];

export default function GeoAnalytics() {
  const topRegion = useMemo(() => {
    return REGIONS.reduce((max, r) => r.total > max.total ? r : max, REGIONS[0]);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <Globe className="w-5 h-5 text-sky-400" /> Geo Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1">Sentiment heatmap analysis mapped across countries and major markets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geo SVG map simulated */}
        <div className="card rounded-[18px] p-6 lg:col-span-1 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-slate-200">Global Coverage</h3>
          <div className="h-[240px] bg-slate-950/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* SVG Globe Outline */}
            <svg viewBox="0 0 100 100" className="w-32 h-32 text-indigo-500/10 absolute opacity-40">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M 5,50 Q 50,30 95,50" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <path d="M 5,50 Q 50,70 95,50" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <path d="M 50,5 Q 30,50 50,95" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <path d="M 50,5 Q 70,50 50,95" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.8" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.8" />
            </svg>
            <div className="relative flex flex-col items-center gap-2" style={{ zIndex: 'var(--z-sticky)' }}>
              <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-center text-sky-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-200">{topRegion.country}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{topRegion.total} analysis entries</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  {topRegion.positive}% Positive Sentiment
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Distribution Table */}
        <div className="card rounded-[18px] p-6 lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-slate-200">Regions Performance</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Total Feedback</th>
                  <th>Positive</th>
                  <th>Negative</th>
                  <th>Neutral</th>
                </tr>
              </thead>
              <tbody>
                {REGIONS.map((r, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-5 text-left text-[10px] font-black text-slate-500">{r.code}</span>
                      {r.country}
                    </td>
                    <td className="font-semibold text-slate-300">{r.total.toLocaleString()}</td>
                    <td className="text-emerald-400 font-extrabold">{r.positive}%</td>
                    <td className="text-rose-400 font-extrabold">{r.negative}%</td>
                    <td className="text-slate-400 font-medium">{r.neutral}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
