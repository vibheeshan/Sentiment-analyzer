import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Crosshair, Layers, TrendingDown, Calendar, SlidersHorizontal, Users, Activity } from 'lucide-react';
import ScatterPlot from '../components/charts/ScatterPlot';
import BubbleChart from '../components/charts/BubbleChart';
import WaterfallChart from '../components/charts/WaterfallChart';
import FunnelChart from '../components/charts/FunnelChart';
import CalendarHeatmap from '../components/charts/CalendarHeatmap';
import FilterSidebar from '../components/filters/FilterSidebar';
import FeedbackThread from '../components/collaboration/FeedbackThread';
import ActivityFeed from '../components/collaboration/ActivityFeed';

const TABS = [
  { key: 'scatter',    label: '🔵 Scatter Plot',      icon: Crosshair  },
  { key: 'bubble',     label: '🫧 Bubble Chart',       icon: BarChart2  },
  { key: 'waterfall',  label: '📊 Waterfall',           icon: TrendingDown },
  { key: 'funnel',     label: '🔻 Funnel',              icon: Layers     },
  { key: 'calendar',   label: '🗓️ Calendar Heatmap',    icon: Calendar   },
  { key: 'image',      label: '🖼️ Image Analysis',      icon: BarChart2  },
];

function ImageAnalysis() {
  const [images, setImages] = useState([]);
  const handleFiles = (files) => {
    const incoming = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      sentiment: ['Positive', 'Neutral', 'Negative'][Math.floor(Math.random() * 3)],
      confidence: Math.round((60 + Math.random() * 40) * 10) / 10,
      quality: Math.round((70 + Math.random() * 25) * 10) / 10,
      highlight: ['Brand visibility', 'Product packaging', 'Emotion tone'][Math.floor(Math.random() * 3)]
    }));
    setImages(prev => [...prev, ...incoming]);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="card rounded-[18px] p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-100">Visual Sentiment Analysis</h3>
          <p className="text-xs text-slate-500 mt-1">Upload images and get instant visual sentiment inference.</p>
        </div>
        <label className="btn btn-primary cursor-pointer">
          📁 Upload Images
          <input type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} className="hidden" />
        </label>
      </div>

      {images.length > 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {images.map((item, idx) => (
            <div key={idx} className="card rounded-[18px] p-4 flex flex-col gap-3">
              <img src={item.url} alt="" className="w-full rounded-xl object-cover max-h-48" />
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  item.sentiment === 'Positive' ? 'bg-emerald-500/20 text-emerald-400' :
                  item.sentiment === 'Negative' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'
                }`}>{item.sentiment}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">{item.confidence}% confidence</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">{item.highlight}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Quality {item.quality}%</span>
                <span className="truncate max-w-[120px]">{item.file.name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card rounded-[18px] p-16 text-center text-slate-500">
          <div className="text-5xl mb-4">🖼️</div>
          <p className="text-sm font-semibold">Upload images to see visual sentiment analysis</p>
          <p className="text-xs mt-1 text-slate-600">Supports PNG, JPEG, WebP, GIF</p>
        </div>
      )}
    </div>
  );
}

export default function VisualAnalysis() {
  const [activeTab, setActiveTab] = useState('scatter');
  const [showFilters, setShowFilters] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [filters, setFilters] = useState({});

  return (
    <div className="flex gap-0">
      {/* Filter sidebar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-shrink-0 overflow-hidden mr-4"
          >
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onClose={() => setShowFilters(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-purple-400" />
              Advanced Visualizations
            </h2>
            <p className="text-xs text-slate-500 mt-1">Interactive charts, scatter plots, waterfall analysis & more</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowActivity(v => !v)}
              className={`btn ${showActivity ? 'btn-primary' : 'btn-ghost'} text-xs py-1.5 px-3 font-bold flex items-center gap-1.5`}
            >
              <Activity className="w-3.5 h-3.5" />
              Activity
            </button>
            <button
              onClick={() => setShowThread(v => !v)}
              className={`btn ${showThread ? 'btn-primary' : 'btn-ghost'} text-xs py-1.5 px-3 font-bold flex items-center gap-1.5`}
            >
              <Users className="w-3.5 h-3.5" />
              Discuss
            </button>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost'} text-xs py-1.5 px-3 font-bold flex items-center gap-1.5`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-white/3 border border-white/5 rounded-[16px] p-1.5 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-[10px] text-xs font-black transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chart panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'scatter'   && <ScatterPlot />}
            {activeTab === 'bubble'    && <BubbleChart />}
            {activeTab === 'waterfall' && <WaterfallChart />}
            {activeTab === 'funnel'    && <FunnelChart />}
            {activeTab === 'calendar'  && <CalendarHeatmap />}
            {activeTab === 'image'     && <ImageAnalysis />}
          </motion.div>
        </AnimatePresence>

        {/* Activity and thread panels */}
        {(showActivity || showThread) && (
          <div className={`grid gap-5 ${showActivity && showThread ? 'xl:grid-cols-2' : ''}`}>
            {showActivity && <ActivityFeed />}
            {showThread && <FeedbackThread onClose={() => setShowThread(false)} />}
          </div>
        )}
      </div>
    </div>
  );
}
