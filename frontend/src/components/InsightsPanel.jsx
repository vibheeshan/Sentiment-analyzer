import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, Loader2, CheckCircle2, Target } from 'lucide-react';

export default function InsightsPanel() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const fetchInsights = () => {
      setLoading(true);
      setTimeout(() => {
        setInsights({
          summary: "Overall sentiment has improved by 4.2% over the last week. The primary driver of positive sentiment is the recent launch of the 'Pro' feature set. However, customer service wait times continue to be a recurring negative theme.",
          highlights: [
            { id: 1, type: 'positive', text: 'Brand loyalty mentions up 12% among returning customers.' },
            { id: 2, type: 'negative', text: 'Shipping delay complaints spiked on Thursday.' },
            { id: 3, type: 'trend', text: '"Ease of use" is now the 2nd most discussed topic.' }
          ],
          recommendations: [
            { text: "Investigate shipping provider delays affecting Thursday deliveries.", priority: "High" },
            { text: "Capitalize on 'Pro' feature success with targeted marketing.", priority: "Medium" },
            { text: "Review customer service staffing levels during peak hours.", priority: "High" }
          ]
        });
        setLoading(false);
      }, 800);
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="card w-full p-8 flex flex-col items-center justify-center min-h-[320px]">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Generating AI Executive Summary...</p>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="card w-full p-6 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        {/* LEFT COLUMN: Header, Summary, Key Findings */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100 leading-none">AI Executive Summary</h3>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Automated Insight Engine</span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed font-normal bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
              {insights.summary}
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-purple-400" /> Key Findings
            </h4>
            <div className="space-y-2">
              {insights.highlights.map(item => (
                <div key={item.id} className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 transition-colors hover:border-purple-500/30">
                  {item.type === 'positive' && <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {item.type === 'negative' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                  {item.type === 'trend' && <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}
                  <span className="text-xs text-slate-200 leading-snug font-medium flex-1">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recommended Actions */}
        <div className="flex flex-col justify-between bg-purple-500/5 p-4 rounded-xl border border-purple-500/20">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Recommended Actions
              </h4>
              <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">3 Actions</span>
            </div>

            <div className="space-y-2.5">
              {insights.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-900/80 p-3 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 text-[10px] font-black">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">{rec.text}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    rec.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-purple-300/70">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified by AI Strategy Module
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
