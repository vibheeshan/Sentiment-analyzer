import React, { useState } from 'react';
import { AlertTriangle, BellOff, CheckCircle2, Clock, Filter, Plus, Settings2 } from 'lucide-react';

export default function AlertDashboard() {
  const [activeTab, setActiveTab] = useState('history');
  
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'Critical Spike', message: 'Negative sentiment increased by 45% in last hour.', severity: 'critical', time: '10 mins ago', status: 'unread' },
    { id: 2, type: 'Volume Alert', message: 'Unusual volume of mentions (300+).', severity: 'warning', time: '2 hours ago', status: 'snoozed' },
    { id: 3, type: 'Goal Reached', message: 'Overall sentiment target of 85% achieved.', severity: 'success', time: '1 day ago', status: 'read' },
  ]);

  const [rules, setRules] = useState([
    { id: 1, name: 'Critical Negative Spike', condition: 'Negative % > 40%', action: 'Email & Slack', status: 'Active' },
    { id: 2, name: 'High Volume', condition: 'Mentions > 500/hr', action: 'Slack Only', status: 'Active' }
  ]);

  const handleDismiss = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'read' } : a));
  };

  const handleSnooze = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'snoozed' } : a));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        {['history', 'rules'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn h-[42px] px-5 text-xs font-bold ${activeTab === tab ? 'btn-primary' : 'btn-secondary capitalize'}`}
          >
            {tab === 'history' ? '📬 Alert History' : '⚙️ Alert Rules'}
          </button>
        ))}
      </div>

      {activeTab === 'history' && (
        <div className="card rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-100">Recent Alerts</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time sentiment anomaly and threshold trigger notifications</p>
            </div>
            <button className="btn btn-sm btn-ghost flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" /> <span>Filter</span>
            </button>
          </div>

          <div className="space-y-3">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-4 transition-all
                  ${alert.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' : 
                    alert.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 
                    'bg-emerald-500/5 border-emerald-500/20'}
                  ${alert.status === 'read' ? 'opacity-60' : 'opacity-100'}
                `}
              >
                <div className="flex-1 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    alert.severity === 'critical' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                    alert.severity === 'warning' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-xs">{alert.type}</h4>
                    <p className="text-slate-300 text-xs mt-0.5">{alert.message}</p>
                    <div className="flex items-center gap-2.5 mt-2 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {alert.time}</span>
                      {alert.status === 'unread' && <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider">New</span>}
                      {alert.status === 'snoozed' && <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider">Snoozed</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button 
                    onClick={() => handleSnooze(alert.id)}
                    className="btn btn-icon-sm btn-ghost hover:text-amber-400"
                    title="Snooze 4 hours"
                  >
                    <BellOff className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDismiss(alert.id)}
                    className="btn btn-icon-sm btn-ghost hover:text-emerald-400"
                    title="Dismiss"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-extrabold text-slate-100">Configured Rules</h3>
            </div>
            
            <div className="space-y-3">
              {rules.map(rule => (
                <div key={rule.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-100 text-xs">{rule.name}</div>
                    <div className="text-xs text-slate-400 mt-1 font-mono">{rule.condition}</div>
                    <div className="text-[11px] font-semibold text-purple-400 mt-2">Action: {rule.action}</div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                    <button className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card rounded-2xl p-6 h-fit bg-slate-900 border border-slate-800">
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4 text-purple-400" /> Create New Rule
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Rule Name</label>
                <input type="text" placeholder="e.g. Sudden Drop" className="input w-full text-xs h-[42px]" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Trigger Condition</label>
                <select className="input w-full text-xs h-[42px] py-1">
                  <option>Negative Sentiment %</option>
                  <option>Volume Spike</option>
                  <option>Specific Keyword</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Action</label>
                <select className="input w-full text-xs h-[42px] py-1">
                  <option>Send Email</option>
                  <option>Post to Slack</option>
                  <option>In-App Notification</option>
                </select>
              </div>
              
              <button className="btn btn-primary w-full h-[42px] mt-2">
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
