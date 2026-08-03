import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, HelpCircle, Activity, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import BrandHealthScore from './components/BrandHealthScore';
import HeatmapCalendar from './components/HeatmapCalendar';
import AnomalyBanner from './components/AnomalyBanner';

// Lazy-loaded NLP Analytics components (code-split per tab)
const IntentAnalysis = React.lazy(() => import('./components/nlp/IntentAnalysis'));
const EntityRecognition = React.lazy(() => import('./components/nlp/EntityRecognition'));
const EmotionDetection = React.lazy(() => import('./components/nlp/EmotionDetection'));
const KeywordAnalytics = React.lazy(() => import('./components/nlp/KeywordAnalytics'));
const GeoAnalytics = React.lazy(() => import('./components/nlp/GeoAnalytics'));
const AIInsights = React.lazy(() => import('./components/nlp/AIInsights'));

// Layouts (always needed)
import Sidebar from './layouts/Sidebar';
import DashboardLayout from './layouts/DashboardLayout';
import { ThemeProvider } from './context/ThemeProvider';

// Lazy-loaded Pages (code-split per tab)
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Analyze = React.lazy(() => import('./pages/Analyze'));
const Advanced = React.lazy(() => import('./pages/Advanced'));
const Export = React.lazy(() => import('./pages/Export'));
import Login from './pages/Login';
import Signup from './pages/Signup';
const VisualAnalysis = React.lazy(() => import('./pages/VisualAnalysis'));

// Lazy-loaded legacy components (code-split per tab)
const ChatBot = React.lazy(() => import('./components/ChatBot'));
const RealtimeMonitor = React.lazy(() => import('./components/RealtimeMonitor'));
const MultiSource = React.lazy(() => import('./components/MultiSource'));
const TopicDiscovery = React.lazy(() => import('./components/TopicDiscovery'));
const CustomDashboards = React.lazy(() => import('./components/CustomDashboards'));
const ReviewAggregation = React.lazy(() => import('./components/ReviewAggregation'));
const HistoryPage = React.lazy(() => import('./components/HistoryPage'));
const SettingsPage = React.lazy(() => import('./components/SettingsPage'));

// API Service
import { apiService } from './services/api';

