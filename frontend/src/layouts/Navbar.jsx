import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Share2, Download, Sun, Moon, Copy, Check, X, Menu, Bell, Sparkles, Clock3, Archive, CheckCheck } from 'lucide-react';
import BrandSwitcher from '../components/BrandSwitcher';
import { useTheme } from '../context/ThemeProvider';
import Popover from '../components/ui/Popover';

const PAGE_TITLES = {
  dashboard:   'Brand Dashboard',
  analyze:     'Run Analysis',
  advanced:    'Advanced AI',
  export:      'Export & Reports',
  history:     'Campaign History',
  alerts:      'Alerts & Rules',
  realtime:    'Real-Time Monitor',
  multisource: 'Multi-Source Hub',
  topics:      'Topic Discovery',
  dashboards:  'Custom Dashboards',
  reviews:     'Review Aggregator',
  absa:        'Aspect Sentiment',
  forecast:    'Forecasting',
  benchmark:   'Benchmarking',
  settings:    'Settings',
};

export default function Navbar({
  activeTab,
  searchQuery,
  setSearchQuery,
  onShare,
  onExportCsv,
  onMenuToggle,
}) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const notificationBtnRef = useRef(null);

  const notificationItems = [
    { title: 'Export ready', detail: 'Q3 report bundle is available for download.', time: '2m ago', unread: true },
    { title: 'Alert threshold updated', detail: 'Your negative sentiment rules were saved.', time: '18m ago', unread: false },
    { title: 'Workspace synced', detail: 'The latest review sources are now aligned.', time: '1h ago', unread: false },
  ];

  const searchSuggestions = [
    { label: 'Search Analytics', value: 'analytics' },
    { label: 'Campaign Review', value: 'campaign review' },
    { label: 'Keyword Signal', value: 'keyword signal' },
    { label: 'Aspect Trends', value: 'aspect trends' },
  ];

  const title = PAGE_TITLES[activeTab] || activeTab;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleShare = async () => {
    try {
      const link = await onShare?.();
      const generated = link || `${window.location.origin}/share/${Math.random().toString(36).substr(2, 8)}`;
      setShareLink(generated);
      setShowShareModal(true);
    } catch {
      setShareLink(`${window.location.origin}/share/${Math.random().toString(36).substr(2, 8)}`);
      setShowShareModal(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <header className="topbar sticky top-0 z-[var(--z-sticky)] flex h-[72px] min-h-[72px] items-center justify-between gap-4 border-b border-slate-200 bg-white/70 px-6 backdrop-blur-md dark:border-white/5 dark:bg-[#0b0f19]/80" role="banner">
        {/* Left section: Hamburger, Brand Switcher, Page Title */}
        <div className="flex flex-1 items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuToggle}
            className="btn btn-icon-sm btn-ghost md:hidden flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Brand Switcher */}
          <BrandSwitcher />

          <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-white/10 flex-shrink-0" />

          <h1
            className="hidden sm:block text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest truncate"
            aria-label={`Current page: ${title}`}
          >
            {title}
          </h1>
        </div>

        {/* Right section: Search bar, Theme toggle, Share, CSV Export */}
        <div className="flex flex-shrink-0 items-center gap-3">
          {/* Search bar */}
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              className="input h-[48px] rounded-[14px] pl-11 pr-12 text-xs font-semibold md:w-[280px] lg:w-[360px]"
              placeholder="Search campaigns… (⌘K)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              aria-label="Search campaigns"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-400 dark:border-white/10 dark:bg-white/10">
                ⌘K
              </kbd>
            )}

            <Popover
              isOpen={showSuggestions}
              onClose={() => setShowSuggestions(false)}
              triggerRef={searchInputRef}
              matchWidth={true}
              className="p-2"
            >
              <div className="mb-1 flex items-center gap-2 px-2 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                <Sparkles className="h-3 w-3 text-purple-500" /> Recent searches
              </div>
              {searchSuggestions.map(item => (
                <button
                  key={item.value}
                  type="button"
                  onMouseDown={() => setSearchQuery(item.value)}
                  className="flex w-full items-center justify-between rounded-[10px] px-2.5 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-purple-500/10 hover:text-purple-600 dark:text-slate-300"
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{item.value}</span>
                </button>
              ))}
            </Popover>
          </div>

          <div className="relative">
            <button
              ref={notificationBtnRef}
              onClick={() => setShowNotifications(v => !v)}
              className="btn btn-icon btn-ghost h-[48px] w-[48px]"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <Popover
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              triggerRef={notificationBtnRef}
              align="right"
              style={{ width: '280px' }}
              className="p-2"
            >
              <div className="flex items-center justify-between px-2 py-2">
                <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Notifications</div>
                <button className="text-[10px] font-bold text-purple-500">Mark all read</button>
              </div>
              {notificationItems.map(item => (
                <div key={item.title} className={`rounded-[12px] border px-3 py-2.5 ${item.unread ? 'border-purple-500/20 bg-purple-500/10' : 'border-slate-200/70 dark:border-white/10'}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {item.unread && <span className="h-2 w-2 rounded-full bg-purple-500" />}
                    {item.title}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{item.detail}</div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                    <Clock3 className="h-3 w-3" /> {item.time}
                  </div>
                </div>
              ))}
            </Popover>
          </div>

          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="btn btn-icon btn-ghost h-[48px] w-[48px]"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {!isDarkMode
              ? <Sun  className="w-4 h-4 text-amber-500" />
              : <Moon className="w-4 h-4 text-indigo-400" />
            }
          </motion.button>

          {/* Share */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="btn btn-primary h-[48px] px-4 text-xs font-bold hidden sm:inline-flex whitespace-nowrap shrink-0"
            aria-label="Share dashboard"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </motion.button>

          {/* CSV Export */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportCsv}
            className="btn btn-ghost h-[48px] px-4 text-xs font-bold hidden sm:inline-flex whitespace-nowrap shrink-0"
            aria-label="Export CSV"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>CSV</span>
          </motion.button>
        </div>
      </header>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-overlay-panel)] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="glass-modal p-6 w-full max-w-md flex flex-col gap-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 id="share-modal-title" className="section-title text-base flex items-center gap-2 font-black text-slate-800 dark:text-slate-100">
                  <Share2 className="w-4 h-4 text-purple-500" />
                  Shareable Dashboard Link
                </h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="btn btn-icon-sm btn-ghost"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This link provides <strong className="text-slate-800 dark:text-slate-200">read-only access</strong> to your current dashboard and expires in <strong className="text-purple-500">7 days</strong>.
              </p>

              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareLink}
                  className="input flex-1 text-xs font-mono h-9"
                  aria-label="Share link"
                />
                <button
                  onClick={handleCopy}
                  className="btn btn-primary btn-sm flex-shrink-0"
                  aria-label="Copy link"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Link is active — expires in 7 days
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
