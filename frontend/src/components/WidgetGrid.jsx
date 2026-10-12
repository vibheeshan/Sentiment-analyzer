import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  GripVertical, Maximize2, Minimize2, X, Plus, LayoutGrid,
  Settings, Save, RotateCcw, Lock, Unlock, Eye, EyeOff
} from 'lucide-react';

const DEFAULT_WIDGETS = [
  { id: 'kpi-positive',   title: 'Positive Score',    size: 'sm', visible: true, locked: false },
  { id: 'kpi-negative',   title: 'Negative Score',    size: 'sm', visible: true, locked: false },
  { id: 'kpi-volume',     title: 'Total Volume',       size: 'sm', visible: true, locked: false },
  { id: 'kpi-confidence', title: 'Avg Confidence',    size: 'sm', visible: true, locked: false },
  { id: 'trend-chart',    title: 'Sentiment Trend',    size: 'lg', visible: true, locked: false },
  { id: 'pie-chart',      title: 'Allocation',         size: 'md', visible: true, locked: false },
  { id: 'heatmap',        title: 'Calendar Heatmap',   size: 'md', visible: true, locked: false },
  { id: 'insights',       title: 'AI Insights',        size: 'md', visible: true, locked: false },
  { id: 'treemap',        title: 'Topic Treemap',      size: 'md', visible: true, locked: false },
  { id: 'scatter',        title: 'Scatter Plot',       size: 'lg', visible: false, locked: false },
  { id: 'bubble',         title: 'Bubble Chart',       size: 'lg', visible: false, locked: false },
  { id: 'waterfall',      title: 'Waterfall Chart',    size: 'lg', visible: false, locked: false },
  { id: 'funnel',         title: 'Pipeline Funnel',    size: 'md', visible: false, locked: false },
  { id: 'activity',       title: 'Activity Feed',      size: 'md', visible: false, locked: false },
];

const WIDGET_RENDERERS = {
  'kpi-positive': ({ data }) => (
    <div className="flex flex-col justify-between h-full">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Positive Score</div>
      <div className="text-4xl font-black text-emerald-400">
        {data?.positiveRate?.toFixed(1) || '68.4'}<span className="text-xl">%</span>
      </div>
      <div className="text-[10px] text-emerald-500">+5.2% vs last week</div>
    </div>
  ),
  'kpi-negative': ({ data }) => (
    <div className="flex flex-col justify-between h-full">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Negative Score</div>
      <div className="text-4xl font-black text-red-400">
        {data?.negativeRate?.toFixed(1) || '18.3'}<span className="text-xl">%</span>
      </div>
      <div className="text-[10px] text-red-500">-2.1% vs last week</div>
    </div>
  ),
  'kpi-volume': ({ data }) => (
    <div className="flex flex-col justify-between h-full">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Volume</div>
      <div className="text-4xl font-black text-sky-400">
        {data?.total || '8,240'}
      </div>
      <div className="text-[10px] text-sky-500">+8.4% vs last week</div>
    </div>
  ),
  'kpi-confidence': ({ data }) => (
    <div className="flex flex-col justify-between h-full">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Avg Confidence</div>
      <div className="text-4xl font-black text-purple-400">
        {data?.confidence || '88.7'}<span className="text-xl">%</span>
      </div>
      <div className="text-[10px] text-purple-500">+1.1% vs last week</div>
    </div>
  ),
  'trend-chart': () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
      <div className="text-3xl mb-2">📈</div>
      <span>Sentiment Trend Chart</span>
      <span className="text-[10px] mt-1">(Live recharts AreaChart)</span>
    </div>
  ),
  'pie-chart': () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
      <div className="text-3xl mb-2">🥧</div>
      <span>Allocation Pie Chart</span>
    </div>
  ),
  'heatmap': () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
      <div className="text-3xl mb-2">🗓️</div>
      <span>Calendar Heatmap</span>
    </div>
  ),
  'insights': () => (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">AI Insights</div>
      {['Positive sentiment peaked Thursday at 84%', 'Shipping complaints up 12% this week', 'Trust score improved after product update'].map((ins, i) => (
        <div key={i} className="flex gap-2 text-xs text-slate-400">
          <span className="text-purple-400 flex-shrink-0">→</span>
          <span>{ins}</span>
        </div>
      ))}
    </div>
  ),
  'treemap': () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
      <div className="text-3xl mb-2">🗺️</div>
      <span>Sentiment Treemap</span>
    </div>
  ),
  'scatter': () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
      <div className="text-3xl mb-2">🔵</div>
      <span>Scatter Plot</span>
    </div>
  ),
  'bubble': () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
      <div className="text-3xl mb-2">🫧</div>
      <span>Bubble Chart</span>
    </div>
  ),
  'waterfall': () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
      <div className="text-3xl mb-2">📊</div>
      <span>Waterfall Chart</span>
    </div>
  ),
  'funnel': () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
      <div className="text-3xl mb-2">🔻</div>
      <span>Pipeline Funnel</span>
    </div>
  ),
  'activity': () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
      <div className="text-3xl mb-2">⚡</div>
      <span>Activity Feed</span>
    </div>
  ),
};

const SIZE_CLASSES = {
  sm: 'col-span-1',
  md: 'col-span-1 md:col-span-2',
  lg: 'col-span-1 md:col-span-2 xl:col-span-3',
};

