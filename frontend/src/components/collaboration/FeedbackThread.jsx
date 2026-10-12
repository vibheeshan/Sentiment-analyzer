import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, AtSign, Send, Tag, UserPlus, CheckCircle, Clock, MoreHorizontal, Paperclip, Smile, Trash2, Edit2, X } from 'lucide-react';

const TEAM_MEMBERS = [
  { id: 1, name: 'Alex Rivera',   role: 'Brand Lead',     avatar: 'AR', color: '#7c3aed' },
  { id: 2, name: 'Sofia Patel',   role: 'NLP Analyst',    avatar: 'SP', color: '#0ea5e9' },
  { id: 3, name: 'Marcus Chen',   role: 'Data Engineer',  avatar: 'MC', color: '#10b981' },
  { id: 4, name: 'Jade Williams', role: 'Ops Manager',    avatar: 'JW', color: '#f59e0b' },
];

const STATUS_OPTIONS = [
  { value: 'open',        label: 'Open',        color: 'bg-slate-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'resolved',    label: 'Resolved',    color: 'bg-emerald-500' },
  { value: 'escalated',   label: 'Escalated',   color: 'bg-red-500' },
];

const TAGS = ['Urgent', 'Feature Request', 'Bug', 'Complaint', 'Praise', 'Follow-up'];

const MOCK_THREAD = {
  feedbackId: 'FB-001',
  feedbackText: '"App crashed during checkout — lost my entire cart. Very disappointing experience."',
  feedbackSentiment: 'Negative',
  feedbackScore: -0.84,
  assignedTo: 2,
  status: 'in-progress',
  tags: ['Urgent', 'Bug'],
  comments: [
    {
      id: 1, authorId: 1,
      text: 'This is a P1 issue. @Marcus Chen can you check the checkout service logs from yesterday?',
      timestamp: '2026-08-09T09:15:00Z',
      mentions: [3],
      reactions: [{ emoji: '👍', count: 2, users: [2, 4] }],
    },
    {
      id: 2, authorId: 3,
      text: 'Found the root cause — cart state was not persisted after session timeout. Fix deployed to staging.',
      timestamp: '2026-08-09T10:30:00Z',
      mentions: [],
      reactions: [{ emoji: '✅', count: 3, users: [1, 2, 4] }],
    },
    {
      id: 3, authorId: 4,
      text: '@Alex Rivera should we reach out to this customer directly? I can draft a compensation email.',
      timestamp: '2026-08-09T11:00:00Z',
      mentions: [1],
      reactions: [],
    },
  ],
};

function Avatar({ member, size = 'md' }) {
  const sizes = { sm: 'w-6 h-6 text-[9px]', md: 'w-8 h-8 text-[10px]', lg: 'w-10 h-10 text-xs' };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-black text-white flex-shrink-0`}
      style={{ background: member?.color || '#6366f1' }}
    >
      {member?.avatar || '?'}
    </div>
  );
}

function CommentBubble({ comment, team, onReact }) {
  const author = team.find(m => m.id === comment.authorId);
  const timeAgo = (() => {
    const diff = Date.now() - new Date(comment.timestamp).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <Avatar member={author} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black text-slate-200">{author?.name || 'Unknown'}</span>
          <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">{author?.role}</span>
          <span className="text-[9px] text-slate-500 ml-auto">{timeAgo}</span>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl rounded-tl-sm px-3 py-2.5 text-xs text-slate-300 leading-relaxed">
          {/* Highlight @mentions */}
          {comment.text.split(/(@\w+\s\w+)/g).map((part, i) =>
            part.startsWith('@') ? (
              <span key={i} className="text-purple-400 font-bold">{part}</span>
            ) : <span key={i}>{part}</span>
          )}
        </div>
        {/* Reactions */}
        {comment.reactions?.length > 0 && (
          <div className="flex gap-1.5 mt-1.5">
            {comment.reactions.map((r, i) => (
              <button
                key={i}
                onClick={() => onReact(comment.id, r.emoji)}
                className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-full px-2 py-0.5 text-[10px] font-bold text-slate-400 hover:bg-white/10 transition-all"
              >
                {r.emoji} <span>{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function FeedbackThread({ thread = MOCK_THREAD, onClose }) {
  const [comments, setComments] = useState(thread.comments);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(thread.status);
  const [assignedTo, setAssignedTo] = useState(thread.assignedTo);
  const [tags, setTags] = useState(thread.tags || []);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [tab, setTab] = useState('thread');
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);
    const atMatch = val.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
    }
  };

  const insertMention = (member) => {
    const newInput = input.replace(/@(\w*)$/, `@${member.name} `);
    setInput(newInput);
    setShowMentionList(false);
    inputRef.current?.focus();
  };

  const submitComment = () => {
    if (!input.trim()) return;
    const mentions = TEAM_MEMBERS.filter(m => input.includes(`@${m.name}`)).map(m => m.id);
    setComments(prev => [...prev, {
      id: Date.now(), authorId: 1,
      text: input.trim(),
      timestamp: new Date().toISOString(),
      mentions,
      reactions: [],
    }]);
    setInput('');
  };

  const handleReact = (commentId, emoji) => {
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      const existing = c.reactions.find(r => r.emoji === emoji);
      if (existing) {
        return { ...c, reactions: c.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) };
      }
      return { ...c, reactions: [...c.reactions, { emoji, count: 1, users: [1] }] };
    }));
  };

  const toggleTag = (tag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === status);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/8 rounded-[18px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-black text-slate-800 dark:text-slate-100">Feedback Thread</span>
          <span className="text-[10px] font-black text-slate-500 font-mono">{thread.feedbackId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${currentStatus?.color}`}>
            {currentStatus?.label}
          </span>
          {onClose && <button onClick={onClose} className="btn btn-icon-sm btn-ghost"><X className="w-4 h-4" /></button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 flex-shrink-0">
        {[{ key: 'thread', label: 'Discussion' }, { key: 'meta', label: 'Metadata' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-xs font-black transition-all ${
              tab === t.key
                ? 'text-purple-400 border-b-2 border-purple-500'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'thread' ? (
        <>
          {/* Feedback text */}
          <div className="p-4 bg-red-500/5 border-b border-red-500/10 flex-shrink-0">
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/20 flex-shrink-0 mt-0.5">
                {thread.feedbackSentiment} ({thread.feedbackScore})
              </span>
              <p className="text-xs text-slate-400 italic leading-relaxed">{thread.feedbackText}</p>
            </div>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {comments.map(c => (
              <CommentBubble key={c.id} comment={c} team={TEAM_MEMBERS} onReact={handleReact} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-3 border-t border-white/5 relative">
            <AnimatePresence>
              {showMentionList && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-full left-3 right-3 mb-1 bg-slate-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                >
                  {TEAM_MEMBERS.filter(m =>
                    m.name.toLowerCase().includes(mentionQuery.toLowerCase())
                  ).map(m => (
                    <button
                      key={m.id}
                      onClick={() => insertMention(m)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-white/5 text-left"
                    >
                      <Avatar member={m} size="sm" />
                      <div>
                        <div className="text-xs font-bold text-slate-200">{m.name}</div>
                        <div className="text-[9px] text-slate-500">{m.role}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInput}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                placeholder="Add a comment… use @ to mention"
                className="input flex-1 text-xs py-2"
              />
              <button
                onClick={submitComment}
                disabled={!input.trim()}
                className="btn btn-primary btn-icon px-3"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          {/* Assignee */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2 block">Assigned To</label>
            <div className="flex flex-wrap gap-2">
              {TEAM_MEMBERS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setAssignedTo(m.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    assignedTo === m.id
                      ? 'border-purple-500/50 bg-purple-500/15 text-purple-300'
                      : 'border-white/5 bg-white/3 text-slate-400 hover:bg-white/8'
                  }`}
                >
                  <Avatar member={m} size="sm" />
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2 block">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                    status === s.value
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-white/5 bg-white/3 text-slate-400 hover:bg-white/8'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                    tags.includes(tag)
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-white/3 text-slate-500 border-white/5 hover:bg-white/8'
                  }`}
                >
                  {tags.includes(tag) && <span className="mr-1">✓</span>}{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
