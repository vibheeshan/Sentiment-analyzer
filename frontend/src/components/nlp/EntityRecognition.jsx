import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import {
  Crosshair, Search, Tag, Server, Shield, User, Globe, AlertTriangle
} from 'lucide-react';

const ENTITY_TYPES = [
  { type: 'PRODUCT',     label: 'Product',     color: '#0ea5e9', icon: Server },
  { type: 'BRAND',       label: 'Brand',       color: '#a78bfa', icon: Tag },
  { type: 'COMPETITOR',  label: 'Competitor',  color: '#ef4444', icon: AlertTriangle },
  { type: 'LOCATION',    label: 'Location',    color: '#10b981', icon: Globe },
  { type: 'ORGANIZATION',label: 'Organization',color: '#f59e0b', icon: Shield },
  { type: 'PERSON',      label: 'Person',      color: '#f43f5e', icon: User },
];

const MOCK_ENTITIES = [
  { text: 'BrandPulse Pro', type: 'PRODUCT',      mentions: 142, sentiment: 82, trend: +12 },
  { text: 'Salesforce',    type: 'COMPETITOR',   mentions: 89,  sentiment: 41, trend: -5 },
  { text: 'HubSpot',       type: 'COMPETITOR',   mentions: 74,  sentiment: 48, trend: +3 },
  { text: 'Enterprise OS',  type: 'PRODUCT',      mentions: 65,  sentiment: 76, trend: +8 },
  { text: 'New York Office',type: 'LOCATION',     mentions: 54,  sentiment: 65, trend: +2 },
  { text: 'Microsoft',     type: 'ORGANIZATION', mentions: 48,  sentiment: 70, trend: +1 },
  { text: 'CEO Satya',     type: 'PERSON',       mentions: 39,  sentiment: 85, trend: +14 },
  { text: 'London Hub',    type: 'LOCATION',     mentions: 31,  sentiment: 58, trend: -2 },
  { text: 'BrandPulse Lite',type: 'PRODUCT',      mentions: 29,  sentiment: 69, trend: -4 },
];

export default function EntityRecognition() {
  const [filterType, setFilterType] = useState('ALL');
  const [search,     setSearch]     = useState('');

  const filteredEntities = useMemo(() => {
    return MOCK_ENTITIES.filter(e => {
      const matchType = filterType === 'ALL' || e.type === filterType;
      const matchSearch = e.text.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [filterType, search]);

  const chartData = useMemo(() => {
    return MOCK_ENTITIES.slice(0, 6).map(e => ({
      name: e.text,
      mentions: e.mentions,
      color: ENTITY_TYPES.find(t => t.type === e.type)?.color || '#94a3b8'
    }));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-indigo-400" /> Named Entity Recognition (NER)
        </h2>
        <p className="text-xs text-slate-400 mt-1">Automatic detection of brands, key people, competitors, and products</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity chart */}
        <div className="card rounded-[18px] p-6 lg:col-span-1 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-slate-200">Top Entities by Mentions</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 10 }}>
                <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fontSize: 10, fontWeight: 700 }} width={70} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <Bar dataKey="mentions" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Entities Table / Filter */}
        <div className="card rounded-[18px] p-6 lg:col-span-2 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-white/5 rounded-xl px-3 py-1.5 w-full sm:max-w-[240px]">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search entities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  filterType === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'
                }`}
              >
                All
              </button>
              {ENTITY_TYPES.map(t => (
                <button
                  key={t.type}
                  onClick={() => setFilterType(t.type)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    filterType === t.type ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entity</th>
                  <th>Category</th>
                  <th>Mentions</th>
                  <th>Sentiment</th>
                  <th>Weekly Change</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntities.map((e, idx) => {
                  const tag = ENTITY_TYPES.find(t => t.type === e.type);
                  const TagIcon = tag?.icon || Tag;
                  return (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="font-bold text-slate-200">{e.text}</td>
                      <td>
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: `${tag?.color}15`, color: tag?.color, border: `1px solid ${tag?.color}25` }}
                        >
                          <TagIcon className="w-3 h-3" />
                          {tag?.label}
                        </span>
                      </td>
                      <td className="font-semibold text-slate-300">{e.mentions}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${e.sentiment}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-emerald-400">{e.sentiment}%</span>
                        </div>
                      </td>
                      <td className={`font-extrabold text-xs ${e.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {e.trend >= 0 ? '+' : ''}{e.trend}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
