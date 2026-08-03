import React, { useState } from 'react';
import { TrendingUp, Hash, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TRENDING = [
  { topic: 'Product Quality Concerns', keywords: ['quality', 'defect', 'broken'], score: 94, velocity: 'viral',    status: 'viral'    },
  { topic: 'Delivery Experience',       keywords: ['shipping', 'delay', 'fast'],   score: 78, velocity: 'high',     status: 'trending' },
  { topic: 'Customer Service Praise',   keywords: ['support', 'helpful', 'quick'], score: 61, velocity: 'medium',   status: 'trending' },
  { topic: 'Price Value Debate',        keywords: ['price', 'expensive', 'worth'], score: 48, velocity: 'low',      status: 'emerging' },
  { topic: 'New Feature Feedback',      keywords: ['feature', 'update', 'new'],    score: 32, velocity: 'low',      status: 'emerging' },
];

const CLUSTERS = [
  { primary: 'Logistics & Delivery', keywords: ['shipping', 'delay', 'packaging', 'tracking'], related: [{ topic: 'Returns Policy', similarity: 0.84 }, { topic: 'Courier Experience', similarity: 0.72 }] },
  { primary: 'Product Experience',   keywords: ['quality', 'durable', 'design', 'material'],   related: [{ topic: 'Manufacturing Defects', similarity: 0.79 }, { topic: 'Build Quality', similarity: 0.68 }] },
  { primary: 'Support Interactions', keywords: ['agent', 'chat', 'refund', 'resolve'],          related: [{ topic: 'Response Time', similarity: 0.88 }, { topic: 'Resolution Rate', similarity: 0.75 }] },
];

const evolutionData = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  mentions: Math.max(1, Math.round(10 + Math.sin(i * 0.4) * 8 + i * 0.8)),
}));

const statusIcon = { viral: '🚀', trending: '📈', emerging: '✨' };
const statusBadge = { viral: 'badge-red', trending: 'badge-sky', emerging: 'badge-emerald' };

export default function TopicDiscovery() {
  const [activeTab, setActiveTab] = useState('trending');
  const [expanded, setExpanded] = useState(null);
  const [topicSel, setTopicSel] = useState('Quality Issues');

  const tabs = [
    { key: 'trending',   label: '🔥 Trending Topics' },
    { key: 'clusters',   label: '📚 Topic Clusters' },
    { key: 'evolution',  label: '📈 Topic Evolution' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-ghost'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Trending */}
      {activeTab === 'trending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {TRENDING.map((t, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '22px', width: '28px', textAlign: 'center' }}>{statusIcon[t.status]}</span>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-1)' }}>{t.topic}</div>
                  <div style={{ marginTop: '4px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {t.keywords.map(k => <span key={k} className="badge badge-sky" style={{ fontSize: '10px' }}><Hash style={{ width: 10, height: 10 }} /> {k}</span>)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="metric-label">Score</div>
                  <div style={{ fontWeight: '900', color: 'var(--sky)' }}>{t.score}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="metric-label">Velocity</div>
                  <span className={`badge ${statusBadge[t.status]}`}>{t.velocity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clusters */}
      {activeTab === 'clusters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {CLUSTERS.map((cluster, i) => (
            <div key={i} className="card">
              <button onClick={() => setExpanded(expanded === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap className="nav-icon" style={{ color: 'var(--sky)' }} />
                  <span style={{ fontWeight: '800', fontSize: '14px' }}>Cluster: {cluster.primary}</span>
                </div>
                <span style={{ color: 'var(--text-3)' }}>{expanded === i ? '▲' : '▼'}</span>
              </button>
              {expanded === i && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div className="metric-label" style={{ marginBottom: '6px' }}>Primary Keywords</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {cluster.keywords.map(k => <span key={k} className="badge badge-indigo">{k}</span>)}
                    </div>
                  </div>
                  <div>
                    <div className="metric-label" style={{ marginBottom: '6px' }}>Related Topics</div>
                    {cluster.related.map(r => (
                      <div key={r.topic} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-2)' }}>{r.topic}</span>
                        <span style={{ color: 'var(--sky)', fontWeight: '700' }}>Similarity: {(r.similarity * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Evolution */}
      {activeTab === 'evolution' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select className="input" style={{ maxWidth: '260px' }} value={topicSel} onChange={e => setTopicSel(e.target.value)}>
              {['Quality Issues', 'Delivery Problems', 'Customer Service', 'Price Concerns'].map(o => <option key={o}>{o}</option>)}
            </select>
            <select className="input" style={{ maxWidth: '140px' }}>
              {['7 Days', '30 Days', '90 Days'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="card" style={{ height: '360px' }}>
            <h4 style={{ fontWeight: '800', marginBottom: '12px' }}>Evolution of "{topicSel}"</h4>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={evolutionData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }} />
                <Line type="monotone" dataKey="mentions" stroke="var(--sky)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
