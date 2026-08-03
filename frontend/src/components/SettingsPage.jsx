import React, { useState, useEffect } from 'react';
import { Save, Bell, Mail, Sliders, RefreshCw, User, ShieldAlert } from 'lucide-react';
import { apiService } from '../services/api';

const DEFAULT_THRESHOLDS = {
  negative_pct_critical: 60,
  negative_pct_warning: 40,
  neutral_pct_low: 15,
  fake_pct_warning: 20,
  confidence_low: 50,
};

export default function SettingsPage({ userId = 1 }) {
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [email, setEmail] = useState('');
  const [slack, setSlack] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('thresholds');

  // Profile management state
  const [userProfile, setUserProfile] = useState({ name: '', email: null, avatar: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [activeTab, userId]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await apiService.getUserProfile(userId);
      // Log API response for debugging (Objective 14)
      console.log("DEBUG: Get Profile API Response:", data);
      
      // Ensure backend schema maps name, email, avatar (Objective 2 & 15)
      // Confirm frontend maps user.email instead of user.mail etc (Objective 3)
      setUserProfile({
        name: data.name || '',
        email: data.email || null, // Can be null to trigger fallback (Objective 11)
        avatar: data.avatar || 'BA'
      });
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      setProfileError("Failed to load profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileChange = (field, val) => {
    setUserProfile(prev => ({ ...prev, [field]: val }));
  };

  const setT = (key, val) => setThresholds(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { key: 'thresholds',   label: '⚙️ Alert Thresholds' },
    { key: 'notifications',label: '📧 Notifications' },
    { key: 'profile',      label: '👤 Profile' },
    { key: 'themes',       label: '🎨 Themes' },
    { key: 'api_keys',     label: '🔑 API Keys' },
    { key: 'model',        label: '🤖 Model Selection' },
    { key: 'language',     label: '🌐 Language' },
    { key: 'security',     label: '🛡️ Security' },
    { key: 'roles',        label: '👥 Roles & Perms' },
    { key: 'workspace',    label: '🏢 Workspace' },
  ];

  const sliderConfigs = [
    { key: 'negative_pct_critical', label: '🔴 Critical — Negative % threshold', min: 20, max: 90, step: 5, help: 'Trigger CRITICAL alert when negative % exceeds this.' },
    { key: 'negative_pct_warning',  label: '🟡 Warning — Negative % threshold',  min: 10, max: 80, step: 5, help: 'Trigger WARNING alert when negative % exceeds this.' },
    { key: 'neutral_pct_low',       label: '⚡ Polarisation — Neutral % minimum', min: 5,  max: 50, step: 5, help: 'Alert when neutral % drops below this.' },
    { key: 'fake_pct_warning',      label: '🚨 Fake Reviews — Suspicious % threshold', min: 5, max: 50, step: 5, help: 'Alert when suspicious review % exceeds this.' },
    { key: 'confidence_low',        label: '📉 Confidence — Minimum confidence %', min: 30, max: 80, step: 5, help: 'Alert when avg confidence falls below this.' },
  ];

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {saved && (
        <div className="anomaly-banner" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' }}>
          ✅ Settings saved successfully!
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-ghost'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Alert Thresholds */}
      {activeTab === 'thresholds' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders className="nav-icon" style={{ color: 'var(--sky)' }} />
            <h3 style={{ fontWeight: '800', fontSize: '16px' }}>Alert Thresholds</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '-12px' }}>Customize when alerts are triggered. Changes apply to future analyses.</p>

          {sliderConfigs.map(cfg => (
            <div key={cfg.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-2)' }}>{cfg.label}</label>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--sky)' }}>{thresholds[cfg.key]}%</span>
              </div>
              <input type="range" min={cfg.min} max={cfg.max} step={cfg.step} value={thresholds[cfg.key]} onChange={e => setT(cfg.key, Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--sky)' }} />
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '3px' }}>{cfg.help}</div>
            </div>
          ))}

          <button onClick={handleSave} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Save className="nav-icon" /> Save Thresholds
          </button>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell className="nav-icon" style={{ color: 'var(--sky)' }} />
            <h3 style={{ fontWeight: '800', fontSize: '16px' }}>Notification Channels</h3>
          </div>

          <div>
            <label className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Mail className="nav-icon" style={{ width: 14, height: 14 }} /> Email for Critical Alerts
            </label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alerts@yourcompany.com" />
            <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>Set SMTP_EMAIL and SMTP_PASSWORD environment variables to enable delivery.</p>
          </div>

          <div>
            <label className="metric-label" style={{ display: 'block', marginBottom: '8px' }}>Slack Webhook URL</label>
            <input className="input" type="password" value={slack} onChange={e => setSlack(e.target.value)} placeholder="https://hooks.slack.com/services/..." />
            <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>Set SLACK_WEBHOOK_URL environment variable to enable Slack notifications.</p>
          </div>

          <button onClick={handleSave} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Save className="nav-icon" /> Save Notification Settings
          </button>
        </div>
      )}

      {/* Profile */}
      {activeTab === 'profile' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {profileLoading ? (
            /* Loading Skeleton (Objective 10) */
            <div className="animate-pulse flex flex-col gap-6 py-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-slate-700 h-14 w-14"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/6"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-slate-700 rounded"></div>
                <div className="h-10 bg-slate-700 rounded"></div>
              </div>
            </div>
          ) : profileError ? (
            /* Graceful Error UI (Objective 12) */
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div className="flex-1 text-xs font-semibold">{profileError}</div>
              <button onClick={fetchProfile} className="btn btn-sm btn-ghost flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyCenter: 'center', background: 'var(--purple)', color: '#fff', borderRadius: '50%', fontWeight: '900' }}>
                  {userProfile.avatar || "BA"}
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-1)' }}>{userProfile.name || "Guest Analyst"}</div>
                  <div style={{ fontSize: '12px', color: 'var(--sky)', fontWeight: '700' }}>PRO Enterprise</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="metric-label" style={{ display: 'block', marginBottom: '6px' }}>Display Name</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="e.g. Brand Analyst"
                    value={userProfile.name || ""} // Prevent uncontrolled inputs (Objective 9)
                    onChange={e => handleProfileChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="metric-label" style={{ display: 'block', marginBottom: '6px' }}>Email Address</label>
                  <input
                    className="input"
                    type="email"
                    placeholder={userProfile.email === null ? "No email available" : "e.g. analyst@brand.com"}
                    value={userProfile.email || ""} // Maps to userProfile.email correctly (Objective 3 & 9)
                    onChange={e => handleProfileChange('email', e.target.value)}
                  />
                  {userProfile.email === null && (
                    <div style={{ fontSize: '11px', color: 'var(--amber)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⚠️ No email available
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: '14px', background: 'rgba(14,165,233,0.06)', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.15)' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--sky)', marginBottom: '8px' }}>💡 ACTIVE FEATURES</div>
                {['Real-time alerts', '50+ data sources', 'Visual sentiment analysis', 'Topic discovery', '200+ review platforms', 'Custom dashboards'].map(f => (
                  <div key={f} style={{ fontSize: '12px', color: 'var(--text-2)', padding: '3px 0' }}>✅ {f}</div>
                ))}
              </div>

              <button onClick={handleSave} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <Save className="nav-icon" /> Save Profile
              </button>
            </>
          )}
        </div>
      )}

      {/* Themes */}
      {activeTab === 'themes' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '16px' }}>🎨 Theme Customization</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Switch dashboard theme variants and preview palette styles.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {['Neon Cyber (Dark)', 'Minimal Light', 'Classic Obsidian'].map((t, i) => (
              <button key={i} className={`p-4 rounded-xl border border-white/5 text-left text-xs font-bold ${i === 0 ? 'bg-purple-600/10 border-purple-500/30' : 'bg-white/5'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* API Keys */}
      {activeTab === 'api_keys' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '16px' }}>🔑 Live API Credentials</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Integrate brand intelligence engine to external endpoints or reporting systems.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="input" type="password" value="sk_live_51NpxJHG7389Xjs..." readOnly style={{ flex: 1 }} />
            <button className="btn btn-primary">Regenerate Key</button>
          </div>
        </div>
      )}

      {/* Model Selection */}
      {activeTab === 'model' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '16px' }}>🤖 AI Classifier Selection</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Choose NLP engine weights for Aspect Analysis and Anomaly Alerts.</p>
          {['BrandPulse-Core-v2 (Fast)', 'BrandPulse-Expert-ABSA (High Accuracy)', 'OpenAI GPT-4o-Mini (Cloud Hybrid)'].map((m, i) => (
            <label key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
              <input type="radio" name="nlp_model" defaultChecked={i === 1} style={{ accentColor: 'var(--purple)' }} />
              <span className="text-xs font-bold text-slate-200">{m}</span>
            </label>
          ))}
        </div>
      )}

      {/* Language */}
      {activeTab === 'language' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '16px' }}>🌐 Interface & NLP Translation</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Select default system language for translation parsing.</p>
          <select className="input text-xs font-semibold">
            {['English (US)', 'Deutsch (DE)', 'Español (ES)', 'Français (FR)'].map((l, i) => (
              <option key={i}>{l}</option>
            ))}
          </select>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '16px' }}>🛡️ Security Configurations</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Configure MFA and access controls.</p>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Enable Multi-Factor Auth</button>
        </div>
      )}

      {/* Roles & Perms */}
      {activeTab === 'roles' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '16px' }}>👥 Roles & Workspace Permissions</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Modify group memberships and platform restrictions.</p>
          <table className="data-table">
            <thead>
              <tr><th>Member</th><th>Role</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td className="font-bold text-slate-200">Brand Analyst</td><td>Admin</td><td className="text-emerald-400 font-bold">Active</td></tr>
              <tr><td className="font-bold text-slate-200">Junior Reviewer</td><td>Editor</td><td className="text-emerald-400 font-bold">Active</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Workspace */}
      {activeTab === 'workspace' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '16px' }}>🏢 Workspace Organization</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Manage corporate profiles and connected databases.</p>
          <input className="input" placeholder="Workspace Name" defaultValue="Nike Corporate Hub" />
          <button onClick={handleSave} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Name</button>
        </div>
      )}

    </div>
  );
}
