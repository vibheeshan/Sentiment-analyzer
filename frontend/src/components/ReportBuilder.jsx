import React, { useState } from 'react';
import { FileText, Download, LayoutTemplate, Plus, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportBuilder({ analyses }) {
  const [reportTitle, setReportTitle] = useState('Monthly Sentiment Overview');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [selectedMetrics, setSelectedMetrics] = useState({
    healthScore: true,
    volumeTrend: true,
    sentimentBreakdown: true,
    topAspects: false
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleMetric = (key) => {
    setSelectedMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('report-preview');
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${reportTitle.replace(/\s+/g, '_')}_Report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 w-full items-start">
      {/* Builder Configuration */}
      <div className="lg:col-span-1 space-y-6">
        <div className="card rounded-2xl p-6 space-y-5 border-t-4 border-t-purple-500">
          <h3 className="text-base font-extrabold flex items-center gap-2 text-slate-100">
            <LayoutTemplate className="w-4 h-4 text-purple-400" /> Report Builder
          </h3>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Report Title</label>
            <input 
              type="text" 
              className="input w-full font-bold h-[42px] text-xs" 
              value={reportTitle} 
              onChange={e => setReportTitle(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Date Range</label>
            <select className="input w-full h-[42px] text-xs py-1" value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Include Metrics</label>
            <div className="space-y-2.5">
              {[
                { key: 'healthScore', label: 'Brand Health Score' },
                { key: 'volumeTrend', label: 'Mention Volume Trend' },
                { key: 'sentimentBreakdown', label: 'Sentiment Breakdown' },
                { key: 'topAspects', label: 'Top Aspects (ABSA)' }
              ].map(m => (
                <label key={m.key} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedMetrics[m.key] ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}>
                  <span className={`text-xs font-semibold ${selectedMetrics[m.key] ? 'text-purple-300' : 'text-slate-300'}`}>{m.label}</span>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${selectedMetrics[m.key] ? 'bg-purple-500 text-white' : 'border border-slate-600'}`}>
                    {selectedMetrics[m.key] && <CheckCircle className="w-3 h-3" />}
                  </div>
                  <input type="checkbox" className="sr-only" checked={selectedMetrics[m.key]} onChange={() => toggleMetric(m.key)} />
                </label>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleGenerateReport} 
            disabled={isGenerating}
            className="btn btn-primary w-full h-[44px] text-xs font-bold"
          >
            {isGenerating ? 'Generating PDF...' : (
              <><Download className="w-4 h-4" /> Export to PDF</>
            )}
          </button>
        </div>
      </div>
      
      {/* Live Preview Pane */}
      <div className="lg:col-span-2">
        <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
          Live Preview 
          <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">A4 Format</span>
        </h4>
        
        {/* Actual Preview DOM - used by html2canvas */}
        <div className="bg-slate-200 p-4 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
          <div id="report-preview" className="bg-white text-slate-900 w-full min-h-[800px] p-10 shadow-lg" style={{ fontFamily: 'sans-serif' }}>
            
            {/* Header */}
            <div className="border-b-2 border-slate-200 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-800 m-0">{reportTitle}</h1>
                <p className="text-slate-500 font-medium mt-2">{dateRange} • Generated {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-sky-600 tracking-tighter">BRANDPULSE</div>
                <div className="text-xs text-slate-400 font-bold tracking-widest mt-1 uppercase">Intelligence Report</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Selected Metrics Rendering */}
              {selectedMetrics.healthScore && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Brand Health Score</h3>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-black text-emerald-500 tracking-tighter">84</span>
                    <span className="text-emerald-500 font-bold bg-emerald-100 px-2 py-1 rounded mb-1 text-sm">+2.4%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Overall brand sentiment is healthy and trending positively.</p>
                </div>
              )}
              
              {selectedMetrics.volumeTrend && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Mentions</h3>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-black text-sky-500 tracking-tighter">12.4k</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Across 4 connected data sources.</p>
                </div>
              )}
              
              {selectedMetrics.sentimentBreakdown && (
                <div className="col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Sentiment Breakdown</h3>
                  <div className="flex w-full h-8 rounded-lg overflow-hidden font-bold text-white text-xs text-center leading-8">
                    <div style={{ width: '65%' }} className="bg-emerald-500">65% Positive</div>
                    <div style={{ width: '20%' }} className="bg-slate-400">20% Neutral</div>
                    <div style={{ width: '15%' }} className="bg-red-500">15% Negative</div>
                  </div>
                </div>
              )}
              
              {selectedMetrics.topAspects && (
                <div className="col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Top Discussed Aspects</h3>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="pb-2 font-bold text-slate-600">Aspect</th>
                        <th className="pb-2 font-bold text-slate-600">Mentions</th>
                        <th className="pb-2 font-bold text-slate-600 text-right">Positive %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr><td className="py-2 font-semibold">Customer Service</td><td className="py-2">4,201</td><td className="py-2 text-right text-emerald-600 font-bold">78%</td></tr>
                      <tr><td className="py-2 font-semibold">Product Quality</td><td className="py-2">3,190</td><td className="py-2 text-right text-emerald-600 font-bold">82%</td></tr>
                      <tr><td className="py-2 font-semibold">Pricing</td><td className="py-2">2,845</td><td className="py-2 text-right text-red-500 font-bold">41%</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
              Generated by BrandPulse Analytics Engine • CONFIDENTIAL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
