import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Tag, UserPlus, MessageSquare, FileText, Download,
  Filter, Bell, Eye, CheckCircle, TrendingUp, AlertTriangle,
  Trash2, Edit2, MoreHorizontal, Clock, RefreshCw
} from 'lucide-react';

const TEAM_MEMBERS = [
  { id: 1, name: 'Alex Rivera',   role: 'Brand Lead',     avatar: 'AR', color: '#7c3aed' },
  { id: 2, name: 'Sofia Patel',   role: 'NLP Analyst',    avatar: 'SP', color: '#0ea5e9' },
  { id: 3, name: 'Marcus Chen',   role: 'Data Engineer',  avatar: 'MC', color: '#10b981' },
  { id: 4, name: 'Jade Williams', role: 'Ops Manager',    avatar: 'JW', color: '#f59e0b' },
];

const ACTION_TYPES = {
  comment:    { icon: MessageSquare, color: '#6366f1', label: 'commented' },
  tag:        { icon: Tag,           color: '#10b981', label: 'tagged' },
  assign:     { icon: UserPlus,      color: '#0ea5e9', label: 'assigned' },
  status:     { icon: CheckCircle,   color: '#f59e0b', label: 'updated status' },
  export:     { icon: Download,      color: '#64748b', label: 'exported' },
  view:       { icon: Eye,           color: '#475569', label: 'viewed' },
  alert:      { icon: AlertTriangle, color: '#ef4444', label: 'triggered alert' },
  analysis:   { icon: TrendingUp,    color: '#a78bfa', label: 'ran analysis' },
};

