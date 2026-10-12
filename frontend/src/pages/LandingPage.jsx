import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  BarChart2,
  Layers,
  CheckCircle2,
  ArrowRight,
  Star,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Globe,
  Share2,
  Download,
  Play,
  HelpCircle,
  ChevronDown,
  Check,
  Users,
  Lock,
  ChevronRight,
  Sliders,
  BarChart3,
  LineChart,
  PieChart,
  Database,
  Mail,
  RefreshCw,
  Clock,
  Target,
  Smile,
  Frown,
  Meh,
  Heart,
  ExternalLink,
  Flame,
  Award,
  Radio,
  FileSpreadsheet,
  Workflow,
  LayoutDashboard
} from 'lucide-react';

export default function LandingPage({ onLoginClick, onSignupClick, onDemoClick, onDashboardClick, userSession }) {
  // Playground state
  const [demoInput, setDemoInput] = useState(
    "The new UI update is super slick and customer support resolved my billing issue in 5 minutes! However, battery drain is slightly higher on iOS."
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [demoResult, setDemoResult] = useState({
    score: 84,
    sentiment: 'Positive',
    emotion: 'Satisfaction / Joy',
    churnRisk: 'Low (12%)',
    aspects: [
      { name: 'UI / Design', sentiment: 'Positive', score: 95 },
      { name: 'Customer Support', sentiment: 'Positive', score: 98 },
      { name: 'Battery Performance', sentiment: 'Negative', score: 38 },
      { name: 'Billing', sentiment: 'Positive', score: 90 },
    ],
    action: 'Flag Battery Performance issue to Mobile Engineering team for the next sprint.'
  });

  // ROI Calculator state
  const [reviewVolume, setReviewVolume] = useState(15000);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Pricing Billing Toggle
  const [annualBilling, setAnnualBilling] = useState(true);

  // Active Feature Tab
  const [activeFeatureTab, setActiveFeatureTab] = useState('absa');

  // Active How-It-Works Step
  const [activeStep, setActiveStep] = useState(0);

  // Sample feedback presets for Playground
  const samplePresets = [
    {
      label: '🌟 Positive Review',
      text: "The new UI update is super slick and customer support resolved my billing issue in 5 minutes! However, battery drain is slightly higher on iOS.",
      result: {
        score: 84,
        sentiment: 'Positive',
        emotion: 'Satisfaction / Joy',
        churnRisk: 'Low (12%)',
        aspects: [
          { name: 'UI / Design', sentiment: 'Positive', score: 95 },
          { name: 'Customer Support', sentiment: 'Positive', score: 98 },
          { name: 'Battery Performance', sentiment: 'Negative', score: 38 },
          { name: 'Billing', sentiment: 'Positive', score: 90 },
        ],
        action: 'Flag Battery Performance issue to Mobile Engineering team for next sprint.'
      }
    },
    {
      label: '🚨 Critical Churn Warning',
      text: "App has been crashing every time I try to checkout for 3 days straight! Support hasn't responded. I am canceling my subscription today.",
      result: {
        score: 18,
        sentiment: 'Negative',
        emotion: 'Frustration / Anger',
        churnRisk: 'Critical (94%)',
        aspects: [
          { name: 'App Reliability', sentiment: 'Negative', score: 12 },
          { name: 'Checkout Process', sentiment: 'Negative', score: 10 },
          { name: 'Customer Support', sentiment: 'Negative', score: 15 },
        ],
        action: 'HIGH PRIORITY: Escalate to VIP Support & Operations team immediately.'
      }
    },
    {
      label: '⚖️ Mixed Product Feedback',
      text: "Pricing is very fair compared to competitors, but the documentation is hard to follow and API rate limits are too restrictive.",
      result: {
        score: 58,
        sentiment: 'Neutral / Mixed',
        emotion: 'Constructive Criticism',
        churnRisk: 'Moderate (42%)',
        aspects: [
          { name: 'Pricing', sentiment: 'Positive', score: 88 },
          { name: 'Documentation', sentiment: 'Negative', score: 30 },
          { name: 'API Rate Limits', sentiment: 'Negative', score: 35 },
        ],
        action: 'Route feedback to Developer Relations & Product Docs team.'
      }
    }
  ];

  const handleAnalyzePlayground = (presetText, presetResult) => {
    setAnalyzing(true);
    if (presetText) setDemoInput(presetText);
    setTimeout(() => {
      if (presetResult) {
        setDemoResult(presetResult);
      } else {
        const text = demoInput.toLowerCase();
        const isNeg = text.includes('crash') || text.includes('bad') || text.includes('cancel') || text.includes('slow') || text.includes('terrible');
        const isPos = text.includes('love') || text.includes('great') || text.includes('amazing') || text.includes('good') || text.includes('fast');
        
        let score = 70;
        let sentiment = 'Positive';
        let emotion = 'Approval';
        let churnRisk = 'Low (18%)';
        
        if (isNeg && !isPos) {
          score = 24;
          sentiment = 'Negative';
          emotion = 'Frustration';
          churnRisk = 'High (82%)';
        } else if (isNeg && isPos) {
          score = 54;
          sentiment = 'Mixed';
          emotion = 'Evaluation';
          churnRisk = 'Moderate (38%)';
        } else if (isPos) {
          score = 92;
          sentiment = 'Positive';
          emotion = 'Delight';
          churnRisk = 'Very Low (5%)';
        }

        setDemoResult({
          score,
          sentiment,
          emotion,
          churnRisk,
          aspects: [
            { name: 'Product Experience', sentiment: isNeg ? 'Negative' : 'Positive', score: isNeg ? 30 : 90 },
            { name: 'Customer Service', sentiment: isPos ? 'Positive' : 'Neutral', score: isPos ? 88 : 60 },
            { name: 'Overall Value', sentiment: score > 50 ? 'Positive' : 'Negative', score: score }
          ],
          action: isNeg ? 'High priority alert dispatched to customer success team.' : 'Positive sentiment captured for marketing testimonial.'
        });
      }
      setAnalyzing(false);
    }, 500);
  };

  // ROI Calculations
  const hoursSaved = Math.round((reviewVolume / 100) * 1.5);
  const revenueProtected = Math.round(reviewVolume * 4.2).toLocaleString();
  const speedupFactor = '12x';

  // Features List ("What We Do")
  const features = [
    {
      id: 'absa',
      icon: <Target className="w-6 h-6 text-purple-400" />,
      title: 'Aspect-Based Sentiment Analysis (ABSA)',
      badge: 'Core Engine',
      description: 'Go beyond generic positive or negative numbers. Dissect customer feedback into pinpoint attributes including Pricing, Customer Support, UI/UX, Performance, and Shipping Quality.',
      points: [
        'Automatic feature extraction & category tagging',
        'Entity-level sentiment scoring (0–100)',
        'Granular root-cause diagnostics for product teams'
      ],
      previewStat: '6 Product Aspects Tracked'
    },
    {
      id: 'forecast',
      icon: <TrendingUp className="w-6 h-6 text-sky-400" />,
      title: 'Predictive Sentiment Horizon (30-Day)',
      badge: 'AI Predictive',
      description: 'Anticipate brand perception shifts before they impact revenue. Machine learning time-series models project customer sentiment trends 7 to 30 days ahead based on historical signal velocity.',
      points: [
        'Proprietary time-series forecasting models',
        'Early churn velocity risk indicator',
        'Pre & post campaign sentiment trajectory'
      ],
      previewStat: '30-Day Trend Horizon'
    },
    {
      id: 'alerts',
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: 'Real-Time Anomaly & Spike Alerts',
      badge: 'Instant Action',
      description: 'Never get blindsided by a viral customer issue or PR crisis. Configure automated triggers that send instant Slack, Email, or Webhook notifications the moment negative sentiment spikes.',
      points: [
        'Configurable threshold & velocity alert rules',
        'Instant multi-channel webhook dispatch',
        'Crisis escalation matrix & team assignment'
      ],
      previewStat: '< 50ms Detection Time'
    },
    {
      id: 'emotions',
      icon: <Smile className="w-6 h-6 text-emerald-400" />,
      title: 'Multimodal Emotion & Intent Extraction',
      badge: 'Deep NLP',
      description: 'Understand the human emotion driving customer behavior. Classify feedback into Joy, Anger, Trust, Sadness, or Fear, and instantly detect user intent such as Bug Reports or Churn Risk.',
      points: [
        '8 Emotion spectrum neural classification',
        'User intent identification (Bug, Praise, Churn, Feature)',
        'Contextual sarcasm and nuance detection'
      ],
      previewStat: '98.6% Classification Accuracy'
    },
    {
      id: 'multisource',
      icon: <Globe className="w-6 h-6 text-indigo-400" />,
      title: 'Omnichannel Data Feed Ingestion',
      badge: 'Unified Stream',
      description: 'Aggregate customer signals from Twitter/X, Reddit, Apple App Store, Google Play, Amazon Reviews, Trustpilot, Zendesk tickets, and CSV/JSON uploads into a single unified workspace.',
      points: [
        '1-Click OAuth & API live data connectors',
        'Automated continuous scheduled sync feeds',
        'High-speed batch CSV/Excel processing engine'
      ],
      previewStat: '25+ Supported Data Sources'
    },
    {
      id: 'benchmark',
      icon: <BarChart2 className="w-6 h-6 text-pink-400" />,
      title: 'Competitor Brand Benchmarking',
      badge: 'Market Intel',
      description: 'Benchmark your brand sentiment directly against key industry competitors. Spot competitor vulnerabilities, track market sentiment share, and compare feature satisfaction head-to-head.',
      points: [
        'Direct head-to-head brand comparison metrics',
        'Industry sentiment index & market share',
        'Feature-by-feature competitive gap analysis'
      ],
      previewStat: 'Real-Time Market Comparison'
    }
  ];

  // How It Works Steps
  const steps = [
    {
      num: '01',
      title: 'Connect Feedback Channels',
      subtitle: 'Data Ingestion',
      description: 'Connect social feeds, App Store reviews, customer survey tools, or drag-and-drop raw review CSV files into BrandPulse in seconds.',
      icon: <Database className="w-6 h-6 text-purple-400" />,
      detail: 'Supports Twitter/X, Reddit, Amazon, Trustpilot, App Stores, and Custom APIs.'
    },
    {
      num: '02',
      title: 'Neural NLP & Aspect Extraction',
      subtitle: 'AI Processing',
      description: 'Our neural models process incoming text in milliseconds—extracting product aspects, detecting emotion, calculating sentiment scores, and identifying churn risk.',
      icon: <Cpu className="w-6 h-6 text-sky-400" />,
      detail: 'Sub-50ms inference with entity recognition and 8-emotion spectrum tagging.'
    },
    {
      num: '03',
      title: 'Real-Time Dashboards & Forecasts',
      subtitle: 'Actionable Intelligence',
      description: 'Visualize your Brand Health Score, aspect heatmaps, keyword trends, and 30-day sentiment trajectory through dynamic interactive charts.',
      icon: <BarChart3 className="w-6 h-6 text-amber-400" />,
      detail: 'Interactive charts, anomaly banners, heatmap calendars, and word clouds.'
    },
    {
      num: '04',
      title: 'Automate Alerts & Take Action',
      subtitle: 'Close the Loop',
      description: 'Set custom anomaly threshold rules to automatically alert team channels, trigger Webhooks, export executive reports, and resolve customer issues fast.',
      icon: <Workflow className="w-6 h-6 text-emerald-400" />,
      detail: 'Integrates with Slack, Email, Webhooks, and PDF/CSV scheduled report builders.'
    }
  ];

  // FAQ Items
  const faqs = [
    {
      q: 'What makes BrandPulse different from standard social listening tools?',
      a: 'BrandPulse uses aspect-based sentiment analysis (ABSA) combined with predictive machine learning models. Instead of giving you just an overall positive/negative ratio, BrandPulse breaks down feedback into specific product attributes (e.g. Price, Support, UI) and predicts 30-day sentiment trajectory curves before issues turn into customer churn.'
    },
    {
      q: 'Which data sources can I integrate with BrandPulse?',
      a: 'BrandPulse supports direct integrations with Twitter/X, Reddit, Apple App Store, Google Play Store, Amazon Reviews, Trustpilot, Zendesk, Google Reviews, as well as custom CSV, Excel, and JSON data file uploads.'
    },
    {
      q: 'How accurate is the sentiment classification engine?',
      a: 'Our neural models achieve over 99.4% accuracy on domain-specific customer feedback benchmarks. The engine handles sarcasm, mixed reviews, product jargon, and multi-aspect feedback gracefully.'
    },
    {
      q: 'Can I set up instant alerts for negative feedback spikes?',
      a: 'Yes! BrandPulse includes custom anomaly detection rules. You can set rules such as "Alert when negative sentiment for Customer Support exceeds 25% within 1 hour" and receive instant notifications via Slack, Email, or custom Webhooks.'
    },
    {
      q: 'Is there a limit on how many reviews I can analyze?',
      a: 'Our Starter plan includes 10,000 review analyses per month, Pro includes 100,000 per month, and Enterprise offers unlimited high-speed analysis with dedicated infrastructure.'
    },
    {
      q: 'Can I test BrandPulse without creating an account?',
      a: 'Absolutely! Click the "Launch Interactive Workspace" button anywhere on this page to instantly access our live interactive demo workspace loaded with real-world sample brand analytics.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
      {/* BACKGROUND GRADIENT DECORATION */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[15%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-600/15 blur-[140px]" />
        <div className="absolute top-[30%] -right-[10%] w-[45%] h-[45%] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute -bottom-[10%] left-[25%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
      </div>

      {/* TOP ANNOUNCEMENT BANNER */}
      <div className="relative z-50 w-full bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-blue-900/90 border-b border-purple-500/30 py-2.5 px-4 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 backdrop-blur-md">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/25 border border-purple-400/40 text-purple-200 font-bold uppercase tracking-wider text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> New v2.5 Engine
        </span>
        <span className="text-slate-200">Aspect Sentiment Forecasting & Emotion Detection is live!</span>
        <button
          onClick={onDemoClick}
          className="underline font-bold text-white hover:text-purple-300 transition-colors ml-1 inline-flex items-center gap-1 cursor-pointer"
        >
          Try Live Demo <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 p-0.5 shadow-lg shadow-purple-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  Brand<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Pulse</span>
                </span>
                <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI v2.5
                </span>
              </div>
              <span className="text-xs text-slate-400 tracking-wider font-semibold uppercase">
                Sentiment Intelligence
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-purple-400 transition-colors">What We Do</a>
            <a href="#how-it-works" className="hover:text-purple-400 transition-colors">How It Works</a>
            <a href="#live-demo" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
              <span>Interactive Demo</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </a>
            <a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {userSession ? (
              <button
                onClick={onDashboardClick || onDemoClick}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Workspace</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onDemoClick}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 border border-slate-700/80 text-slate-200 hover:border-purple-500/50 hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
                  <span>Explore Demo</span>
                </button>
                <button
                  onClick={onLoginClick}
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={onSignupClick}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 w-full pt-16 md:pt-24 pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          {/* Hero Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-bold mb-6 shadow-xl"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI-Powered Aspect Sentiment & Emotion Intelligence</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          </motion.div>

          {/* Hero Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-5xl mx-auto"
          >
            Turn Customer Signals into <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">
              Strategic Brand Pulse
            </span>
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            BrandPulse monitors, analyzes, and predicts customer sentiment in real time. Drill down into aspect-level NLP, forecast 30-day sentiment trajectories, and trigger automated alerts before churn happens.
          </motion.p>

          {/* Hero Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={onSignupClick}
              className="px-8 py-4 rounded-2xl text-base font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xl shadow-purple-600/35 hover:shadow-purple-600/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer group"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={onDemoClick}
              className="px-7 py-4 rounded-2xl text-base font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-purple-500/50 transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 text-purple-400 fill-purple-400/20" />
              <span>Launch Interactive Workspace</span>
            </button>
          </motion.div>

          {/* Key Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-14 w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl shadow-2xl"
          >
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                99.4%
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
                Sentiment Accuracy
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
                10M+
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
                Feedback Processed
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                &lt; 50ms
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
                NLP Inference Latency
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">
                4.9 / 5.0
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
                Enterprise Rating ★
              </span>
            </div>
          </motion.div>

          {/* HERO DASHBOARD PREVIEW MOCKUP */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-14 w-full max-w-5xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-purple-950/40 overflow-hidden backdrop-blur-xl"
          >
            {/* Top Window Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs sm:text-sm font-mono text-slate-400">
                  brandpulse.ai/dashboard/live-intelligence
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE STREAM
                </span>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Card 1: Brand Health Gauge */}
              <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Brand Health Index</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">EXCELLENT</span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white">88.4</span>
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="w-4 h-4" /> +4.2%
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-semibold">
                    <span className="text-slate-400">Positive Volume</span>
                    <span className="text-emerald-400 font-bold">72.4%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-[72%]" />
                    <div className="h-full bg-slate-500 w-[18%]" />
                    <div className="h-full bg-rose-500 w-[10%]" />
                  </div>
                </div>
              </div>

              {/* Card 2: Aspect Breakdown */}
              <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Aspect Breakdown (ABSA)</span>
                  <span className="text-xs font-bold text-slate-400">4 Tracked</span>
                </div>
                <div className="space-y-3.5">
                  {[
                    { name: 'Customer Support', pos: 92, color: 'bg-emerald-500' },
                    { name: 'Product Quality', pos: 84, color: 'bg-emerald-500' },
                    { name: 'Pricing & Value', pos: 76, color: 'bg-indigo-500' },
                    { name: 'Shipping & Delivery', pos: 42, color: 'bg-amber-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-300">
                        <span>{item.name}</span>
                        <span className="font-bold">{item.pos}% Pos</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.pos}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Live Feed */}
              <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Customer Signals</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs sm:text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-400">App Store ★★★★★</span>
                      <span className="text-xs text-slate-400">10s ago</span>
                    </div>
                    <p className="text-slate-300 line-clamp-2">"Super fast resolution on my ticket! Love the new dark mode."</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-xs sm:text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-400">Twitter / X</span>
                      <span className="text-xs text-slate-400">42s ago</span>
                    </div>
                    <p className="text-slate-300 line-clamp-2">"Delivery took an extra 2 days, but product quality is great."</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Test sentiment analysis live with your own reviews on our interactive sandbox playground</span>
              </div>
              <button
                onClick={() => {
                  const elem = document.getElementById('live-demo');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 font-bold hover:bg-purple-600/30 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Jump to Playground</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BRAND LOGOS MARQUEE */}
      <section className="w-full py-12 md:py-16 border-y border-slate-800/80 bg-slate-900/30 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">
            Powering sentiment intelligence for fast-growing data-driven enterprises
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 opacity-80">
            {['Apex SaaS', 'PulseMedia', 'ShopTech', 'CloudScale', 'OmniRetail', 'NextGen AI'].map((brand, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300 font-extrabold text-lg sm:text-xl tracking-wider hover:text-purple-400 transition-colors">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE SHOWCASE SECTION ("WHAT WE DO") */}
      <section id="features" className="w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Centered Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-purple-400" /> What We Do
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Complete Sentiment Intelligence Engine
            </h2>
            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
              BrandPulse transforms noisy feedback streams into structured, actionable business intelligence with deep aspect-level precision.
            </p>
          </div>

          {/* Feature Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto mb-12">
            {features.map((feat) => {
              const isActive = activeFeatureTab === feat.id;
              return (
                <button
                  key={feat.id}
                  onClick={() => setActiveFeatureTab(feat.id)}
                  className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-900/60 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="p-1 rounded bg-slate-950">{feat.icon}</span>
                  <span>{feat.title.split(' (')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Feature Spotlight Box */}
          {(() => {
            const feat = features.find(f => f.id === activeFeatureTab) || features[0];
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl backdrop-blur-xl">
                {/* Left Column: Text Content */}
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-extrabold border border-purple-500/30">
                    {feat.badge}
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                    {feat.title}
                  </h3>
                  <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                    {feat.description}
                  </p>
                  <div className="space-y-3 pt-2">
                    {feat.points.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm md:text-base font-semibold text-slate-200">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={onDemoClick}
                      className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Test in Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Column: Visualizer Box */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 md:p-8 flex flex-col justify-between min-h-[340px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">{feat.icon}</div>
                      <span className="font-bold text-sm text-slate-200">{feat.title.split(' (')[0]} Engine</span>
                    </div>
                    <span className="text-xs font-mono text-purple-400 font-bold bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/30">
                      {feat.previewStat}
                    </span>
                  </div>

                  {feat.id === 'absa' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-sm">
                        <div className="flex justify-between font-bold mb-1.5">
                          <span className="text-purple-400">Aspect: Customer Service</span>
                          <span className="text-emerald-400">94.2% Positive</span>
                        </div>
                        <p className="text-slate-400 text-xs">Signals: "Immediate response", "Support agent resolved ticket in 2 mins"</p>
                      </div>
                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-sm">
                        <div className="flex justify-between font-bold mb-1.5">
                          <span className="text-purple-400">Aspect: Pricing & Value</span>
                          <span className="text-amber-400">68.5% Positive</span>
                        </div>
                        <p className="text-slate-400 text-xs">Signals: "Worth every penny", "Tier pricing is competitive"</p>
                      </div>
                    </div>
                  )}

                  {feat.id === 'forecast' && (
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center text-slate-300 font-bold">
                        <span>Historical 14-Day Baseline</span>
                        <span className="text-emerald-400 font-mono">82.4 Score</span>
                      </div>
                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[82%]" />
                      </div>
                      <div className="flex justify-between items-center text-slate-300 font-bold pt-2">
                        <span>Projected 30-Day Forecast</span>
                        <span className="text-amber-400 font-mono">87.1 Projected ↑</span>
                      </div>
                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[87%]" />
                      </div>
                    </div>
                  )}

                  {feat.id !== 'absa' && feat.id !== 'forecast' && (
                    <div className="py-8 px-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center space-y-3">
                      <Sparkles className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
                      <h4 className="font-extrabold text-base text-white">Neural Processing Matrix</h4>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">Continuous real-time stream evaluation with instant webhook dispatch & anomaly alerting.</p>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span>Engine Status: Active</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Real-Time NLP Mesh
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 6 Feature Cards Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.id}
                onClick={() => setActiveFeatureTab(f.id)}
                className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-2">{f.title.split(' (')[0]}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">{f.description}</p>
                </div>
                <span className="text-xs sm:text-sm font-bold text-purple-400 group-hover:text-purple-300 flex items-center gap-1.5">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Centered Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Workflow className="w-4 h-4 text-blue-400" /> How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              From Raw Feedback to Strategic Action in 4 Steps
            </h2>
            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
              See how BrandPulse continuously ingests, scores, and transforms customer signals into competitive growth intelligence.
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-6 md:p-8 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-slate-900 border-purple-500 shadow-xl shadow-purple-500/15 scale-100 lg:scale-[1.02]'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                        {step.num}
                      </span>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">{step.icon}</div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">{step.subtitle}</span>
                    <h3 className="text-lg sm:text-xl font-black text-white mt-1 mb-3">{step.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">{step.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 text-xs font-medium text-slate-400">
                    💡 {step.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTERACTIVE PLAYGROUND / SANDBOX SECTION */}
      <section id="live-demo" className="w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Centered Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Interactive Sandbox
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Test the BrandPulse Engine Right Now
            </h2>
            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
              Paste customer feedback or select a preset scenario below to watch the NLP engine extract sentiment, emotion, and aspect scores live.
            </p>
          </div>

          {/* Playground Container Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 backdrop-blur-xl shadow-2xl max-w-5xl mx-auto">
            {/* Presets Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
                Choose Sample Scenario:
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePresets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnalyzePlayground(preset.text, preset.result)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-bold text-slate-300 hover:border-purple-500 hover:text-white transition-all cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Input Box */}
            <div className="relative mb-6">
              <textarea
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all font-sans leading-relaxed"
                placeholder="Paste customer review, tweet, or survey response here..."
              />
              <button
                onClick={() => handleAnalyzePlayground()}
                disabled={analyzing || !demoInput.trim()}
                className="absolute bottom-4 right-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Signals...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Analyze Signals</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Grid Display */}
            {demoResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8"
              >
                {/* Score & Emotion (4 cols) */}
                <div className="md:col-span-4 space-y-4 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Sentiment Score</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white">{demoResult.score} <span className="text-sm font-normal text-slate-400">/ 100</span></span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        demoResult.score > 70 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : demoResult.score > 40 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {demoResult.sentiment}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-xs font-bold uppercase">Detected Emotion</span>
                      <p className="font-bold text-sm text-purple-300 mt-1">{demoResult.emotion}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-xs font-bold uppercase">Churn Risk</span>
                      <p className={`font-bold text-sm mt-1 ${demoResult.score < 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {demoResult.churnRisk}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Aspect Breakdown (5 cols) */}
                <div className="md:col-span-5 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Extracted Product Aspects (ABSA)
                  </span>
                  <div className="space-y-2.5">
                    {demoResult.aspects.map((asp, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-200">{asp.name}</span>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          asp.sentiment === 'Positive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {asp.sentiment} ({asp.score}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Action Directive (3 cols) */}
                <div className="md:col-span-3 bg-purple-950/30 border border-purple-500/30 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm mb-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>AI Action Directive</span>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{demoResult.action}</p>
                  </div>
                  <button
                    onClick={onDemoClick}
                    className="mt-4 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Open Workspace
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ROI & VALUE CALCULATOR */}
      <section className="w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl">
          {/* Centered Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
              Calculate Your Team's Time & ROI Saved
            </h3>
            <p className="text-slate-400 text-sm sm:text-base font-normal">
              Adjust monthly review volume to estimate manual triage hours saved and revenue protected from customer churn.
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-3 max-w-3xl mx-auto">
              <div className="flex justify-between text-sm sm:text-base font-bold text-slate-300">
                <span>Monthly Customer Feedback Volume:</span>
                <span className="text-purple-400 font-black text-lg">{reviewVolume.toLocaleString()} reviews/mo</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={reviewVolume}
                onChange={(e) => setReviewVolume(Number(e.target.value))}
                className="w-full accent-purple-500 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center flex flex-col justify-center">
                <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <span className="text-3xl sm:text-4xl font-black text-white">{hoursSaved} hrs</span>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 font-semibold">Triage Hours Saved / Month</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center flex flex-col justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <span className="text-3xl sm:text-4xl font-black text-emerald-400">${revenueProtected}</span>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 font-semibold">Est. Churn Revenue Protected</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center flex flex-col justify-center">
                <Zap className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <span className="text-3xl sm:text-4xl font-black text-amber-400">{speedupFactor}</span>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 font-semibold">Faster Feedback Loop</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Centered Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-purple-400" /> Transparent Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Flexible Plans for Brands of Any Scale
            </h2>
            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
              Start with our 14-day free trial. No credit card required. Cancel anytime.
            </p>

            {/* Monthly / Annual Billing Toggle */}
            <div className="pt-4 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setAnnualBilling(false)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  !annualBilling ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setAnnualBilling(true)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  annualBilling ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/25 text-emerald-300 text-xs font-extrabold uppercase">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all h-full">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">Starter</span>
                <h3 className="text-2xl font-black text-white mt-1">Growth Brands</h3>
                <p className="text-sm text-slate-400 mt-2">Perfect for startups tracking core product feedback.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">${annualBilling ? '39' : '49'}</span>
                  <span className="text-sm font-semibold text-slate-400">/ month</span>
                </div>

                <ul className="mt-8 space-y-3.5 text-sm text-slate-300 font-medium">
                  {['Up to 10,000 Review Analyses / mo', 'Aspect Sentiment Analysis (ABSA)', '3 Data Source Integrations', 'Email Support Alerting', '7-Day Trend Analytics'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={onSignupClick}
                className="mt-8 w-full py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm hover:border-purple-500 transition-all cursor-pointer"
              >
                Start Free Starter Trial
              </button>
            </div>

            {/* Pro Plan (Spotlight) */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/40 border-2 border-purple-500 rounded-3xl p-8 flex flex-col justify-between shadow-2xl shadow-purple-950/50 relative scale-100 lg:scale-105 z-10 h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                Most Popular
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">Professional</span>
                <h3 className="text-2xl font-black text-white mt-1">Scale & Agencies</h3>
                <p className="text-sm text-slate-300 mt-2">Comprehensive sentiment intelligence with predictive forecasting.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">${annualBilling ? '119' : '149'}</span>
                  <span className="text-sm font-semibold text-slate-400">/ month</span>
                </div>

                <ul className="mt-8 space-y-3.5 text-sm text-slate-200 font-semibold">
                  {[
                    'Up to 100,000 Review Analyses / mo',
                    '30-Day Sentiment Forecasting Horizon',
                    'Instant Slack & Webhook Anomaly Alerts',
                    'Competitor Brand Benchmarking',
                    'Unlimited Omnichannel Integrations',
                    'Automated PDF & CSV Report Builder'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={onSignupClick}
                className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Start Pro 14-Day Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all h-full">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">Enterprise</span>
                <h3 className="text-2xl font-black text-white mt-1">Custom Architecture</h3>
                <p className="text-sm text-slate-400 mt-2">Custom fine-tuned NLP models and dedicated SLA.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">${annualBilling ? '399' : '499'}</span>
                  <span className="text-sm font-semibold text-slate-400">/ month</span>
                </div>

                <ul className="mt-8 space-y-3.5 text-sm text-slate-300 font-medium">
                  {['Unlimited Review Processing Volume', 'Custom Fine-Tuned NLP Models', 'Dedicated SLA & Account Executive', 'SOC2 Type II & On-Prem Options', 'Custom API Rate Limits'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={onSignupClick}
                className="mt-8 w-full py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm hover:border-purple-500 transition-all cursor-pointer"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-t border-slate-800/80 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Centered Header */}
          <div className="text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-purple-400" /> FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between font-bold text-base sm:text-lg text-slate-100 hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL HIGH-IMPACT CTA BANNER */}
      <section className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-blue-950 border border-purple-500/40 rounded-3xl p-8 sm:p-12 md:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight relative z-10">
              Ready to Amplify Your Brand Sentiment Intelligence?
            </h2>
            <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-2xl mx-auto relative z-10 font-normal leading-relaxed">
              Join hundreds of data-driven teams using BrandPulse to convert customer signals into competitive brand advantage.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 relative z-10">
              <button
                onClick={onSignupClick}
                className="px-8 py-4 rounded-2xl text-base font-extrabold bg-white text-slate-950 shadow-xl hover:bg-slate-100 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Get Started Free Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onDemoClick}
                className="px-8 py-4 rounded-2xl text-base font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                <span>Launch Interactive Workspace</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 text-sm text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
            {/* Brand Column (2 cols) */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-black text-white">BrandPulse</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed text-sm">
                Next-generation brand sentiment intelligence, aspect-based NLP analytics, and predictive customer feedback forecasting platform.
              </p>
              <p className="text-slate-500 text-xs">© 2026 BrandPulse Inc. All rights reserved.</p>
            </div>

            {/* Links 1 */}
            <div>
              <h4 className="font-bold text-slate-200 mb-4 uppercase tracking-wider text-xs">Product</h4>
              <ul className="space-y-2.5">
                <li><a href="#features" className="hover:text-purple-400 transition-colors">Aspect Sentiment (ABSA)</a></li>
                <li><a href="#features" className="hover:text-purple-400 transition-colors">Predictive Horizon</a></li>
                <li><a href="#features" className="hover:text-purple-400 transition-colors">Real-Time Alerts</a></li>
                <li><a href="#features" className="hover:text-purple-400 transition-colors">Competitor Benchmarking</a></li>
              </ul>
            </div>

            {/* Links 2 */}
            <div>
              <h4 className="font-bold text-slate-200 mb-4 uppercase tracking-wider text-xs">Resources</h4>
              <ul className="space-y-2.5">
                <li><a href="#how-it-works" className="hover:text-purple-400 transition-colors">How It Works</a></li>
                <li><a href="#live-demo" className="hover:text-purple-400 transition-colors">Interactive Demo</a></li>
                <li><a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing & Plans</a></li>
                <li><a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Links 3 */}
            <div>
              <h4 className="font-bold text-slate-200 mb-4 uppercase tracking-wider text-xs">Legal</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Security & SOC2</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Cookie Settings</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
