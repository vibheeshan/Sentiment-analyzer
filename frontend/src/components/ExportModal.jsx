import React, { useState } from 'react';
import { Download, FileSpreadsheet, Image as ImageIcon, X } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function ExportModal({ isOpen, onClose, data, chartId }) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [fileName, setFileName] = useState('BrandPulse_Export');

  if (!isOpen) return null;

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    
    // Get headers
    const headers = Object.keys(data[0]).join(',');
    
    // Get rows
    const rows = data.map(row => {
      return Object.values(row).map(value => {
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    }).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onClose();
  };

  const handleExportPNG = async () => {
    if (!chartId) return;
    
    const element = document.getElementById(chartId);
    if (!element) {
      alert("Chart element not found");
      return;
    }
    
    try {
      const canvas = await html2canvas(element, { backgroundColor: '#0f172a' }); // Using dark theme bg
      const url = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName}.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onClose();
    } catch (error) {
      console.error("Failed to export PNG:", error);
    }
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      handleExportCSV();
    } else {
      handleExportPNG();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black">Export Data</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">File Name</label>
            <input 
              type="text" 
              className="input w-full" 
              value={fileName} 
              onChange={(e) => setFileName(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setExportFormat('csv')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  exportFormat === 'csv' 
                    ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' 
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6" />
                <span className="text-sm font-bold">CSV Data</span>
              </button>
              
              <button 
                onClick={() => setExportFormat('png')}
                disabled={!chartId}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  !chartId ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  exportFormat === 'png' 
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' 
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <ImageIcon className="w-6 h-6" />
                <span className="text-sm font-bold">PNG Chart</span>
              </button>
            </div>
            {!chartId && (
              <p className="text-xs text-amber-500 mt-2">PNG export is only available when a chart is selected.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleExport} className="btn btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>
    </div>
  );
}
