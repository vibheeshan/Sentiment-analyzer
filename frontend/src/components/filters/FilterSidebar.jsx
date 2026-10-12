import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Filter, ChevronDown, ChevronUp, Search,
  Star, Globe, Hash, AlertTriangle, X, Check, Save, Trash2,
  SlidersHorizontal, RotateCcw
} from 'lucide-react';

const TOPICS = [
  'Product Quality', 'Customer Service', 'Shipping', 'Pricing',
  'App Performance', 'Returns', 'Packaging', 'Brand Trust', 'Support', 'Design'
];
const LANGUAGES = ['All', 'English', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Arabic'];
const URGENCY_LEVELS = ['All', 'Critical', 'High', 'Medium', 'Low'];
const TIME_OF_DAY = ['All', 'Morning (6–12)', 'Afternoon (12–18)', 'Evening (18–24)', 'Night (0–6)'];
const SOURCES = ['All', 'Twitter/X', 'Amazon', 'Google', 'Reddit', 'Yelp', 'Facebook', 'TrustPilot'];

const DEFAULT_FILTERS = {
  keyword: '',
  keywordExclude: '',
  sentiment: 'All',
  confidence: [0, 100],
  emotions: [],
  datePreset: '30d',
  dateFrom: '',
  dateTo: '',
  timeOfDay: 'All',
  language: 'All',
  starRating: [1, 5],
  topics: [],
  sources: ['All'],
  urgency: 'All',
  spamFilter: false,
  influencerOnly: false,
  savedFilters: null,
};

function Section({ title, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
          {Icon && <Icon className="w-3.5 h-3.5 text-purple-400" />}
          {title}
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RangeSlider({ min, max, value, onChange, unit = '' }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[10px] font-bold text-slate-400">
        <span>{value[0]}{unit}</span>
        <span>{value[1]}{unit}</span>
      </div>
      <div className="relative h-1.5 bg-white/8 rounded-full">
        <div
          className="absolute h-full bg-purple-500 rounded-full"
          style={{
            left: `${((value[0] - min) / (max - min)) * 100}%`,
            right: `${100 - ((value[1] - min) / (max - min)) * 100}%`,
          }}
        />
        <input
          type="range" min={min} max={max} value={value[0]}
          onChange={e => {
            const v = Math.min(Number(e.target.value), value[1] - 1);
            onChange([v, value[1]]);
          }}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        <input
          type="range" min={min} max={max} value={value[1]}
          onChange={e => {
            const v = Math.max(Number(e.target.value), value[0] + 1);
            onChange([value[0], v]);
          }}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

function StarFilter({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <RangeSlider min={1} max={5} value={value} onChange={onChange} unit="★" />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            onClick={() => onChange([s, 5])}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${
              s === value[0] && value[1] === 5
                ? 'bg-amber-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >{'★'.repeat(s)}+</button>
        ))}
      </div>
    </div>
  );
}

export default function FilterSidebar({ filters: externalFilters, onFilterChange, onClose }) {
  const [filters, setFilters] = useState(externalFilters || DEFAULT_FILTERS);
  const [savedSearches, setSavedSearches] = useState([
    { name: 'High Urgency Issues', data: { urgency: 'Critical', sentiment: 'Negative' } },
    { name: 'Top Reviews (4★+)', data: { starRating: [4, 5], sentiment: 'Positive' } },
  ]);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const update = useCallback((key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    onFilterChange?.(next);
  }, [filters, onFilterChange]);

  const reset = () => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange?.(DEFAULT_FILTERS);
  };

  const saveSearch = () => {
    if (!saveSearchName.trim()) return;
    setSavedSearches(prev => [...prev, { name: saveSearchName, data: filters }]);
    setSaveSearchName('');
    setShowSaveInput(false);
  };

  const activeFilterCount = [
    filters.keyword, filters.keywordExclude,
    filters.sentiment !== 'All',
    filters.language !== 'All',
    filters.urgency !== 'All',
    filters.timeOfDay !== 'All',
    filters.spamFilter,
    filters.influencerOnly,
    filters.topics.length > 0,
    filters.emotions.length > 0,
    !filters.sources.includes('All'),
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 w-72 min-w-[288px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-black text-slate-800 dark:text-slate-100">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-purple-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={reset} className="btn btn-icon-sm btn-ghost" title="Reset filters">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button onClick={onClose} className="btn btn-icon-sm btn-ghost">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-0">

        {/* Saved Searches */}
        <Section title="Saved Searches" icon={Save} defaultOpen={false}>
          <div className="flex flex-col gap-1.5">
            {savedSearches.map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/3 border border-white/5 hover:border-purple-500/30 transition-all">
                <button
                  onClick={() => { setFilters({ ...filters, ...s.data }); onFilterChange?.({ ...filters, ...s.data }); }}
                  className="text-[11px] font-bold text-slate-300 text-left flex-1 truncate"
                >{s.name}</button>
                <button
                  onClick={() => setSavedSearches(prev => prev.filter((_, j) => j !== i))}
                  className="text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {showSaveInput ? (
              <div className="flex gap-1.5 mt-1">
                <input
                  type="text"
                  placeholder="Search name…"
                  value={saveSearchName}
                  onChange={e => setSaveSearchName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveSearch()}
                  className="input flex-1 text-xs py-1.5"
                  autoFocus
                />
                <button onClick={saveSearch} className="btn btn-icon-sm btn-primary">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveInput(true)}
                className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors text-left"
              >
                + Save current filters
              </button>
            )}
          </div>
        </Section>

        {/* Keyword search */}
        <Section title="Keyword Search" icon={Search}>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Include keywords…"
                value={filters.keyword}
                onChange={e => update('keyword', e.target.value)}
                className="input w-full pl-8 text-xs py-2"
              />
            </div>
            <div className="relative">
              <X className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Exclude keywords…"
                value={filters.keywordExclude}
                onChange={e => update('keywordExclude', e.target.value)}
                className="input w-full pl-8 text-xs py-2"
              />
            </div>
          </div>
        </Section>

        {/* Date range */}
        <Section title="Date Range" icon={Calendar}>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-4 gap-1">
              {['24h', '7d', '30d', '90d'].map(p => (
                <button
                  key={p}
                  onClick={() => update('datePreset', p)}
                  className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    filters.datePreset === p ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >{p}</button>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <input type="date" value={filters.dateFrom} onChange={e => update('dateFrom', e.target.value)}
                className="input text-xs py-1.5" />
              <input type="date" value={filters.dateTo} onChange={e => update('dateTo', e.target.value)}
                className="input text-xs py-1.5" />
            </div>
          </div>
        </Section>

        {/* Sentiment */}
        <Section title="Sentiment" icon={Filter}>
          <div className="grid grid-cols-2 gap-1.5">
            {['All', 'Positive', 'Negative', 'Neutral', 'Mixed', 'Sarcastic'].map(s => (
              <button
                key={s}
                onClick={() => update('sentiment', s)}
                className={`py-1.5 rounded-lg text-[10px] font-black transition-all text-center ${
                  filters.sentiment === s ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >{s}</button>
            ))}
          </div>
        </Section>

        {/* Confidence */}
        <Section title="Confidence Level" icon={Filter}>
          <RangeSlider min={0} max={100} value={filters.confidence} onChange={v => update('confidence', v)} unit="%" />
        </Section>

        {/* Star Rating */}
        <Section title="Star Rating" icon={Star}>
          <StarFilter value={filters.starRating} onChange={v => update('starRating', v)} />
        </Section>

        {/* Topics */}
        <Section title="Topics / Themes" icon={Hash} defaultOpen={false}>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map(t => {
              const active = filters.topics.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => {
                    const next = active ? filters.topics.filter(x => x !== t) : [...filters.topics, t];
                    update('topics', next);
                  }}
                  className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${
                    active ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >{t}</button>
              );
            })}
          </div>
        </Section>

        {/* Language */}
        <Section title="Language" icon={Globe} defaultOpen={false}>
          <div className="flex flex-col gap-1">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => update('language', lang)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filters.language === lang
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'hover:bg-white/5 text-slate-400'
                }`}
              >
                <span>{lang}</span>
                {filters.language === lang && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </Section>

        {/* Source */}
        <Section title="Source Platform" defaultOpen={false}>
          <div className="flex flex-wrap gap-1.5">
            {SOURCES.map(src => {
              const active = filters.sources.includes(src);
              return (
                <button
                  key={src}
                  onClick={() => {
                    if (src === 'All') { update('sources', ['All']); return; }
                    const withoutAll = filters.sources.filter(s => s !== 'All');
                    const next = active
                      ? withoutAll.filter(s => s !== src)
                      : [...withoutAll, src];
                    update('sources', next.length ? next : ['All']);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                    active ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >{src}</button>
              );
            })}
          </div>
        </Section>

        {/* Urgency */}
        <Section title="Urgency Level" icon={AlertTriangle} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-1.5">
            {URGENCY_LEVELS.map(u => (
              <button
                key={u}
                onClick={() => update('urgency', u)}
                className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                  filters.urgency === u ? 'bg-amber-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >{u}</button>
            ))}
          </div>
        </Section>

        {/* Time of day */}
        <Section title="Time of Day" icon={Clock} defaultOpen={false}>
          <div className="flex flex-col gap-1">
            {TIME_OF_DAY.map(t => (
              <button
                key={t}
                onClick={() => update('timeOfDay', t)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-left ${
                  filters.timeOfDay === t
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'hover:bg-white/5 text-slate-400'
                }`}
              >{t}</button>
            ))}
          </div>
        </Section>

        {/* Toggles */}
        <Section title="Additional Filters" defaultOpen={false}>
          <div className="flex flex-col gap-3">
            {[
              { key: 'spamFilter', label: 'Hide spam & bot reviews', color: 'bg-red-500' },
              { key: 'influencerOnly', label: 'Influencers only (5k+ followers)', color: 'bg-amber-500' },
            ].map(toggle => (
              <label key={toggle.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-300">{toggle.label}</span>
                <div
                  onClick={() => update(toggle.key, !filters[toggle.key])}
                  className={`w-9 h-5 rounded-full transition-all relative ${filters[toggle.key] ? toggle.color : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${filters[toggle.key] ? 'left-4' : 'left-0.5'}`} />
                </div>
              </label>
            ))}
          </div>
        </Section>
      </div>

      {/* Apply button */}
      <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-white/5">
        <button
          onClick={() => onFilterChange?.(filters)}
          className="btn btn-primary w-full text-sm font-black py-2.5"
        >
          Apply Filters {activeFilterCount > 0 && `(${activeFilterCount} active)`}
        </button>
      </div>
    </div>
  );
}
