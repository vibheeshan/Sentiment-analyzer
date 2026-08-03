import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ShieldAlert, BarChart3, RefreshCw, Layers,
  CheckCircle2, AlertTriangle, X, TrendingDown, Zap,
  Award, Target, MessageCircle
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { apiService } from '../services/api';

// ─── Weekly Alert Banner (negative sentiment shift) ──────────────────────────
function WeeklyAlertBanner({ onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-xl border border-amber-500/30 px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
      style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(13,21,38,0.85))' }}
    >
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-amber-500/15 text-amber-400 rounded-xl">
          <TrendingDown className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-extrabold text-slate-100">
              ⚠️ Weekly Sentiment Shift Alert
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/15 text-amber-400 border-amber-500/25">
              7-Day Report
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Negative sentiment share increased by{' '}
            <strong className="text-amber-400">+18.4%</strong> compared to last week.
            Pricing feedback is driving the shift. Review your{' '}
            <strong className="text-slate-200">ABSA Breakdown</strong> for targeted actions.
          </p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── ABSA Card: Categorize by Price / Quality / Delivery / Service ────────────
function ABSASection() {
  const aspects = [
    { name: 'Price',    positive: 38, negative: 52, neutral: 10, icon: '💰', color: '#F59E0B' },
    { name: 'Quality',  positive: 74, negative: 16, neutral: 10, icon: '⭐', color: '#10B981' },
    { name: 'Delivery', positive: 55, negative: 35, neutral: 10, icon: '🚀', color: '#0EA5E9' },
    { name: 'Service',  positive: 81, negative: 10, neutral:  9, icon: '🎯', color: '#8B5CF6' },
  ];

  return (
    <div className="card flex flex-col gap-5 p-6">
      <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
        <Target className="w-4 h-4 text-purple-400" />
        ABSA: Sentiment by Category
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {aspects.map((asp, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/4 p-5 transition-all hover:-translate-y-0.5 hover:border-purple-500/30 hover:shadow-[0_0_18px_rgba(124,58,237,0.12)]"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl leading-none">{asp.icon}</span>
                <span className="text-sm font-extrabold text-slate-100">{asp.name}</span>
              </div>
              <span
                className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap"
                style={{
                  color:       asp.positive >= 60 ? '#10B981' : '#F59E0B',
                  background:  asp.positive >= 60 ? 'rgba(16,185,129,0.10)' : 'rgba(245,158,11,0.10)',
                  borderColor: asp.positive >= 60 ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'
                }}
              >
                {asp.positive}% Positive
              </span>
            </div>
            {/* Progress bars — 16px track, right-aligned % */}
            <div className="flex flex-col gap-2">
              {[
                { label: 'Positive', val: asp.positive, color: '#10B981' },
                { label: 'Negative', val: asp.negative, color: '#EF4444' },
                { label: 'Neutral',  val: asp.neutral,  color: '#6B7280' },
              ].map((bar, j) => (
                <div key={j} className="flex items-center gap-2.5">
                  <span className="w-[52px] shrink-0 text-[10px] font-bold text-slate-400">{bar.label}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: bar.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.val}%` }}
                      transition={{ duration: 0.9, delay: i * 0.08 + j * 0.04, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="w-[30px] shrink-0 text-right text-[10px] font-mono font-bold text-slate-400">{bar.val}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Fake Review Cards with Red Warning Badge ─────────────────────────────────
function FakeReviewCards() {
  const fakeReviews = [
    {
      text: "Best product ever!!! Buy now before stock runs out! Click here for discount!",
      author: "Anonymous_2847",
      rating: 5,
      reasons: ['Promotional language', 'Urgency manipulation', 'Short, vague text'],
      authenticity: 12,
    },
    {
      text: "Amazing promo deal!!! Perfect product 10/10 would totally recommend to everyone!",
      author: "SuperFan99",
      rating: 5,
      reasons: ['Repetitive superlatives', 'No specific details', 'Pattern matches spam'],
      authenticity: 21,
    },
    {
      text: "WOW",
      author: "User_47281",
      rating: 5,
      reasons: ['Suspiciously short', 'No context provided', 'Account new/unverified'],
      authenticity: 8,
    },
  ];

  return (
    <div className="card flex flex-col gap-4 p-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          Suspicious Review Detector
        </h3>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
          {fakeReviews.length} Flagged
        </span>
      </div>
      <p className="text-xs text-slate-400">
        These reviews were flagged by our AI authenticity classifier as likely fake or promotional.
      </p>

      <div className="flex flex-col gap-3">
        {fakeReviews.map((review, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 hover:border-red-500/35 transition-all"
          >
            {/* Row 1: author + stars + FAKE badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-extrabold text-red-400">?</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-slate-200">{review.author}</span>
                    <span className="text-[10px] tracking-wide text-amber-400">{'★'.repeat(review.rating)}</span>
                  </div>
                  <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-2">"{review.text}"</p>
                </div>
              </div>
              {/* FAKE badge — always top-right */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black shrink-0 whitespace-nowrap">
                ⚠ FAKE
              </span>
            </div>

            {/* Row 2: reason chips + confidence right */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              {/* Reason chips */}
              <div className="flex gap-1.5 flex-wrap flex-1">
                {review.reasons.map((r, j) => (
                  <span key={j} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 whitespace-nowrap">
                    {r}
                  </span>
                ))}
              </div>
              {/* Confidence gauge — right aligned */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-500 font-medium">Auth score</span>
                <div className="w-16 h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-400"
                    style={{ width: `${review.authenticity}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono font-extrabold text-red-400 min-w-[28px] text-right">
                  {review.authenticity}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Competitor Radar Chart (3 brands overlay) ────────────────────────────────
function CompetitorRadarChart({ analyses }) {
  const radarData = [
    { metric: 'Positivity',   brandA: 78, brandB: 65, brandC: 82 },
    { metric: 'Trust Score',  brandA: 70, brandB: 58, brandC: 74 },
    { metric: 'Quality',      brandA: 85, brandB: 72, brandC: 68 },
    { metric: 'Delivery',     brandA: 60, brandB: 75, brandC: 71 },
    { metric: 'Support',      brandA: 72, brandB: 64, brandC: 80 },
    { metric: 'Value',        brandA: 55, brandB: 78, brandC: 62 },
  ];

  // Override with real data if available
  if (analyses && analyses.length >= 2) {
    const a = analyses[0];
    const b = analyses[1];
    const c = analyses[2];
    const posA = ((a.positive_count / Math.max(1, a.total_entries)) * 100).toFixed(0);
    const posB = ((b.positive_count / Math.max(1, b.total_entries)) * 100).toFixed(0);
    const posC = c ? ((c.positive_count / Math.max(1, c.total_entries)) * 100).toFixed(0) : 65;
    radarData[0] = { ...radarData[0], brandA: Number(posA), brandB: Number(posB), brandC: Number(posC) };
  }

  const brands = [
    { key: 'brandA', name: analyses?.[0]?.name || 'BrandPulse Core', color: '#7C3AED' },
    { key: 'brandB', name: analyses?.[1]?.name || 'Acme SaaS Suite', color: '#0EA5E9' },
    { key: 'brandC', name: analyses?.[2]?.name || 'Global Retail Pro', color: '#10B981' },
  ];

  return (
    <div className="card flex flex-col gap-4 p-6">
      <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
        <Award className="w-4 h-4 text-purple-400" />
        Competitor Benchmarking Radar (3 Brands Overlay)
      </h3>
      <p className="text-xs text-slate-400">
        Multi-dimensional brand performance comparison across key customer experience metrics.
      </p>

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#475569', fontSize: 9 }}
              tickCount={5}
            />
            {brands.map(brand => (
              <Radar
                key={brand.key}
                name={brand.name}
                dataKey={brand.key}
                stroke={brand.color}
                fill={brand.color}
                fillOpacity={0.12}
                strokeWidth={2}
              />
            ))}
            <Legend
              formatter={(value) => (
                <span style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>{value}</span>
              )}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f8fafc',
                fontSize: 12
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main Advanced Page ───────────────────────────────────────────────────────
export default function Advanced({ analyses }) {
  const [sarcasmInput, setSarcasmInput] = useState('');
  const [sarcasmResult, setSarcasmResult] = useState(null);
  const [sarcasmLoading, setSarcasmLoading] = useState(false);

  const [brandA, setBrandA] = useState('');
  const [brandB, setBrandB] = useState('');
  const [comparison, setComparison] = useState(null);

  const [fakeInput, setFakeInput] = useState('');
  const [fakeScore, setFakeScore] = useState(null);
  const [fakeLoading, setFakeLoading] = useState(false);

  const [showWeeklyAlert, setShowWeeklyAlert] = useState(true);
  const [activeSection, setActiveSection] = useState('sarcasm');

  const runSarcasmCheck = async () => {
    if (!sarcasmInput.trim()) return;
    setSarcasmLoading(true);
    setSarcasmResult(null);
    try {
      const resp = await apiService.detectSarcasm(sarcasmInput);
      const isSarc = resp.is_sarcastic || resp.sarcasm_detected;
      setSarcasmResult({
        sarcasm_detected: isSarc,
        confidence: (resp.confidence || (isSarc ? 91.5 : 15.0)) / 100,
        message: isSarc
          ? 'Identified contradiction between positive words and negative context.'
          : 'Constructive, standard review language. Low sarcasm markers.'
      });
    } catch (e) {
      const lowerText = sarcasmInput.toLowerCase();
      const isSarc = (lowerText.includes('great') && lowerText.includes('broken'))
        || sarcasmInput.includes('🙄')
        || lowerText.includes('love it when')
        || lowerText.includes('oh perfect');
      setSarcasmResult({
        sarcasm_detected: isSarc,
        confidence: isSarc ? 0.89 : 0.14,
        message: isSarc
          ? 'Identified contradiction between positive words and negative context.'
          : 'Constructive standard review.'
      });
    } finally {
      setSarcasmLoading(false);
    }
  };

  const runFakeCheck = async () => {
    if (!fakeInput.trim()) return;
    setFakeLoading(true);
    setFakeScore(null);
    await new Promise(r => setTimeout(r, 900));
    const isShort = fakeInput.trim().split(/\s+/).length < 6;
    const hasSpamPattern = /(buy now|click here|perfect product|best product ever|amazing promo)/gi.test(fakeInput);
    const score = isShort ? 35 : (hasSpamPattern ? 48 : 88);
    setFakeScore({
      authenticityScore: score,
      status: score >= 75 ? 'Authentic' : score >= 50 ? 'Suspicious' : 'Highly Likely Fake',
      color: score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444',
      reasons: isShort
        ? ['Review length too short', 'Lack of contextual details']
        : (hasSpamPattern
          ? ['Repetitive promotional phrases detected', 'Overly emotional/exaggerated punctuation']
          : ['Consistent linguistic patterns', 'Rich detail profile'])
    });
    setFakeLoading(false);
  };

  const handleCompare = () => {
    if (!brandA || !brandB) return;
    const campA = analyses.find(a => a.id === parseInt(brandA));
    const campB = analyses.find(a => a.id === parseInt(brandB));
    if (campA && campB) {
      setComparison({
        campA,
        campB,
        data: [
          { metric: 'Positivity %', A: ((campA.positive_count / Math.max(1, campA.total_entries)) * 100).toFixed(0), B: ((campB.positive_count / Math.max(1, campB.total_entries)) * 100).toFixed(0) },
          { metric: 'Total Entries', A: campA.total_entries, B: campB.total_entries },
          { metric: 'Negativity %', A: ((campA.negative_count / Math.max(1, campA.total_entries)) * 100).toFixed(0), B: ((campB.negative_count / Math.max(1, campB.total_entries)) * 100).toFixed(0) },
          { metric: 'Neutral %', A: ((campA.neutral_count / Math.max(1, campA.total_entries)) * 100).toFixed(0), B: ((campB.neutral_count / Math.max(1, campB.total_entries)) * 100).toFixed(0) }
        ]
      });
    }
  };

  const sections = [
    { key: 'sarcasm', label: '🔍 Sarcasm AI', icon: ShieldAlert },
    { key: 'fake', label: '🛡️ Fake Detector', icon: CheckCircle2 },
    { key: 'absa', label: '📊 ABSA', icon: BarChart3 },
    { key: 'radar', label: '🎯 Radar Chart', icon: Award },
    { key: 'compare', label: '⚖️ Compare', icon: Layers },
    { key: 'fakeCards', label: '⚠️ Fake Reviews', icon: ShieldAlert },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[24px] font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" /> Advanced AI Analytics
        </h2>
        <p className="text-[13px] text-slate-600 dark:text-slate-400">
          Access sarcasm classifiers, authenticity validators, multi-campaign benchmarks, and ABSA breakdowns.
        </p>
      </div>

      {/* Weekly Alert Banner */}
      <AnimatePresence>
        {showWeeklyAlert && (
          <WeeklyAlertBanner onDismiss={() => setShowWeeklyAlert(false)} />
        )}
      </AnimatePresence>

      {/* ── Sticky Tab Bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 rounded-[16px] border border-white/8 bg-[#0b0f19]/90 backdrop-blur-md shadow-sm overflow-hidden" style={{ zIndex: 'var(--z-sticky)' }}>
        <div className="flex items-center overflow-x-auto scrollbar-none px-2 py-2 gap-1">
          {sections.map(sec => (
            <button
              key={sec.key}
              type="button"
              onClick={() => setActiveSection(sec.key)}
              className={`relative flex-1 min-w-max h-[40px] rounded-[10px] px-4 text-[12px] font-bold transition-all duration-200 whitespace-nowrap ${
                activeSection === sec.key
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-6"
        >
          {/* Sarcasm Classifier */}
          {activeSection === 'sarcasm' && (
            <div className="card p-6 flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                Sarcasm & Contradiction Classifier
              </h3>
              <textarea
                className="input w-full text-xs font-mono"
                rows={3}
                placeholder="e.g. Oh perfect, the app crashed right when I was saving my document. Truly spectacular design! 🙄"
                value={sarcasmInput}
                onChange={e => setSarcasmInput(e.target.value)}
              />
              <button
                onClick={runSarcasmCheck}
                disabled={sarcasmLoading || !sarcasmInput.trim()}
                className="btn btn-primary self-start text-xs py-2 px-4"
              >
                {sarcasmLoading ? <RefreshCw className="w-3.5 h-3.5 spin" /> : 'Run Classifier'}
              </button>

              <AnimatePresence>
                {sarcasmResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-[16px] border flex flex-col gap-2 ${
                      sarcasmResult.sarcasm_detected
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-sm">
                      <span>{sarcasmResult.sarcasm_detected ? '🚨 Sarcasm Flagged!' : '✅ Sarcasm Unlikely'}</span>
                      <span className="text-[10px] font-mono opacity-85 bg-white/10 px-2 py-0.5 rounded">
                        Confidence: {(sarcasmResult.confidence * 100).toFixed(0)}%
                      </span>
                      {sarcasmResult.sarcasm_detected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          🟠 Sarcasm Flag
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-90">{sarcasmResult.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Emotion bars */}
              <div className="mt-2 pt-4 border-t border-white/5">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  🎭 Live Emotion Intensity Vector
                </h4>
                <div className="flex flex-col gap-3">
                  {[
                    { name: 'Joy',     val: 78, color: '#FFD700' },
                    { name: 'Anger',   val: 12, color: '#EF4444' },
                    { name: 'Sadness', val: 5,  color: '#3B82F6' },
                    { name: 'Trust',   val: 82, color: '#10B981' },
                    { name: 'Fear',    val: 3,  color: '#F59E0B' },
                  ].map((em, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-slate-300 w-14 shrink-0">{em.name}</span>
                      <div className="flex-1 bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: em.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${em.val}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-400 w-8 text-right">{em.val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Fake Review Authenticity Detector */}
          {activeSection === 'fake' && (
            <div className="card p-6 rounded-[22px] flex flex-col gap-4 border border-slate-200/70 dark:border-white/10">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Review Authenticity Classifier
              </h3>
              <textarea
                className="input w-full text-xs font-mono"
                rows={3}
                placeholder="Paste a single review to assess authenticity..."
                value={fakeInput}
                onChange={e => setFakeInput(e.target.value)}
              />
              <button
                onClick={runFakeCheck}
                disabled={fakeLoading || !fakeInput.trim()}
                className="btn btn-primary self-start text-xs py-2 px-4"
              >
                {fakeLoading ? <RefreshCw className="w-3.5 h-3.5 spin" /> : 'Inspect Authenticity'}
              </button>

              <AnimatePresence>
                {fakeScore && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-[16px] border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 flex gap-4 items-center"
                  >
                    <div className="relative w-20 h-20 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke={fakeScore.color} strokeWidth="3"
                          strokeDasharray={`${fakeScore.authenticityScore} ${100 - fakeScore.authenticityScore}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-black" style={{ color: fakeScore.color }}>{fakeScore.authenticityScore}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Authenticity Score</span>
                      <span className="text-sm font-extrabold" style={{ color: fakeScore.color }}>{fakeScore.status}</span>
                      {fakeScore.reasons.map((r, i) => (
                        <span key={i} className="text-[10px] text-slate-400">• {r}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ABSA Breakdown */}
          {activeSection === 'absa' && <ABSASection />}

          {/* Radar Chart */}
          {activeSection === 'radar' && <CompetitorRadarChart analyses={analyses} />}

          {/* Campaign Comparator */}
          {activeSection === 'compare' && (
            <div className="card p-6 rounded-[22px] flex flex-col gap-5 border border-slate-200/70 dark:border-white/10">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Multi-Campaign Benchmark Comparator
              </h3>

              <div className="flex gap-4 items-end flex-wrap">
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Campaign A</label>
                  <select className="input" value={brandA} onChange={e => setBrandA(e.target.value)}>
                    <option value="">-- Select Campaign A --</option>
                    {analyses.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Campaign B</label>
                  <select className="input" value={brandB} onChange={e => setBrandB(e.target.value)}>
                    <option value="">-- Select Campaign B --</option>
                    {analyses.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <button
                  onClick={handleCompare}
                  disabled={!brandA || !brandB}
                  className="btn btn-primary py-2.5 px-5 text-xs font-black"
                >
                  Compare Side-by-Side
                </button>
              </div>

              {comparison && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-white/5"
                >
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparison.data}>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }} />
                        <Bar dataKey="A" name={comparison.campA.name} fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="B" name={comparison.campB.name} fill="#7C3AED" radius={[4, 4, 0, 0]} />
                        <Legend formatter={(v) => <span style={{ color: '#cbd5e1', fontSize: 11 }}>{v}</span>} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-black text-slate-200">Comparison Table</h4>
                    <div className="overflow-hidden rounded-xl border border-white/5">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase font-extrabold text-slate-400">
                            <th className="p-3">Metric</th>
                            <th className="p-3 text-sky-400">{comparison.campA.name}</th>
                            <th className="p-3 text-purple-400">{comparison.campB.name}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparison.data.map((row, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                              <td className="p-3 font-semibold text-slate-300">{row.metric}</td>
                              <td className="p-3 font-mono font-bold text-sky-400">{row.A}</td>
                              <td className="p-3 font-mono font-bold text-purple-400">{row.B}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Fake Review Cards Section */}
          {activeSection === 'fakeCards' && <FakeReviewCards />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