function generateMockActivities(count = 40) {
  const actions = Object.keys(ACTION_TYPES);
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const member = TEAM_MEMBERS[Math.floor(Math.random() * TEAM_MEMBERS.length)];
    const offsetMs = i * (3 + Math.random() * 8) * 60 * 1000;
    return {
      id: count - i,
      memberId: member.id,
      action,
      target: `FB-${1000 + Math.floor(Math.random() * 999)}`,
      detail: {
        comment: `"Great catch — assigning this to the support team."`,
        tag: `added tag "Urgent" to ${count - i} entries`,
        assign: `assigned to ${TEAM_MEMBERS[Math.floor(Math.random() * TEAM_MEMBERS.length)].name}`,
        status: `changed status to ${['In Progress', 'Resolved', 'Escalated'][Math.floor(Math.random() * 3)]}`,
        export: `exported ${Math.floor(50 + Math.random() * 200)} rows as CSV`,
        view: `viewed dashboard for 3m 42s`,
        alert: `negative sentiment exceeded 35% threshold`,
        analysis: `ran analysis on "${['Q3 Campaign', 'Brand Review', 'Summer Launch'][Math.floor(Math.random() * 3)]}"`,
      }[action],
      timestamp: new Date(now - offsetMs).toISOString(),
    };
  });
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function Avatar({ member, size = 'sm' }) {
  const sizes = { sm: 'w-7 h-7 text-[9px]', md: 'w-9 h-9 text-[10px]' };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-black text-white flex-shrink-0`}
      style={{ background: member?.color || '#6366f1' }}
    >
      {member?.avatar}
    </div>
  );
}

function ActivityItem({ item }) {
  const member = TEAM_MEMBERS.find(m => m.id === item.memberId);
  const actionMeta = ACTION_TYPES[item.action];
  const Icon = actionMeta?.icon || Activity;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3 group hover:bg-white/3 rounded-xl px-2 py-2.5 transition-all"
    >
      <div className="relative flex-shrink-0">
        <Avatar member={member} />
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
          style={{ background: `${actionMeta?.color}22`, border: `1px solid ${actionMeta?.color}44` }}
        >
          <Icon className="w-2 h-2" style={{ color: actionMeta?.color }} />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1 flex-wrap">
          <span className="text-xs font-black text-slate-200">{member?.name}</span>
          <span className="text-xs text-slate-500">{actionMeta?.label}</span>
          <span className="text-xs font-bold text-purple-400">{item.target}</span>
        </div>
        {item.detail && (
          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed truncate">{item.detail}</p>
        )}
        <span className="text-[9px] text-slate-600 flex items-center gap-1 mt-1">
          <Clock className="w-2.5 h-2.5" />
          {timeAgo(item.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

export default function ActivityFeed({ compact = false }) {
  const [activities, setActivities] = useState(() => generateMockActivities(40));
  const [filter, setFilter] = useState('All');
  const [memberFilter, setMemberFilter] = useState('All');
  const [isLive, setIsLive] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const intervalRef = useRef(null);

  const ACTION_FILTER_OPTIONS = ['All', ...Object.keys(ACTION_TYPES)];

  // Simulate live updates
  useEffect(() => {
    if (!isLive) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      const actions = Object.keys(ACTION_TYPES);
      const action = actions[Math.floor(Math.random() * actions.length)];
      const member = TEAM_MEMBERS[Math.floor(Math.random() * TEAM_MEMBERS.length)];
      const newActivity = {
        id: Date.now(),
        memberId: member.id,
        action,
        target: `FB-${1000 + Math.floor(Math.random() * 999)}`,
        detail: null,
        timestamp: new Date().toISOString(),
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 50));
    }, 8000);
    return () => clearInterval(intervalRef.current);
  }, [isLive]);

  const filtered = activities.filter(a => {
    const actionMatch = filter === 'All' || a.action === filter;
    const memberMatch = memberFilter === 'All' || a.memberId === Number(memberFilter);
    return actionMatch && memberMatch;
  });

  // Activity stats
  const activityByMember = TEAM_MEMBERS.map(m => ({
    ...m,
    count: activities.filter(a => a.memberId === m.id).length
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="card rounded-[18px] flex flex-col overflow-hidden" style={{ maxHeight: compact ? '400px' : '600px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-black text-slate-100">Activity Feed</span>
          <span className="text-[9px] font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
            {activities.length} events
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Live toggle */}
          <button
            onClick={() => setIsLive(v => !v)}
            className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full transition-all ${
              isLive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-500 border border-white/5'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {isLive ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={() => setShowFilters(v => !v)}
            className="btn btn-icon-sm btn-ghost"
            title="Filters"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5 flex-shrink-0"
          >
            <div className="p-3 flex flex-col gap-2.5">
              <div>
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Action Type</div>
                <div className="flex flex-wrap gap-1">
                  {ACTION_FILTER_OPTIONS.map(a => (
                    <button
                      key={a}
                      onClick={() => setFilter(a)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all capitalize ${
                        filter === a ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Team Member</div>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setMemberFilter('All')}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
                      memberFilter === 'All' ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >All</button>
                  {TEAM_MEMBERS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMemberFilter(String(m.id))}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
                        memberFilter === String(m.id) ? 'text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                      style={memberFilter === String(m.id) ? { background: m.color } : {}}
                    >{m.name.split(' ')[0]}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top contributors (compact view) */}
      {!compact && (
        <div className="flex gap-2 p-3 border-b border-white/5 flex-shrink-0 overflow-x-auto">
          {activityByMember.map(m => (
            <button
              key={m.id}
              onClick={() => setMemberFilter(memberFilter === String(m.id) ? 'All' : String(m.id))}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all flex-shrink-0 ${
                memberFilter === String(m.id)
                  ? 'border-white/20 bg-white/10'
                  : 'border-white/5 bg-white/3 hover:bg-white/8'
              }`}
            >
              <Avatar member={m} />
              <div className="text-left">
                <div className="text-[10px] font-black text-slate-200">{m.name.split(' ')[0]}</div>
                <div className="text-[8px] text-slate-500">{m.count} actions</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Activity list */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No activity matches the current filters.</div>
          ) : (
            filtered.map(item => (
              <ActivityItem key={item.id} item={item} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-3 border-t border-white/5 text-center">
        <span className="text-[9px] text-slate-600">
          Showing {filtered.length} of {activities.length} activities
          {isLive && ' · Auto-updates every 8s'}
        </span>
      </div>
    </div>
  );
}