// Suspense fallback spinner
const TabLoader = () => (
  <div className="flex items-center justify-center py-24">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
      <span className="text-sm font-semibold text-slate-400">Loading module…</span>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analyses, setAnalyses]   = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [alerts, setAlerts]       = useState([]);
  const [healthData, setHealthData] = useState({ score: 84, label: 'Good' });
  const [loading, setLoading]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [alertTab, setAlertTab]   = useState('inbox');      // inner alerts tab
  const [absaData, setAbsaData]   = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [forecastDays, setForecastDays] = useState(7);
  const [benchmarkData, setBenchmarkData] = useState([]);
  const [alertFilter, setAlertFilter]   = useState('All');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (activeTab !== 'absa' && activeTab !== 'forecast') return;

    const idToUse = selectedId || analyses[0]?.id;
    if (!idToUse) return;

    if (activeTab === 'absa') fetchABSA(idToUse);
    if (activeTab === 'forecast') fetchForecast(idToUse, forecastDays);
  }, [selectedId, activeTab, forecastDays, analyses]);

  const fetchAll = async () => {
    await Promise.all([fetchAnalyses(), fetchAlerts(), fetchHealthScore()]);
  };

  useEffect(() => {
    if (!userSession) return;
    fetchAll();
  }, [userSession]);

  const fetchHealthScore = async () => {
    try {
      const data = await apiService.getHealthScore(userSession?.userId || 1);
      setHealthData(data);
    } catch {}
  };

  const fetchAnalyses = async () => {
    try {
      const data = await apiService.getAnalyses(userSession?.userId || 1);
      setAnalyses(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch {}
  };

  const fetchAlerts = async () => {
    try {
      const data = await apiService.getAlerts(userSession?.userId || 1);
      setAlerts(data);
    } catch {}
  };

  const fetchABSA = async (id) => {
    try {
      const data = await apiService.getABSA(id);
      setAbsaData(data);
    } catch {}
  };

  const fetchForecast = async (id, days) => {
    try {
      const data = await apiService.getForecast(id, days);
      setForecastData(data);
    } catch {}
  };

  const handleRunAnalysis = async (name, texts) => {
    setLoading(true);
    try {
      const resp = await apiService.createAnalysis(userSession?.userId || 1, name, texts);
      await fetchAll();
      setActiveTab('dashboard');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      return resp;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleBenchmark = async () => {
    const ids = analyses.slice(0, 2).map(a => a.id);
    if (ids.length < 2) return;
    try {
      const data = await apiService.benchmark(ids);
      setBenchmarkData(data);
    } catch {}
  };

  const handleLogin = (session) => {
    setUserSession(session);
    setAuthMode('login');
    setActiveTab('dashboard');
  };

  const handleSignup = (session) => {
    setUserSession(session);
    setAuthMode('login');
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUserSession(null);
    setAuthMode('login');
    setAnalyses([]);
    setAlerts([]);
    setAbsaData(null);
  };

  const handleShare = async () => {
    const id = selectedId || (analyses.length > 0 ? analyses[0].id : null);
    try {
      if (id) {
        const data = await apiService.generateShareLink(id);
        return data.share_url || data.share_link || `${window.location.origin}/share/${id}`;
      }
      return `${window.location.origin}/share/${Math.random().toString(36).substr(2, 8)}`;
    } catch {
      return `${window.location.origin}/share/${Math.random().toString(36).substr(2, 8)}`;
    }
  };

  const handleInspectForecast = () => {
    const fallbackId = analyses[0]?.id;
    if (fallbackId) {
      setSelectedId(fallbackId);
    }
    setActiveTab('forecast');
  };

  const exportCsv = () => {
    const hdrs = 'Name,Date,Entries,Positive,Negative,Neutral\n';
    const rows = analyses.map(a => `"${a.name}",${a.created_at},${a.total_entries},${a.positive_count},${a.negative_count},${a.neutral_count}`).join('\n');
    const blob = new Blob([hdrs + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'BrandPulse_Report.csv' }).click();
  };

  const unread = alerts.filter(a => a.status === 'unread').length;
  const filteredAnalyses = analyses.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!userSession) {
    return (
      <ThemeProvider>
        <div className="auth-shell">
          {authMode === 'login' ? (
            <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthMode('signup')} />
          ) : (
            <Signup onSignup={handleSignup} onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="app-shell">
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          unreadCount={unread} 
          onLogout={handleLogout}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        {/* Main content shell */}
        <DashboardLayout
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onShare={handleShare}
          onExportCsv={exportCsv}
          onMenuToggle={() => setIsMobileOpen(true)}
        >
          <Suspense fallback={<TabLoader />}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.2 }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Dashboard tab */}
              {activeTab === 'dashboard' && (
                <Dashboard
                  analyses={filteredAnalyses}
                  healthData={healthData}
                  forecastData={forecastData}
                  onInspectCampaign={(id) => { setSelectedId(id); setActiveTab('absa'); }}
                  onInspectForecast={handleInspectForecast}
                />
              )}

              {/* Run Analysis tab */}
              {activeTab === 'analyze' && (
                <Analyze onRunAnalysis={handleRunAnalysis} />
              )}

              {/* NLP Analytics Tabs */}
              {activeTab === 'intent' && (
                <div className="card rounded-[18px] p-6">
                  <IntentAnalysis analyses={analyses} />
                </div>
              )}
              {activeTab === 'ner' && (
                <div className="card rounded-[18px] p-6">
                  <EntityRecognition />
                </div>
              )}
              {activeTab === 'emotions' && (
                <div className="card rounded-[18px] p-6">
                  <EmotionDetection />
                </div>
              )}
              {activeTab === 'keywords' && (
                <div className="card rounded-[18px] p-6">
                  <KeywordAnalytics />
                </div>
              )}
              {activeTab === 'geo' && (
                <div className="card rounded-[18px] p-6">
                  <GeoAnalytics />
                </div>
              )}
              {activeTab === 'ai-insights' && (
                <div className="card rounded-[18px] p-6">
                  <AIInsights />
                </div>
              )}

              {/* Advanced Analytics tab */}
              {activeTab === 'advanced' && (
                <Advanced analyses={analyses} />
              )}

              {/* Export Page tab */}
              {activeTab === 'export' && (
                <Export analyses={analyses} activeBrand="Nike Inc." />
              )}

              {/* History tab */}
              {activeTab === 'history' && (
                <HistoryPage analyses={analyses} onInspect={(id) => { setSelectedId(id); setActiveTab('absa'); }} />
              )}

              {/* Alerts & Rules tab */}
              {activeTab === 'alerts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[{ key: 'inbox', label: '📥 Alert Inbox' }, { key: 'thresholds', label: '⚙️ Thresholds' }, { key: 'test', label: '🧪 Test Alert' }].map(t => (
                      <button key={t.key} onClick={() => setAlertTab(t.key)} className={`btn ${alertTab === t.key ? 'btn-primary' : 'btn-ghost'}`}>{t.label}</button>
                    ))}
                  </div>

                  {alertTab === 'inbox' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontWeight: '800', fontSize: '15px' }}>{unread > 0 ? `📬 ${unread} unread alerts` : '📭 All caught up!'}</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select className="input" style={{ padding: '7px 12px', fontSize: '12px', width: 'auto' }} value={alertFilter} onChange={e => setAlertFilter(e.target.value)}>
                            {['All', 'critical', 'warning', 'info', 'success'].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                      </div>
                      {(alertFilter === 'All' ? alerts : alerts.filter(a => a.severity === alertFilter)).map(a => (
                        <div key={a.id} className="card" style={{ display: 'flex', gap: '14px', borderLeft: `4px solid ${{ critical: 'var(--red)', warning: 'var(--amber)', info: 'var(--sky)', success: 'var(--emerald)' }[a.severity] || 'var(--border)'}` }}>
                          <AlertTriangle className="nav-icon" style={{ color: 'var(--amber)', marginTop: '2px', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--text-1)', textTransform: 'capitalize' }}>{a.alert_type?.replace(/_/g, ' ')}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '3px' }}>{a.message}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '4px' }}>{a.triggered_at?.slice(0, 19)}</div>
                          </div>
                          {a.status === 'unread' && <span className="badge badge-amber">NEW</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {alertTab === 'thresholds' && <SettingsPage userId={userSession?.userId || 1} />}
                  {alertTab === 'test' && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                      <h3 style={{ fontWeight: '800', fontSize: '15px' }}>🧪 Simulate Alert Rules</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Enter sample values to preview which alerts would be triggered.</p>
                      {[
                        { label: 'Total Reviews', placeholder: '100', type: 'number' },
                        { label: 'Positive Count', placeholder: '30', type: 'number' },
                        { label: 'Negative Count', placeholder: '65', type: 'number' },
                        { label: 'Avg Confidence %', placeholder: '72', type: 'number' },
                      ].map(f => (
                        <div key={f.label}>
                          <label className="metric-label" style={{ display: 'block', marginBottom: '5px' }}>{f.label}</label>
                          <input className="input" type={f.type} placeholder={f.placeholder} />
                        </div>
                      ))}
                      <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>▶️ Run Simulation</button>
                    </div>
                  )}
                </div>
              )}

              {/* Settings tab */}
              {activeTab === 'settings' && <SettingsPage userId={userSession?.userId || 1} />}

              {/* Real-time Monitor tab */}
              {activeTab === 'realtime' && <RealtimeMonitor />}

              {/* Multi Source Data tab */}
              {activeTab === 'multisource' && <MultiSource />}

              {/* Topic Discovery tab */}
              {activeTab === 'topics' && <TopicDiscovery />}

              {/* Custom Dashboards tab */}
              {activeTab === 'dashboards' && <CustomDashboards />}

              {/* Review Aggregation tab */}
              {activeTab === 'reviews' && <ReviewAggregation />}

              {/* Visual Analysis tab */}
              {activeTab === 'visual' && <VisualAnalysis />}

              {/* Aspect Sentiment (ABSA) tab */}
              {activeTab === 'absa' && (
                <div className="panel">
                  <div className="card flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Aspect-Based Sentiment (ABSA)</h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xl">Sentiment breakdown by product attribute: Price, Quality, Delivery, Support, Design, Performance</p>
                    </div>
                    <div className="w-full max-w-[220px]">
                      <select value={selectedId || ''} onChange={e => setSelectedId(Number(e.target.value))} className="input">
                        {analyses.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {absaData ? (
                    <>
                      {/* Metrics row */}
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {(() => {
                          const entries = Object.entries(absaData);
                          const active = entries.filter(([, d]) => d.mention_count > 0).length;
                          const total  = entries.reduce((s, [, d]) => s + d.mention_count, 0);
                          const best   = entries.sort(([, a], [, b]) => (b.Positive / Math.max(1, b.mention_count)) - (a.Positive / Math.max(1, a.mention_count)))[0];
                          const worst  = entries.sort(([, a], [, b]) => (b.Negative / Math.max(1, b.mention_count)) - (a.Negative / Math.max(1, a.mention_count)))[0];
                          return [
                            { label: 'Tracked Aspects',    value: `${active}/${entries.length}` },
                            { label: 'Total Mentions',     value: total },
                            { label: 'Top Rated',          value: best?.[0]?.replace('_', ' ') || '—' },
                            { label: 'Most Criticized',    value: worst?.[0]?.replace('_', ' ') || '—' },
                          ];
                        })().map((m, i) => (
                          <div key={i} className="metric-card">
                            <div className="metric-label">{m.label}</div>
                            <div className="metric-value text-sky-500">{m.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Stacked bar + heatmap */}
                      <div className="grid gap-5 lg:grid-cols-2">
                        <div className="card h-[320px]">
                          <h4 className="mb-3 text-sm font-bold">📊 Aspect Mention Volume</h4>
                          <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={Object.entries(absaData).map(([asp, d]) => ({ aspect: asp.replace('_', ' '), Positive: d.Positive, Negative: d.Negative, Neutral: d.Neutral }))}>
                              <XAxis dataKey="aspect" stroke="#64748b" tick={{ fontSize: 10 }} />
                              <YAxis stroke="#64748b" />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }} />
                              <Bar dataKey="Positive" stackId="a" fill="#10B981" />
                              <Bar dataKey="Negative" stackId="a" fill="#EF4444" />
                              <Bar dataKey="Neutral"  stackId="a" fill="#6B7280" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="card">
                          <h4 style={{ fontWeight: '800', marginBottom: '12px', fontSize: '14px' }}>🔥 Aspect Scorecard</h4>
                          <table className="data-table">
                            <thead><tr><th>Aspect</th><th>Mentions</th><th>Positive%</th><th>Negative%</th></tr></thead>
                            <tbody>
                              {Object.entries(absaData).map(([asp, d]) => {
                                const pos = ((d.Positive / Math.max(1, d.mention_count)) * 100).toFixed(1);
                                const neg = ((d.Negative / Math.max(1, d.mention_count)) * 100).toFixed(1);
                                return (
                                  <tr key={asp}>
                                    <td style={{ fontWeight: '700', color: 'var(--text-1)', textTransform: 'capitalize' }}>{asp.replace('_', ' ')}</td>
                                    <td>{d.mention_count}</td>
                                    <td><span className="badge badge-emerald">{pos}%</span></td>
                                    <td><span className="badge badge-red">{neg}%</span></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>
                      Run an analysis first, then select it above to see the ABSA breakdown.
                    </div>
                  )}
                </div>
              )}

              {/* Forecasting tab */}
              {activeTab === 'forecast' && (
                <div className="panel">
                  <div className="card flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <h3 className="text-lg font-black">Sentiment Forecast Horizon</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-semibold text-slate-400">Horizon: {forecastDays} days</span>
                      <div className="w-full max-w-[260px]"><input type="range" min="3" max="30" value={forecastDays} onChange={e => setForecastDays(Number(e.target.value))} className="w-full accent-sky-500" /></div>
                      <div className="w-full max-w-[200px]"><select value={selectedId || ''} onChange={e => setSelectedId(Number(e.target.value))} className="input w-full">{analyses.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                    </div>
                  </div>
                  {forecastData ? (
                    <div className="card h-[420px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          ...forecastData.historical_dates.map((d, i) => ({ date: d, Positive: forecastData.historical_values[i] })),
                          ...forecastData.forecast_dates.map((d, i) => ({ date: d, Forecast: forecastData.forecast_values[i] })),
                        ]}>
                          <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 100]} stroke="#64748b" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }} />
                          <Line type="monotone" dataKey="Positive" stroke="#10B981" strokeWidth={2.5} dot={false} name="Historical" />
                          <Line type="monotone" dataKey="Forecast" stroke="#F59E0B" strokeDasharray="5 5" strokeWidth={2.5} dot={false} name="Forecast" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="card text-center p-12 text-slate-500 dark:text-slate-400">Select an analysis above to load its forecast.</div>
                  )}
                </div>
              )}

              {/* Benchmarking tab */}
              {activeTab === 'benchmark' && (
                <div className="panel">
                  <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-black">Competitor Benchmarking</h3>
                    <button onClick={handleBenchmark} className="btn btn-primary">Compare Brands</button>
                  </div>
                  {benchmarkData.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {benchmarkData.map((b, i) => (
                        <div key={i} className="card flex flex-col gap-4">
                          <h4 className="text-sm font-bold text-sky-500">Campaign #{b.id}</h4>
                          <div className="grid gap-3 sm:grid-cols-3">
                            {[
                              { label: 'Positive',   value: `${b.positive_pct}%`,  color: 'var(--emerald)' },
                              { label: 'Confidence', value: `${b.avg_confidence}%`, color: 'var(--indigo)'  },
                              { label: 'Quality',    value: `${b.quality_score}%`,  color: 'var(--amber)'   },
                            ].map((m, j) => (
                              <div key={j} className="card-sm text-center">
                                <div className="metric-label">{m.label}</div>
                                <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>Click "Compare Brands" to load benchmarking data.</div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
          </Suspense>
        </DashboardLayout>

        {/* Floating Chatbot Assistant */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </div>
    </ThemeProvider>
  );
}
