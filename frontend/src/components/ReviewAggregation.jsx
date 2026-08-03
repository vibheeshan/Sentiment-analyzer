import React, { useState } from 'react';
import { Star, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';

const PLATFORMS = {
  Ecommerce:      ['Amazon', 'eBay', 'Etsy', 'Walmart', 'Target'],
  'Local Business': ['Google', 'Yelp', 'TrustPilot', 'BBB', 'Zillow'],
  'SaaS/Software': ['G2', 'Capterra', 'Trustradius', 'LinkedIn', 'Glassdoor'],
};

const mockStats = { total: 1284, avgRating: 4.2, platforms: 14, dataPoints: 8920 };

const platformData = [
  { name: 'Google',     reviews: 412, rating: 4.5, momentum: '📈 Rising'  },
  { name: 'Amazon',     reviews: 318, rating: 4.1, momentum: '📊 Stable'  },
  { name: 'Yelp',       reviews: 214, rating: 3.8, momentum: '📉 Falling' },
  { name: 'TrustPilot', reviews: 187, rating: 4.3, momentum: '📈 Rising'  },
  { name: 'G2',         reviews: 153, rating: 4.6, momentum: '📈 Rising'  },
];

const suspiciousReviews = [
  { score: 87, flags: ['excessive_caps', 'repetition'], text: 'ABSOLUTELY AMAZING AMAZING AMAZING product! BEST EVER!! LOVE LOVE LOVE!!' },
  { score: 62, flags: ['short_length', 'generic'],      text: 'Good product. Works well.'                                                 },
];

const topReviews = [
  { rating: 5, title: 'Life-changing product!', text: 'I have tried many similar products but this one is truly exceptional. The build quality...', helpful: 248 },
  { rating: 5, title: 'Exceeded all expectations', text: 'Arrived in perfect condition, packaging was impressive. Customer service was top-notch...', helpful: 191 },
  { rating: 4, title: 'Great value for money',    text: 'Does exactly what it says on the tin. Minor gripe with setup instructions...', helpful: 142 },
];

export default function ReviewAggregation() {
  const [activeTab, setActiveTab] = useState('aggregate');
  const [selected, setSelected] = useState({});
  const [aggregated, setAggregated] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = (name) => setSelected(prev => ({ ...prev, [name]: !prev[name] }));

  const handleAggregate = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setAggregated(true); }, 1500);
  };

  const tabs = [
    { key: 'aggregate', label: '📥 Aggregate' },
    { key: 'analysis',  label: '🔍 Analysis' },
    { key: 'fake',      label: '⚠️ Fake Detection' },
    { key: 'highlights',label: '🏆 Highlights' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-ghost'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Aggregate */}
      {activeTab === 'aggregate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="anomaly-banner" style={{ background: 'rgba(14,165,233,0.08)', borderColor: 'rgba(14,165,233,0.25)' }}>
            <Globe /> Supported platforms: Google, Amazon, Yelp, TrustPilot, Facebook, Instagram, Glassdoor, Capterra, G2, and 40+ more!
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {Object.entries(PLATFORMS).map(([cat, items]) => (
              <div key={cat} className="card">
                <h4 style={{ fontWeight: '800', fontSize: '13px', color: 'var(--text-1)', marginBottom: '12px' }}>{cat}</h4>
                {items.map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '13px', cursor: 'pointer', color: 'var(--text-2)' }}>
                    <input type="checkbox" checked={!!selected[p]} onChange={() => toggle(p)} style={{ accentColor: 'var(--sky)' }} />
                    {p}
                  </label>
                ))}
              </div>
            ))}
          </div>
          <button onClick={handleAggregate} disabled={loading} className="btn btn-primary btn-lg">
            {loading ? <><RefreshCw className="nav-icon spin" /> Aggregating…</> : '🔄 Aggregate Reviews'}
          </button>
          {aggregated && (
            <div className="anomaly-banner" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' }}>
              ✅ Reviews aggregated from {Object.values(selected).filter(Boolean).length} selected platforms!
            </div>
          )}
        </div>
      )}

      {/* Analysis */}
      {activeTab === 'analysis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
            {[
              { label: 'Total Reviews',    value: mockStats.total },
              { label: 'Avg Rating',       value: `${mockStats.avgRating} ⭐` },
              { label: 'Active Platforms', value: mockStats.platforms },
              { label: 'Data Points',      value: mockStats.dataPoints.toLocaleString() },
            ].map((m, i) => (
              <div key={i} className="metric-card">
                <div className="metric-label">{m.label}</div>
                <div className="metric-value" style={{ fontSize: '22px', color: 'var(--sky)' }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h4 style={{ fontWeight: '800', marginBottom: '14px' }}>Performance by Platform</h4>
            <table className="data-table">
              <thead><tr><th>Platform</th><th>Reviews</th><th>Avg Rating</th><th>Momentum</th></tr></thead>
              <tbody>
                {platformData.map(p => (
                  <tr key={p.name}>
                    <td style={{ fontWeight: '700', color: 'var(--text-1)' }}>{p.name}</td>
                    <td>{p.reviews}</td>
                    <td><span style={{ color: 'var(--amber)', fontWeight: '800' }}>{'★'.repeat(Math.floor(p.rating))}</span> {p.rating}</td>
                    <td>{p.momentum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fake Detection */}
      {activeTab === 'fake' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="anomaly-banner">
            <ShieldAlert style={{ width: 20, height: 20 }} /> Detected <strong>{suspiciousReviews.length} potentially suspicious reviews</strong> ({((suspiciousReviews.length / mockStats.total) * 100).toFixed(1)}% of total)
          </div>
          {suspiciousReviews.map((r, i) => (
            <div key={i} className="card" style={{ borderLeft: `4px solid ${r.score >= 75 ? 'var(--red)' : 'var(--amber)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-1)' }}>Review #{i + 1}</strong>
                <span style={{ color: r.score >= 75 ? 'var(--red)' : 'var(--amber)', fontWeight: '700' }}>Suspicion: {r.score}%</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', margin: '0 0 8px' }}>{r.text}</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {r.flags.map(f => <span key={f} className="badge badge-red">{f.replace('_', ' ')}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Highlights */}
      {activeTab === 'highlights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '16px' }}>🏆 Top Positive Reviews</h3>
          {topReviews.map((r, i) => (
            <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--amber)', fontWeight: '800' }}>{'★'.repeat(r.rating)}</span>
                  <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-1)' }}>{r.title}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-2)', margin: 0 }}>{r.text}</p>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <div className="metric-label">Helpful</div>
                <div style={{ fontWeight: '800', color: 'var(--sky)', fontSize: '18px' }}>{r.helpful}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Globe(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