const SIZE_HEIGHT = {
  sm: '160px',
  md: '260px',
  lg: '320px',
};

function Widget({ widget, onToggleVisible, onToggleLocked, onRemove, onResize, data, isEditing }) {
  const Renderer = WIDGET_RENDERERS[widget.id];
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={widget}
      dragListener={false}
      dragControls={dragControls}
      className={`${SIZE_CLASSES[widget.size || 'md']} relative`}
    >
      <motion.div
        layout
        className={`card rounded-[16px] overflow-hidden flex flex-col transition-all ${
          !widget.visible ? 'opacity-40' : ''
        } ${isEditing ? 'ring-1 ring-purple-500/30' : ''}`}
        style={{ height: SIZE_HEIGHT[widget.size || 'md'] }}
      >
        {/* Widget toolbar */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-0 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            {isEditing && !widget.locked && (
              <div
                className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition-colors"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{widget.title}</span>
          </div>
          {isEditing && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleVisible(widget.id)}
                className="btn-icon-xs text-slate-600 hover:text-slate-300"
                title={widget.visible ? 'Hide' : 'Show'}
              >
                {widget.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
              <button
                onClick={() => onToggleLocked(widget.id)}
                className="btn-icon-xs text-slate-600 hover:text-slate-300"
                title={widget.locked ? 'Unlock' : 'Lock'}
              >
                {widget.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>
              <button
                onClick={() => onResize(widget.id)}
                className="btn-icon-xs text-slate-600 hover:text-slate-300"
                title="Cycle size"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Widget content */}
        <div className="flex-1 p-3 min-h-0">
          {Renderer ? <Renderer data={data} /> : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Widget not configured
            </div>
          )}
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

const LAYOUT_PRESETS = [
  { name: 'Analytics Focus', widgets: ['kpi-positive', 'kpi-negative', 'kpi-volume', 'kpi-confidence', 'trend-chart', 'scatter'] },
  { name: 'Executive Summary', widgets: ['kpi-positive', 'kpi-volume', 'insights', 'pie-chart'] },
  { name: 'Full Dashboard', widgets: DEFAULT_WIDGETS.filter(w => w.visible).map(w => w.id) },
];

const SAVED_KEY = 'brandpulse_widget_layout';

export default function WidgetGrid({ data }) {
  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const saveLayout = () => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(widgets));
    setIsEditing(false);
  };

  const resetLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.removeItem(SAVED_KEY);
  };

  const toggleVisible = (id) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  const toggleLocked = (id) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, locked: !w.locked } : w));
  const cycleSize = (id) => {
    const sizes = ['sm', 'md', 'lg'];
    setWidgets(prev => prev.map(w => {
      if (w.id !== id) return w;
      const nextSize = sizes[(sizes.indexOf(w.size) + 1) % sizes.length];
      return { ...w, size: nextSize };
    }));
  };

  const applyPreset = (preset) => {
    setWidgets(DEFAULT_WIDGETS.map(w => ({ ...w, visible: preset.widgets.includes(w.id) })));
    setShowPresets(false);
  };

  const visibleWidgets = widgets.filter(w => w.visible);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-black text-slate-800 dark:text-slate-100">Widget Dashboard</span>
          <span className="text-[10px] text-slate-500">{visibleWidgets.length} widgets active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowPresets(v => !v)}
              className="btn btn-ghost text-xs py-1.5 px-3 font-bold"
            >
              Presets
            </button>
            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-full right-0 mt-1 bg-slate-800/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[180px]"
                >
                  {LAYOUT_PRESETS.map(p => (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p)}
                      className="flex w-full items-start px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/8 transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {isEditing ? (
            <>
              <button onClick={resetLayout} className="btn btn-ghost text-xs py-1.5 px-3">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />Reset
              </button>
              <button onClick={saveLayout} className="btn btn-primary text-xs py-1.5 px-3">
                <Save className="w-3.5 h-3.5 mr-1" />Save Layout
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn btn-ghost text-xs py-1.5 px-3">
              <Settings className="w-3.5 h-3.5 mr-1" />Customize
            </button>
          )}
        </div>
      </div>

      {/* Edit mode widget list (show hidden widgets too) */}
      {isEditing && (
        <div className="card rounded-[16px] p-4 flex flex-col gap-3">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">All Widgets</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {widgets.map(w => (
              <div
                key={w.id}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                  w.visible
                    ? 'border-purple-500/30 bg-purple-500/10'
                    : 'border-white/5 bg-white/3'
                }`}
                onClick={() => toggleVisible(w.id)}
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${w.visible ? 'bg-purple-400' : 'bg-slate-600'}`} />
                <span className="text-[10px] font-bold text-slate-300 truncate">{w.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reorderable widget grid */}
      <Reorder.Group
        axis="y"
        values={widgets}
        onReorder={setWidgets}
        className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-4"
      >
        {visibleWidgets.map(widget => (
          <Widget
            key={widget.id}
            widget={widget}
            onToggleVisible={toggleVisible}
            onToggleLocked={toggleLocked}
            onRemove={(id) => setWidgets(prev => prev.filter(w => w.id !== id))}
            onResize={cycleSize}
            data={data}
            isEditing={isEditing}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}
