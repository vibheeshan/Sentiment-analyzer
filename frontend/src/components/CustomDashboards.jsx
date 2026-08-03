import React, { useState } from 'react';
import { Plus, Trash2, LayoutGrid, Eye } from 'lucide-react';

const WIDGET_OPTIONS = [
  { key: 'sentiment_pie',      label: 'Sentiment Pie Chart',   icon: '📊' },
  { key: 'emotion_bar',        label: 'Emotion Breakdown',     icon: '🎭' },
  { key: 'complaint_bar',      label: 'Complaint Categories',  icon: '⚠️' },
  { key: 'confidence_gauge',   label: 'Confidence Gauge',      icon: '⭐' },
  { key: 'keyword_cloud',      label: 'Keyword Cloud',         icon: '☁️' },
  { key: 'quality_score',      label: 'Review Quality Score',  icon: '🔍' },
  { key: 'trend_line',         label: 'Trend Line',            icon: '📈' },
  { key: 'top_reviews',        label: 'Top Reviews Table',     icon: '📝' },
];

const PRESETS = [
  {
    name: 'Executive Dashboard',
    layout: '2-column',
    theme: 'default',
    widgets: ['sentiment_pie', 'confidence_gauge', 'trend_line', 'top_reviews'],
    icon: '📊',
  },
  {
    name: 'Detailed Analytics',
    layout: '3-column',
    theme: 'vibrant',
    widgets: ['sentiment_pie', 'emotion_bar', 'complaint_bar', 'confidence_gauge', 'keyword_cloud', 'quality_score'],
    icon: '📈',
  },
];

export default function CustomDashboards() {
  const [showCreate, setShowCreate] = useState(false);
  const [dashName, setDashName] = useState('');
  const [layout, setLayout] = useState('2-column');
  const [theme, setTheme] = useState('default');
  const [selectedWidgets, setSelectedWidgets] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loaded, setLoaded] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const toggleWidget = (key) => {
    setSelectedWidgets(prev => prev.includes(key) ? prev.filter(w => w !== key) : [...prev, key]);
  };

  const saveDashboard = (name, lyt, thm, widgets) => {
    if (!name) return;
    setSaved(prev => [...prev, { id: Date.now(), name, layout: lyt, theme: thm, widgets }]);
    showToast(`✅ Dashboard "${name}" saved!`);
    setDashName(''); setSelectedWidgets([]); setShowCreate(false);
  };

  const deleteDashboard = (id) => setSaved(prev => prev.filter(d => d.id !== id));
  const numCols = (l) => l === '3-column' ? 3 : l === 'single' ? 1 : 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div className="anomaly-banner" style={{ background: 'rgba(16,185,129,0.10)', borderColor: 'rgba(16,185,129,0.3)' }}>{toast}</div>
      )}

      {/* Create Panel */}
      <div className="card">
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary" style={{ marginBottom: showCreate ? '20px' : 0 }}>
          <Plus className="nav-icon" /> {showCreate ? 'Cancel' : 'Create New Dashboard'}
        </button>
        {showCreate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label className="metric-label" style={{ display: 'block', marginBottom: '6px' }}>Dashboard Name</label>
                <input className="input" value={dashName} onChange={e => setDashName(e.target.value)} placeholder="e.g. Executive Summary Q3" />
              </div>
              <div>
                <label className="metric-label" style={{ display: 'block', marginBottom: '6px' }}>Layout</label>
                <select className="input" value={layout} onChange={e => setLayout(e.target.value)}>
                  {['2-column', '3-column', 'single'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="metric-label" style={{ display: 'block', marginBottom: '6px' }}>Theme</label>
                <select className="input" value={theme} onChange={e => setTheme(e.target.value)}>
                  {['default', 'dark', 'minimal', 'vibrant'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="metric-label" style={{ display: 'block', marginBottom: '10px' }}>Select Widgets</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                {WIDGET_OPTIONS.map(w => (
                  <label key={w.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: `1px solid ${selectedWidgets.includes(w.key) ? 'var(--sky)' : 'var(--border)'}`, background: selectedWidgets.includes(w.key) ? 'rgba(14,165,233,0.10)' : 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: 'var(--text-2)', transition: 'all .15s' }}>
                    <input type="checkbox" checked={selectedWidgets.includes(w.key)} onChange={() => toggleWidget(w.key)} style={{ accentColor: 'var(--sky)' }} />
                    <span>{w.icon}</span> {w.label}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={() => saveDashboard(dashName, layout, theme, selectedWidgets)} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              💾 Save Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Saved Dashboards */}
      <div>
        <h3 style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>📁 Your Dashboards</h3>
        {saved.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>No saved dashboards yet. Create one above!</div>
        ) : saved.map(d => (
          <div key={d.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-1)' }}>{d.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>Layout: {d.layout} · {d.widgets.length} widget(s) · Theme: {d.theme}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setLoaded(d)} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: '12px' }}><Eye className="nav-icon" /> Load</button>
              <button onClick={() => deleteDashboard(d.id)} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: '12px', color: 'var(--red)' }}><Trash2 className="nav-icon" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Loaded Preview */}
      {loaded && (
        <div>
          <h3 style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>👁️ Preview: {loaded.name}</h3>
          {loaded.widgets.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-3)' }}>No widgets selected for this dashboard.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols(loaded.layout)},1fr)`, gap: '14px' }}>
              {loaded.widgets.map(wk => {
                const w = WIDGET_OPTIONS.find(o => o.key === wk);
                return (
                  <div key={wk} className="card-sm" style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{w?.icon}</div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-1)' }}>{w?.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>Run an analysis to populate</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Presets */}
      <div>
        <h3 style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>🎨 Dashboard Presets</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}>
          {PRESETS.map(p => (
            <div key={p.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '28px' }}>{p.icon}</div>
              <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-1)' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{p.widgets.length} widgets · {p.layout} layout</div>
              <button onClick={() => { saveDashboard(p.name, p.layout, p.theme, p.widgets); }} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '7px 14px', fontSize: '12px' }}>
                <LayoutGrid className="nav-icon" /> Use Preset
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
