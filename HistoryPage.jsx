import React, { useState } from 'react';
import { Search, Clock, Target, TrendingUp } from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

export default function HistoryPage({ analyses, onInspect }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filtered = analyses
    .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'positive') return (b.positive_count / Math.max(1, b.total_entries)) - (a.positive_count / Math.max(1, a.total_entries));
      return b.total_entries - a.total_entries;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
        {[
          { label: 'Total Analyses',   value: analyses.length,                                                                         icon: <Clock className="nav-icon" /> },
          { label: 'Total Entries',    value: analyses.reduce((s, a) => s + (a.total_entries || 0), 0),                                icon: <Target className="nav-icon" /> },
          { label: 'Avg Positive %',   value: `${(analyses.reduce((s, a) => s + (a.positive_count / Math.max(1, a.total_entries)), 0) / Math.max(1, analyses.length) * 100).toFixed(1)}%`, icon: <TrendingUp className="nav-icon" /> },
        ].map((m, i) => (
          <div key={i} className="metric-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="metric-label">{m.label}</div>
              <div className="metric-value" style={{ fontSize: '22px', color: 'var(--sky)' }}>{m.value}</div>
            </div>
            <div style={{ color: 'var(--sky)' }}>{m.icon}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search className="nav-icon" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-3)' }} />
          <input className="input" style={{ paddingLeft: '38px' }} placeholder="Search analyses…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ maxWidth: '180px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="positive">Highest Positive</option>
          <option value="entries">Most Entries</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>
          📭 No analyses found. Run your first analysis to see history here.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Created</th>
                <th>Entries</th>
                <th>Positive %</th>
                <th>Negative %</th>
                <th>Confidence</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const pos = ((a.positive_count / Math.max(1, a.total_entries)) * 100).toFixed(1);
                const neg = ((a.negative_count / Math.max(1, a.total_entries)) * 100).toFixed(1);
                return (
                  <tr key={a.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-1)' }}>{a.name}</td>
                    <td style={{ fontSize: '11px' }}>{a.created_at?.slice(0, 10)}</td>
                    <td style={{ fontWeight: '600' }}>{a.total_entries}</td>
                    <td><span className="badge badge-emerald">{pos}%</span></td>
                    <td><span className="badge badge-red">{neg}%</span></td>
                    <td style={{ color: 'var(--text-2)', fontSize: '13px' }}>{a.avg_confidence?.toFixed(1) ?? '—'}%</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => onInspect && onInspect(a.id)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '11px' }}>
                        Inspect →
                      </button>
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
