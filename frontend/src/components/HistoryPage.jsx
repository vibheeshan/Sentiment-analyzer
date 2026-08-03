import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Target, TrendingUp, ArrowRight, Sparkles, ChevronLeft, ChevronRight, BarChart2, Trash2 } from 'lucide-react';

const PAGE_SIZE = 8;

// ── Skeleton row ────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-t border-white/5 animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 rounded-full bg-white/8" style={{ width: `${[70, 50, 30, 35, 35, 35, 45][i]}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ── Stat card ───────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = 'text-purple-400', bg = 'bg-purple-500/10', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="card p-5 rounded-[18px] flex items-center justify-between gap-4 border border-white/8 hover:border-purple-500/20 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(124,58,237,0.10)]"
    >
      <div>
        <div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400 mb-2">{label}</div>
        <div className="text-2xl font-black text-slate-100">{value}</div>
      </div>
      <div className={`w-11 h-11 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
    </motion.div>
  );
}

// ── Badge ───────────────────────────────────────────────────────────────────────
function SentimentBadge({ value, type }) {
  const config = {
    positive: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    negative: 'bg-red-500/15 text-red-400 border-red-500/25',
    confidence: 'bg-slate-500/15 text-slate-300 border-white/10',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${config[type]}`}>
      {value}
    </span>
  );
}

// ── Pagination ──────────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  const pageNums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-between pt-4 border-t border-white/5">
      <span className="text-[11px] text-slate-500 font-medium">
        Showing {Math.min((current - 1) * PAGE_SIZE + 1, total)}–{Math.min(current * PAGE_SIZE, total)} of {total}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/8 text-slate-400 hover:text-slate-200 hover:border-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pageNums.map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all ${
              n === current
                ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-sm'
                : 'border border-white/8 text-slate-400 hover:text-slate-200 hover:border-purple-500/30'
            }`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => onChange(current + 1)}
          disabled={current === pages}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/8 text-slate-400 hover:text-slate-200 hover:border-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────────
export default function HistoryPage({ analyses = [], onInspect, loading = false }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const filtered = analyses
    .filter(a => a.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'newest')   return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest')   return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'positive') return (b.positive_count / Math.max(1, b.total_entries)) - (a.positive_count / Math.max(1, a.total_entries));
      return b.total_entries - a.total_entries;
    });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avgPositive = analyses.length
    ? (analyses.reduce((s, a) => s + (a.positive_count / Math.max(1, a.total_entries)), 0) / analyses.length * 100).toFixed(1)
    : '0.0';

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Analyses" value={analyses.length} icon={<Clock className="w-5 h-5" />} delay={0} />
        <StatCard label="Total Entries" value={analyses.reduce((s, a) => s + (a.total_entries || 0), 0).toLocaleString()} icon={<Target className="w-5 h-5" />} delay={0.05} bg="bg-sky-500/10" color="text-sky-400" />
        <StatCard label="Avg Positive %" value={`${avgPositive}%`} icon={<TrendingUp className="w-5 h-5" />} delay={0.10} bg="bg-emerald-500/10" color="text-emerald-400" />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-0 max-w-[400px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="input h-[46px] w-full pl-10 pr-4 text-sm"
            placeholder="Search campaigns…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        {/* Sort */}
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 whitespace-nowrap">Sort by</label>
          <select
            className="input h-[46px] w-[190px] text-sm cursor-pointer"
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1); }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="positive">Highest Positive</option>
            <option value="entries">Most Entries</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="card overflow-hidden rounded-[18px] border border-white/8 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/4">
                <tr>
                  {['Campaign', 'Created', 'Entries', 'Positive', 'Negative', 'Confidence', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left">
                      <div className="h-2.5 w-16 rounded-full bg-white/10 animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-14 text-center rounded-[18px] border border-white/8"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-200 mb-1">No campaigns found</p>
          <p className="text-xs text-slate-500">
            {search ? `No results for "${search}" — try a different term.` : 'Run your first analysis to populate history here.'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden rounded-[18px] border border-white/8 p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#0b0f19]/90 backdrop-blur-sm border-b border-white/8" style={{ zIndex: 'var(--z-sticky)' }}>
                <tr>
                  <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-500">Campaign</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-500">Created</th>
                  <th className="px-5 py-3.5 text-right text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-500">Entries</th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-500">Positive</th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-500">Negative</th>
                  <th className="px-5 py-3.5 text-right text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-500">Confidence</th>
                  <th className="px-5 py-3.5 text-right text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginated.map((a, idx) => {
                    const pos = ((a.positive_count / Math.max(1, a.total_entries)) * 100).toFixed(1);
                    const neg = ((a.negative_count / Math.max(1, a.total_entries)) * 100).toFixed(1);
                    return (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-t border-white/5 hover:bg-purple-500/5 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
                              <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
                            </div>
                            <span className="font-semibold text-slate-100 truncate max-w-[200px]">{a.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                          {a.created_at ? new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-semibold text-slate-300">{a.total_entries?.toLocaleString()}</td>
                        <td className="px-5 py-4 text-center">
                          <SentimentBadge value={`${pos}%`} type="positive" />
                        </td>
                        <td className="px-5 py-4 text-center">
                          <SentimentBadge value={`${neg}%`} type="negative" />
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-xs font-bold text-slate-400">
                          {a.avg_confidence != null ? `${a.avg_confidence.toFixed(1)}%` : '—'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => onInspect && onInspect(a.id)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 transition-all hover:border-purple-500/40 hover:text-purple-300 hover:bg-purple-500/8 hover:shadow-[0_0_12px_rgba(124,58,237,0.15)] group-hover:scale-105"
                          >
                            Inspect <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 pb-5 pt-3">
            <Pagination current={page} total={filtered.length} onChange={setPage} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
