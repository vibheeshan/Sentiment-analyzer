import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, LayoutDashboard, PlusCircle, History, Bell, Settings,
  Activity, Globe, Hash, LayoutGrid, Star, Target, TrendingUp, Users,
  Image, ChevronLeft, ChevronRight, LogOut, Zap, RefreshCw,
  Brain, MapPin, Lightbulb, Heart, Crosshair, BarChart2, ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard'        },
  { key: 'analyze',    icon: PlusCircle,       label: 'New Analysis'     },
  { key: 'advanced',   icon: Zap,              label: 'Advanced AI'      },
  { key: 'export',     icon: RefreshCw,        label: 'Export & Share'   },
  { key: 'history',    icon: History,          label: 'History'          },
  { key: 'alerts',     icon: Bell,             label: 'Alerts', isBadge: true },
];

const ADVANCED_ITEMS = [
  { key: 'intent',     icon: Brain,        label: 'Intent Analysis'    },
  { key: 'ner',        icon: Crosshair,    label: 'Entity Recognition' },
  { key: 'emotions',   icon: Heart,        label: 'Emotion Detection'  },
  { key: 'keywords',   icon: BarChart2,    label: 'Keyword Analytics'  },
  { key: 'geo',        icon: MapPin,       label: 'Geo Analytics'      },
  { key: 'ai-insights',icon: Lightbulb,    label: 'AI Insights'        },
  { key: 'realtime',   icon: Activity,     label: 'Real-Time Monitor'  },
  { key: 'multisource',icon: Globe,        label: 'Multi-Source'       },
  { key: 'visual',     icon: Image,        label: 'Visual Analysis'    },
  { key: 'topics',     icon: Hash,         label: 'Topic Discovery'    },
  { key: 'dashboards', icon: LayoutGrid,   label: 'Custom Dashboards'  },
  { key: 'reviews',    icon: Star,         label: 'Review Aggregator'  },
  { key: 'absa',       icon: Target,       label: 'Aspect Sentiment'   },
  { key: 'forecast',   icon: TrendingUp,   label: 'Forecasting'        },
  { key: 'benchmark',  icon: Users,        label: 'Benchmarking'       },
  { key: 'settings',   icon: Settings,     label: 'Settings'           },
];

function NavButton({ item, isActive, isCollapsed, onClick, badge }) {
  return (
    <button
      type="button"
      onClick={() => onClick(item.key)}
      className={`group nav-item w-full relative flex items-center justify-between ${isActive ? 'active' : ''}`}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="flex items-center gap-3 min-w-0 flex-1">
        <span className="flex h-5 w-5 items-center justify-center">
          <item.icon className="nav-icon flex-shrink-0" />
        </span>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[13px] font-bold truncate"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {badge > 0 && !isCollapsed && (
        <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      {isCollapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 z-[var(--z-dropdown)] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900/95 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-2">
          {item.label}
          {badge > 0 && <span className="ml-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px]">{badge}</span>}
        </div>
      )}
    </button>
  );
}

export default function Sidebar({ activeTab, setActiveTab, unreadCount = 0, onLogout, isMobileOpen = false, onMobileClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavClick = useCallback((key) => {
    setActiveTab(key);
    if (onMobileClose) onMobileClose();
  }, [setActiveTab, onMobileClose]);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-backdrop"
            onClick={onMobileClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Inner padding wrapper */}
        <div className="flex h-full flex-col" style={{ padding: isCollapsed ? '16px 8px' : '18px 12px', alignItems: isCollapsed ? 'center' : 'stretch' }}>

          {/* Logo & Collapse Header */}
          <div className={`mb-5 flex items-center flex-shrink-0 ${isCollapsed ? 'flex-col justify-center gap-3' : 'justify-between'} px-2`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} min-w-0`}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30 flex-shrink-0">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="font-black text-slate-800 dark:text-slate-100 tracking-tight text-[17px] leading-none">BrandPulse</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 mt-0.5">Enterprise Suite</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Collapse toggle — desktop only */}
            <button
              type="button"
              onClick={() => setIsCollapsed(c => !c)}
              className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100/80 text-slate-500 transition-all hover:border-purple-500/50 hover:text-slate-800 dark:border-white/10 dark:bg-white/5 dark:hover:text-white md:flex"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed
                ? <ChevronRight className="w-3.5 h-3.5" />
                : <ChevronLeft  className="w-3.5 h-3.5" />
              }
            </button>
          </div>

          {/* Nav — scrollable */}
          <div className="sidebar-scroll flex flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden">

            {/* Main Panel */}
            <div className="flex flex-col gap-0.5">
              {!isCollapsed && (
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-2 mb-1">Main Panel</span>
              )}
              {NAV_ITEMS.map(item => (
                <NavButton
                  key={item.key}
                  item={item}
                  isActive={activeTab === item.key}
                  isCollapsed={isCollapsed}
                  onClick={handleNavClick}
                  badge={item.isBadge ? unreadCount : 0}
                />
              ))}
            </div>

          {/* NLP Analytics */}
            <div className="flex flex-col gap-0.5">
              {!isCollapsed && (
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-500/70 px-2 mb-1">🧠 NLP Analytics</span>
              )}
              {ADVANCED_ITEMS.slice(0, 6).map(item => (
                <NavButton
                  key={item.key}
                  item={item}
                  isActive={activeTab === item.key}
                  isCollapsed={isCollapsed}
                  onClick={handleNavClick}
                />
              ))}
            </div>

            {/* Advanced Features */}
            <div className="flex flex-col gap-0.5">
              {!isCollapsed && (
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-2 mb-1">Advanced</span>
              )}
              {ADVANCED_ITEMS.slice(6).map(item => (
                <NavButton
                  key={item.key}
                  item={item}
                  isActive={activeTab === item.key}
                  isCollapsed={isCollapsed}
                  onClick={handleNavClick}
                />
              ))}
            </div>
          </div>

          {/* User Profile Footer */}
          <div className={`mt-4 flex flex-shrink-0 items-center justify-between border-t border-white/5 pt-4 ${isCollapsed ? 'flex-col gap-3' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                BA
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 whitespace-nowrap">Brand Analyst</div>
                    <div className="text-[9px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">PRO Client</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={onLogout}
              className="btn btn-icon btn-ghost flex-shrink-0"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
