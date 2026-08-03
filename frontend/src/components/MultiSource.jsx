import React, { useState } from 'react';
import { Search, Globe, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SOURCES = {
  'Social Media': ['Twitter/X', 'Reddit', 'Instagram', 'Facebook', 'TikTok', 'LinkedIn'],
  'News & Content': ['News APIs', 'Blogs', 'Forums', 'YouTube', 'Podcasts', 'Aggregators'],
  'Reviews': ['Google', 'Amazon', 'Yelp', 'TrustPilot', 'G2', 'Capterra'],
  'Professional': ['Glassdoor', 'LinkedIn', 'Indeed', 'AngelList', 'Crunchbase', 'Bloomberg'],
};

const comparisonData = [
  { source: 'Twitter', mentions: 1240, fill: '#0ea5e9' },
  { source: 'Reddit',  mentions: 870,  fill: '#6366f1' },
  { source: 'News',    mentions: 640,  fill: '#10b981' },
  { source: 'Google',  mentions: 540,  fill: '#f59e0b' },
  { source: 'Amazon',  mentions: 380,  fill: '#ef4444' },
  { source: 'Yelp',    mentions: 210,  fill: '#a855f7' },
];

export default function MultiSource() {
  const [activeTab, setActiveTab] = useState('sources');
  const [searchKw, setSearchKw] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  const handleSearch = () => {
    if (!searchKw) return;
    setSearching(true);
    setTimeout(() => { setSearching(false); setSearchDone(true); }, 1500);
  };

  const tabs = [
    { key: 'sources',    label: '📡 Sources' },
    { key: 'search',     label: '🔍 Search' },
    { key: 'comparison', label: '📊 Comparison' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
        {[
          { label: 'Total Sources', value: '50+' },
          { label: 'Active Sources', value: '24' },
          { label: 'Data Points', value: '128K' },
          { label: 'Last Sync', value: '3 min ago' },
        ].map((m, i) => (
          <div key={i} className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value" style={{ fontSize: '22px', color: 'var(--sky)' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-ghost'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Sources Tab */}
      {activeTab === 'sources' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}>
          {Object.entries(SOURCES).map(([category, items]) => (
            <div key={category} className="card">
              <h4 style={{ fontWeight: '800', color: 'var(--sky)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe className="nav-icon" /> {category}
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {items.map(item => (
                  <span key={item} className="badge badge-sky">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input className="input" style={{ flex: 1 }} placeholder="e.g. brand name, product" value={searchKw} onChange={e => setSearchKw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch} className="btn btn-primary" disabled={searching}>
              {searching ? <span className="spin" style={{ width: 16, height: 16, border: '2px solid #000', borderTop: '2px solid transparent', borderRadius: '50%', display: 'inline-block' }} /> : <Search className="nav-icon" />}
              {searching ? 'Searching…' : 'Search'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {['Twitter/X', 'Reddit', 'News', 'Google'].map(src => (
              <label key={src} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--text-2)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--sky)' }} /> {src}
              </label>
            ))}
          </div>
          {searchDone && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="badge badge-emerald" style={{ alignSelf: 'flex-start' }}>✅ Found 47 results for "{searchKw}"</div>
              {[
                { title: `"${searchKw}" trending on Reddit`, src: 'Reddit', date: 'Today', text: 'Multiple discussions about recent product experience...' },
                { title: `News: ${searchKw} brand coverage`, src: 'News API', date: 'Yesterday', text: 'Major publications covering latest brand updates...' },
                { title: `${searchKw} review spike`, src: 'Twitter/X', date: '2 days ago', text: 'Viral thread with mixed sentiment feedback...' },
              ].map((r, i) => (
                <div key={i} className="card-sm" style={{ borderLeft: '3px solid var(--sky)' }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-1)' }}>{r.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>Source: {r.src} | {r.date}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '6px' }}>{r.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="card" style={{ height: '380px' }}>
          <h4 style={{ fontWeight: '800', marginBottom: '16px' }}>Data Distribution Across Sources</h4>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={comparisonData}>
              <XAxis dataKey="source" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }} />
              <Bar dataKey="mentions" radius={[6, 6, 0, 0]}>
                {comparisonData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
