import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Bell, AlertTriangle, CheckCircle, Plus, Zap } from 'lucide-react';

export default function RealtimeMonitor() {
  const [activeTab, setActiveTab] = useState('live');
  const [ruleName, setRuleName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [threshold, setThreshold] = useState(10);
  const [alertType, setAlertType] = useState('Notification');
  const [ruleAdded, setRuleAdded] = useState(false);

  const crisisScore = 22;
  const crisisStatus = crisisScore < 30 ? '🟢 Normal' : crisisScore < 60 ? '🟡 Elevated' : '🔴 Critical';
  const crisisTrend  = crisisScore < 20 ? '📈 Improving' : crisisScore < 50 ? '📊 Stable' : '📉 Worsening';

  const mockAlerts = [
    { id: 1, type: 'Sentiment Drop', severity: 'critical', message: 'Negative sentiment spiked 34% in the last hour', time: '2 min ago' },
    { id: 2, type: 'Keyword Alert', severity: 'high',     message: '"defect" mentioned 14 times across reviews', time: '18 min ago' },
    { id: 3, type: 'Volume Spike',  severity: 'medium',   message: 'Review volume increased 3x above baseline', time: '1 hr ago' },
  ];

  const sevColor = { critical: 'var(--red)', high: 'var(--amber)', medium: 'var(--sky)', low: 'var(--emerald)' };
  const sevIcon  = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };

  const tabs = [
    { key: 'live',   label: '📊 Live Monitor' },
    { key: 'alerts', label: '⚠️ Active Alerts' },
    { key: 'crisis', label: '🚨 Crisis Detection' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
        {[
          { label: 'Crisis Level', value: 'NORMAL', color: 'var(--emerald)', icon: <CheckCircle className="nav-icon" /> },
          { label: 'Total Monitored', value: '2,841', color: 'var(--sky)', icon: <Activity className="nav-icon" /> },
          { label: 'Recent Mentions', value: '+47', color: 'var(--amber)', icon: <Bell className="nav-icon" /> },
          { label: 'Active Keywords', value: '12', color: 'var(--indigo)', icon: <Zap className="nav-icon" /> },
        ].map((m, i) => (
          <motion.div key={i} whileHover={{ y: -3 }} className="metric-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="metric-label">{m.label}</div>
              <div className="metric-value" style={{ color: m.color, fontSize: '24px' }}>{m.value}</div>
            </div>
            <div className="metric-icon" style={{ background: `${m.color}18` , color: m.color }}>{m.icon}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: '12px 12px 0 0', padding: '9px 18px' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Live Monitor Tab */}
      {activeTab === 'live' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '16px' }}>Add Monitoring Rule</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="metric-label" style={{ display: 'block', marginBottom: '6px' }}>Rule Name</label>
              <input className="input" value={ruleName} onChange={e => setRuleName(e.target.value)} placeholder="e.g. Quality Issues" />
            </div>
            <div>
              <label className="metric-label" style={{ display: 'block', marginBottom: '6px' }}>Keyword to Monitor</label>
              <input className="input" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. defect" />
            </div>
            <div>
              <label className="metric-label" style={{ display: 'block', marginBottom: '6px' }}>Alert Threshold: {threshold} mentions</label>
              <input type="range" min="1" max="50" value={threshold} onChange={e => setThreshold(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--sky)' }} />
            </div>
            <div>
              <label className="metric-label" style={{ display: 'block', marginBottom: '6px' }}>Alert Type</label>
              <select className="input" value={alertType} onChange={e => setAlertType(e.target.value)}>
                {['Email', 'Notification', 'Both'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => { setRuleAdded(true); setTimeout(() => setRuleAdded(false), 3000); }} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Plus className="nav-icon" /> Add Rule
          </button>
          {ruleAdded && <div className="anomaly-banner" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' }}>
            ✅ Monitoring rule <strong>"{ruleName || 'New Rule'}"</strong> added! Will alert when "{keyword || 'keyword'}" exceeds {threshold} mentions.
          </div>}
        </div>
      )}

      {/* Active Alerts Tab */}
      {activeTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockAlerts.map(alert => (
            <div key={alert.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${sevColor[alert.severity]}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>{sevIcon[alert.severity]}</span>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-1)' }}>{alert.type.toUpperCase()}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '2px' }}>{alert.message}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-sky">{alert.severity}</span>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>{alert.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crisis Detection Tab */}
      {activeTab === 'crisis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {[
              { label: 'Crisis Score', value: `${crisisScore}/100` },
              { label: 'Status', value: crisisStatus },
              { label: 'Trend', value: crisisTrend },
            ].map((m, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div className="metric-label">{m.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '8px' }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h4 style={{ fontWeight: '800', marginBottom: '12px', color: 'var(--text-1)' }}>🚨 Crisis Triggers Monitored</h4>
            {[
              ['Viral Negativity', '> 80% negative sentiment in short timeframe'],
              ['Quality Issues', 'Multiple product defect complaints'],
              ['Service Crisis', 'Customer service complaints rising'],
              ['Safety Concerns', 'Safety-related mentions detected'],
            ].map(([title, desc], i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                <AlertTriangle className="nav-icon" style={{ color: 'var(--amber)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-1)' }}>{title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
