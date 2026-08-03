/**
 * BrandPulse Reusable UI Components
 * Card, Button, Input, MetricCard, Section, Badge
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Card ──────────────────────────────────────────────────────── */
export function Card({ children, className = '', noscale = false, style, ...props }) {
  return (
    <div
      className={`${noscale ? 'card-noscale' : 'card'} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Section ───────────────────────────────────────────────────── */
export function Section({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            {title && <h3 className="section-title">{title}</h3>}
            {subtitle && <p className="body-sm mt-1">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/* ─── Button ─────────────────────────────────────────────────────── */
export function Button({
  children,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    ghost:   'btn-ghost',
    danger:  'btn-danger',
  }[variant] || 'btn-ghost';

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    icon: 'btn-icon',
  }[size] || '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClass} ${loading ? 'btn-loading' : ''} ${className}`}
      aria-busy={loading}
      {...props}
    >
      {!loading && Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children && <span>{children}</span>}
      {!loading && iconRight && <iconRight className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
}

/* ─── Input ──────────────────────────────────────────────────────── */
export function Input({
  label,
  hint,
  className = '',
  multiline = false,
  rows = 4,
  ...props
}) {
  const Comp = multiline ? 'textarea' : 'input';
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <Comp
        className={`input ${multiline ? '' : ''} ${className}`}
        rows={multiline ? rows : undefined}
        {...props}
      />
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}

/* ─── MetricCard ─────────────────────────────────────────────────── */
export function MetricCard({ label, value, icon: Icon, color, suffix = '', sparklineData, animate = true }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="metric-card"
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="metric-label truncate">{label}</span>
        <span className="metric-value" style={{ color }}>
          {animate
            ? <AnimatedNumber value={value} />
            : value}
          {suffix}
        </span>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {Icon && (
          <div className="metric-icon" style={{ background: `${color}18`, color }}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        {sparklineData && (
          <Sparkline data={sparklineData} color={color} />
        )}
      </div>
    </motion.div>
  );
}

/* ─── Animated Number ───────────────────────────────────────────── */
export function AnimatedNumber({ value, duration = 1.4 }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    const end = parseFloat(value);
    if (isNaN(end)) { setDisplay(value); return; }
    let start = 0;
    const totalFrames = 50;
    const inc = end / totalFrames;
    const ms  = (duration * 1000) / totalFrames;
    const t = setInterval(() => {
      start += inc;
      if (start >= end) { setDisplay(Number.isInteger(end) ? end : parseFloat(end.toFixed(1))); clearInterval(t); }
      else { setDisplay(Number.isInteger(end) ? Math.floor(start) : parseFloat(start.toFixed(1))); }
    }, ms);
    return () => clearInterval(t);
  }, [value, duration]);
  return <>{display}</>;
}

/* ─── Sparkline ─────────────────────────────────────────────────── */
export function Sparkline({ data = [], color = '#0ea5e9', width = 56, height = 28 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

/* ─── Status Dot ─────────────────────────────────────────────────── */
export function StatusDot({ active = true, color = '#10b981' }) {
  return (
    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
      {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: color }} />}
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
    </span>
  );
}

/* ─── Empty State ────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center">
          <Icon className="w-7 h-7 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      {title && <p className="text-base font-extrabold text-slate-800 dark:text-slate-300">{title}</p>}
      {description && <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}

/* ─── Tab Bar ────────────────────────────────────────────────────── */
export function TabBar({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5 ${className}`}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            active === t.key
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Toast ─────────────────────────────────────────────────────── */
export function Toast({ message, tone = 'success', visible = false, onClose }) {
  const toneClasses = {
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
    error: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-200',
    info: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-200',
  };

  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className={`fixed bottom-6 left-1/2 z-[var(--z-toast)] -translate-x-1/2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md ${toneClasses[tone] || toneClasses.info}`}
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-current" />
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Confirm Dialog ─────────────────────────────────────────────── */
export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[var(--z-overlay-backdrop)] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-md rounded-[22px] border border-slate-200 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900/95"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-3">
              <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{title}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>{cancelLabel}</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={onConfirm}>{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Tooltip card (fixed position) ─────────────────────────────── */
export function TooltipCard({ children, style }) {
  return (
    <div
      className="fixed pointer-events-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 shadow-2xl"
      style={{ zIndex: 'var(--z-overlay-panel)', ...style }}
    >
      {children}
    </div>
  );
}
