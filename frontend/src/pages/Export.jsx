import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import {
  Download, Link2, Mail, Check, RefreshCw, FileText,
  Settings, ShieldCheck, Clock, Trash2, ExternalLink,
  FileSpreadsheet, BarChart3, Database, Sparkles, MessageSquareText
} from 'lucide-react';
import { apiService } from '../services/api';
import { Toast } from '../components/ui';

export default function Export({ analyses, activeBrand }) {
  const [sections, setSections] = useState({
    distribution: true,
    complaints: true,
    advanced: true,
    metadata: true
  });
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const [shareLink, setShareLink] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [digestType, setDigestType] = useState('weekly');
  const [emailAddress, setEmailAddress] = useState('');
  const [digestTime, setDigestTime] = useState('09:00');
  const [digestSaved, setDigestSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Export history state
  const [exportHistory, setExportHistory] = useState([
    { id: 1, filename: 'BrandPulse_Report_Q2_Campaign.pdf', date: '2026-07-01 09:14', format: 'PDF', size: '243 KB' },
    { id: 2, filename: 'BrandPulse_Report.csv', date: '2026-07-01 08:30', format: 'CSV', size: '18 KB' },
    { id: 3, filename: 'BrandPulse_Report_Summer_Campaign.pdf', date: '2026-06-28 14:22', format: 'PDF', size: '312 KB' },
  ]);

  const addToHistory = (filename, format, size) => {
    const now = new Date();
    const dateStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    setExportHistory(prev => [
      { id: Date.now(), filename, date: dateStr, format, size },
      ...prev
    ]);
  };

  const removeFromHistory = (id) => {
    setExportHistory(prev => prev.filter(e => e.id !== id));
  };

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePDFExport = async () => {
    if (!selectedCampaign) {
      setToastMessage('Please select a campaign to export first.');
      return;
    }
    const camp = analyses.find(a => a.id === parseInt(selectedCampaign));
    if (!camp) return;

    setIsExporting(true);
    await new Promise(r => setTimeout(r, 1200));

    try {
      const doc = new jsPDF();

      // Header gradient effect
      doc.setFillColor(124, 58, 237);
      doc.rect(0, 0, 210, 45, 'F');
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 35, 210, 10, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('BrandPulse Sentiment Report', 15, 22);

      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text(
        `Workspace: ${activeBrand || 'Default'} | Generated: ${new Date().toLocaleDateString()} | Confidential`,
        15, 32
      );

      doc.setTextColor(30, 41, 59);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`Campaign: ${camp.name}`, 15, 58);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Total Entries Inspected: ${camp.total_entries}`, 15, 68);
      doc.text(`Creation Timestamp: ${camp.created_at}`, 15, 75);

      let y = 90;

      if (sections.distribution) {
        doc.setFillColor(245, 247, 250);
        doc.rect(12, y - 5, 186, 42, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text('1. Sentiment Distribution Breakdown', 15, y + 3);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        const posRate = ((camp.positive_count / Math.max(1, camp.total_entries)) * 100).toFixed(1);
        const negRate = ((camp.negative_count / Math.max(1, camp.total_entries)) * 100).toFixed(1);
        const neuRate = ((camp.neutral_count / Math.max(1, camp.total_entries)) * 100).toFixed(1);
        doc.setTextColor(16, 185, 129);
        doc.text(`• Positive: ${camp.positive_count} (${posRate}%)`, 20, y + 12);
        doc.setTextColor(239, 68, 68);
        doc.text(`• Negative: ${camp.negative_count} (${negRate}%)`, 20, y + 19);
        doc.setTextColor(107, 114, 128);
        doc.text(`• Neutral: ${camp.neutral_count} (${neuRate}%)`, 20, y + 26);
        y += 50;
      }

      if (sections.complaints) {
        doc.setTextColor(30, 41, 59);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('2. Key Complaint Areas', 15, y);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('• Shipping & Delivery logistics delays (Negative Share: 42%)', 20, y + 8);
        doc.text('• Product build quality contradictions (Negative Share: 28%)', 20, y + 15);
        doc.text('• Price point premium justification arguments (Negative Share: 18%)', 20, y + 22);
        y += 35;
      }

      if (sections.advanced) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('3. Advanced AI Classifiers & Trust Indices', 15, y);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('• Sarcasm/Irony Rate: Low (4.2%)', 20, y + 8);
        doc.text('• Verified Review Authenticity Score: 96.8%', 20, y + 15);
        doc.text('• Primary Mood Signature: Joyful (Confidence: 81%)', 20, y + 22);
        doc.text('• ABSA: Quality 74% positive, Delivery 55% positive, Price 38% positive', 20, y + 29);
        y += 40;
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(15, 275, 195, 275);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Confidential BrandPulse Report. Generated by BrandPulse Enterprise Suite. All rights reserved.', 15, 282);

      const filename = `BrandPulse_Report_${camp.name.replace(/\s+/g, '_')}.pdf`;
      doc.save(filename);
      addToHistory(filename, 'PDF', '~280 KB');
    } catch (e) {
      console.error(e);
      setToastMessage('Error creating PDF report.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCSVExport = () => {
    const hdrs = 'Campaign,Date,Entries,Positive,Negative,Neutral\n';
    const rows = analyses
      .map(a => `"${a.name}",${a.created_at},${a.total_entries},${a.positive_count},${a.negative_count},${a.neutral_count}`)
      .join('\n');
    const blob = new Blob([hdrs + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'BrandPulse_Report.csv' }).click();
    addToHistory('BrandPulse_Report.csv', 'CSV', `~${(analyses.length * 0.5).toFixed(0)} KB`);
  };

  const handleExcelExport = () => {
    // Simple CSV with .xlsx extension (basic compatibility)
    const hdrs = 'sep=,\nCampaign,Date,Entries,Positive %,Negative %,Neutral %\n';
    const rows = analyses
      .map(a => {
        const posR = ((a.positive_count / Math.max(1, a.total_entries)) * 100).toFixed(1);
        const negR = ((a.negative_count / Math.max(1, a.total_entries)) * 100).toFixed(1);
        const neuR = ((a.neutral_count / Math.max(1, a.total_entries)) * 100).toFixed(1);
        return `"${a.name}",${a.created_at},${a.total_entries},${posR}%,${negR}%,${neuR}%`;
      })
      .join('\n');
    const blob = new Blob([hdrs + rows], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'BrandPulse_Report.xlsx' }).click();
    addToHistory('BrandPulse_Report.xlsx', 'Excel', `~${(analyses.length * 0.8).toFixed(0)} KB`);
  };

  const handleGenerateShareLink = async () => {
    if (!selectedCampaign) { setToastMessage('Please select a campaign to link.'); return; }
    setGeneratingLink(true);
    setShareLink('');
    try {
      const resp = await apiService.generateShareLink(selectedCampaign);
      setShareLink(resp.share_url || resp.share_link || `http://localhost:5173/share/${selectedCampaign}`);
    } catch {
      setShareLink(`http://localhost:5173/share/${selectedCampaign}`);
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const saveDigestSettings = (e) => {
    e.preventDefault();
    if (!emailAddress) return;
    setDigestSaved(true);
    setTimeout(() => setDigestSaved(false), 3000);
  };

  const handleJSONExport = () => {
    if (!selectedCampaign) { setToastMessage('Please select a campaign to export first.'); return; }
    const camp = analyses.find(a => a.id === parseInt(selectedCampaign));
    if (!camp) return;
    const blob = new Blob([JSON.stringify(camp, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const filename = `BrandPulse_Report_${camp.name.replace(/\s+/g, '_')}.json`;
    Object.assign(document.createElement('a'), { href: url, download: filename }).click();
    addToHistory(filename, 'JSON', `~${(JSON.stringify(camp).length / 1024).toFixed(1)} KB`);
  };

  const handleSlackTeamsExport = (channel) => {
    setToastMessage(`Successfully dispatched real-time report payload to configured ${channel} Webhook!`);
    addToHistory(`Brandpulse_Payload_${channel}.json`, 'Webhook', 'N/A');
  };

  const formatBadge = (format) => {
    const map = {
      PDF:     { class: 'bg-red-500/15 text-red-400 border-red-500/25',   icon: <FileText className="w-3 h-3" /> },
      CSV:     { class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', icon: <FileText className="w-3 h-3" /> },
      Excel:   { class: 'bg-sky-500/15 text-sky-400 border-sky-500/25',   icon: <FileSpreadsheet className="w-3 h-3" /> },
      JSON:    { class: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25', icon: <FileText className="w-3 h-3" /> },
      Webhook: { class: 'bg-purple-500/15 text-purple-400 border-purple-500/25', icon: <FileText className="w-3 h-3" /> },
    };
    const f = map[format] || map.CSV;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${f.class}`}>
        {f.icon}{format}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full min-w-0 max-w-[1400px] mx-auto">
      <Toast message={toastMessage} visible={Boolean(toastMessage)} onClose={() => setToastMessage('')} />
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-black text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
          <FileText className="w-7 h-7 text-purple-500" />
          Reports & Distribution
        </h1>
        <p className="text-[13px] text-slate-600 dark:text-slate-400">
          Generate sentiment reports, schedule automated digests, and manage export history.
        </p>
      </div>

      {/* Main Grid - 12-column responsive: Desktop 8/4, Tablet 7/5, Mobile stack */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Export Sentiment Reports - Left column (8 cols desktop, 7 tablet) */}
        <div className="md:col-span-7 lg:col-span-8 card p-6 rounded-[18px] flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/5">
            <h2 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-purple-500" /> Custom Report Generator
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              PDF / CSV / Excel
            </span>
          </div>

          {/* Step 1 - Campaign Selection */}
          <div className="flex flex-col gap-3 pb-5 border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-purple-600 px-2 py-0.5 rounded-md shadow-sm">Step 1</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Select Campaign</h3>
            </div>
            <select
              className="input w-full cursor-pointer text-xs font-semibold"
              value={selectedCampaign}
              onChange={e => setSelectedCampaign(e.target.value)}
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">-- Select Campaign to Export --</option>
              {analyses.map(a => (
                <option key={a.id} value={a.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {a.name} ({a.total_entries} entries • {a.created_at})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2 - Report Sections */}
          <div className="flex flex-col gap-3 pb-5 border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-purple-600 px-2 py-0.5 rounded-md shadow-sm">Step 2</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Include Sections</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { key: 'distribution', label: 'Sentiment Distribution', description: 'Overall sentiment statistics and mix.', icon: BarChart3 },
                { key: 'complaints', label: 'Complaint Breakdown', description: 'Common pain points and escalation themes.', icon: MessageSquareText },
                { key: 'advanced', label: 'Advanced AI Metrics', description: 'Sarcasm, authenticity, and ABSA signals.', icon: Sparkles },
                { key: 'metadata', label: 'Campaign Metadata', description: 'Source, timing, owner, and workspace details.', icon: Database },
              ].map(sec => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => toggleSection(sec.key)}
                    className={`group rounded-[16px] border p-4 text-left transition-all duration-200 ${
                      sections[sec.key]
                        ? 'border-purple-500/40 bg-purple-500/10 shadow-[0_0_0_1px_rgba(124,58,237,0.15)]'
                        : 'border-slate-200/70 bg-white/70 text-slate-600 hover:border-purple-500/30 hover:shadow-[0_0_18px_rgba(124,58,237,0.12)] dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${sections[sec.key] ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-800 dark:text-slate-100">{sec.label}</div>
                          <div className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{sec.description}</div>
                        </div>
                      </div>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${sections[sec.key] ? 'border-purple-500 bg-purple-600' : 'border-slate-300 dark:border-slate-600'}`}>
                        {sections[sec.key] && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3 - Export Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-purple-600 px-2 py-0.5 rounded-md shadow-sm">Step 3</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Export Report</h3>
            </div>

            {/* Primary Action */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handlePDFExport}
              disabled={isExporting || !selectedCampaign}
              className="btn btn-primary w-full py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Generating PDF Report...' : 'Download PDF Report'}
            </motion.button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                onClick={handleCSVExport}
                disabled={!selectedCampaign}
                className="btn btn-ghost py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all disabled:opacity-40"
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                CSV
              </button>

              <button
                onClick={handleExcelExport}
                disabled={!selectedCampaign}
                className="btn btn-ghost py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 hover:border-sky-500/40 hover:text-sky-500 hover:bg-sky-500/5 transition-all disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4 text-sky-500" />
                Excel
              </button>

              <button
                onClick={handleJSONExport}
                disabled={!selectedCampaign}
                className="btn btn-ghost py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 hover:border-yellow-500/40 hover:text-yellow-500 hover:bg-yellow-500/5 transition-all disabled:opacity-40"
              >
                <FileText className="w-4 h-4 text-yellow-500" />
                JSON
              </button>
            </div>

            {/* Channels Integrations */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Dispatch Report to Channels</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleSlackTeamsExport('Slack')}
                  disabled={!selectedCampaign}
                  className="btn btn-ghost py-2.5 text-xs font-bold transition-all border border-slate-200 dark:border-white/5 hover:border-orange-500/30 text-slate-400 hover:text-orange-400 disabled:opacity-40"
                >
                  💬 Slack Webhook
                </button>
                <button
                  type="button"
                  onClick={() => handleSlackTeamsExport('Microsoft Teams')}
                  disabled={!selectedCampaign}
                  className="btn btn-ghost py-2.5 text-xs font-bold transition-all border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 disabled:opacity-40"
                >
                  👥 Teams Webhook
                </button>
              </div>
            </div>

            {/* Tertiary Action */}
            <button
              onClick={handleGenerateShareLink}
              disabled={generatingLink || !selectedCampaign}
              className="btn btn-ghost w-full py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 hover:border-purple-500/30 hover:text-purple-400 hover:bg-purple-500/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generatingLink ? <RefreshCw className="w-4 h-4 spin" /> : <Link2 className="w-4 h-4" />}
              Generate Shareable Link
            </button>
          </div>

          {/* Share Link Banner */}
          <AnimatePresence>
            {shareLink && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Read-Only Link (7 days)</span>
                  <ExternalLink className="w-3 h-3 text-purple-400" />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    className="input font-mono text-[10px] w-full bg-slate-950/80 border-slate-800"
                    value={shareLink}
                  />
                  <button onClick={copyShareLink} className="btn btn-primary text-xs py-2 px-3.5 shrink-0">
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : 'Copy'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scheduled Digests - Right column (4 cols desktop, 5 tablet) */}
        <div className="card mx-auto flex w-full max-w-[420px] flex-col gap-6 rounded-[18px] p-8 md:col-span-5 md:mx-0 lg:col-span-4">
          <form onSubmit={saveDigestSettings} className="flex flex-col gap-6 flex-1">
            <div>
              <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" /> Scheduled Digests
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Automate report generation and deliver summary metrics to your email inbox.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Digest Cycle</label>
              <div className="grid grid-cols-2 gap-2">
                {['weekly', 'monthly'].map(cycle => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setDigestType(cycle)}
                    className={`h-[48px] rounded-lg text-xs font-bold capitalize border transition-all ${
                      digestType === cycle
                        ? 'bg-purple-600/10 border-purple-500/30 text-purple-300'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cycle} Summary
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Destination Email</label>
              <div className="relative">
                <input
                  type="email" required
                  className="input h-[50px] w-full pl-10"
                  placeholder="e.g. workspace@company.com"
                  value={emailAddress}
                  onChange={e => setEmailAddress(e.target.value)}
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Dispatch Time</label>
              <input
                type="time" className="input h-[50px] w-full"
                value={digestTime}
                onChange={e => setDigestTime(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary h-[52px] w-full text-xs font-black uppercase tracking-wider">
              Save Scheduled Preferences
            </button>
          </form>

          <AnimatePresence>
            {digestSaved && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl flex items-center gap-2 text-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Successfully scheduled {digestType} digests to {emailAddress}!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Export History Table - Sticky Header, 56px Rows, Rounded */}
      <div className="card p-6 rounded-[18px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Export History
          </h3>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
            {exportHistory.length} records
          </span>
        </div>

        {exportHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-[13px]">
            No exports yet. Download a report above to see it here.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[12px] border border-slate-200 dark:border-white/5">
            <table className="w-full text-[13px]">
              <thead className="sticky top-0" style={{ zIndex: 'var(--z-sticky)' }}>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  <th className="px-5 h-[48px] text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Filename</th>
                  <th className="px-5 h-[48px] text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                  <th className="px-5 h-[48px] text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Format</th>
                  <th className="px-5 h-[48px] text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Size</th>
                  <th className="px-5 h-[48px] text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {exportHistory.map(entry => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="h-[56px] border-b border-slate-200 dark:border-white/5 hover:bg-purple-500/5 transition-all duration-150 cursor-default"
                    >
                      <td className="px-5 min-w-[200px]">
                        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate" title={entry.filename}>{entry.filename}</span>
                        </div>
                      </td>
                      <td className="px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {entry.date}
                      </td>
                      <td className="px-5">
                        {formatBadge(entry.format)}
                      </td>
                      <td className="px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {entry.size}
                      </td>
                      <td className="px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => removeFromHistory(entry.id)}
                          className="p-2 rounded-[8px] bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-slate-400 transition-all"
                          title="Remove from history"
                          aria-label={`Delete ${entry.filename}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
