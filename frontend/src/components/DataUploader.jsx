import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function DataUploader({ onImport }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);

  const expectedColumns = [
    { key: 'text', label: 'Feedback Text', required: true },
    { key: 'date', label: 'Date', required: false },
    { key: 'author', label: 'Author/User', required: false },
    { key: 'source', label: 'Source (e.g. Twitter)', required: false }
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      alert("Only CSV files are supported.");
      return;
    }
    setFile(selectedFile);
    
    // Read first few lines for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const fileHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        setHeaders(fileHeaders);
        
        const preview = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          fileHeaders.forEach((h, i) => row[h] = values[i]);
          return row;
        });
        
        setPreviewData(preview);
        
        // Auto-map based on exact or partial matches
        const initialMapping = {};
        expectedColumns.forEach(exp => {
          const match = fileHeaders.find(h => h.toLowerCase().includes(exp.key.toLowerCase()));
          if (match) initialMapping[exp.key] = match;
        });
        setMapping(initialMapping);
        setStep(2);
      }
    };
    reader.readAsText(selectedFile);
  };

  const validateMapping = () => {
    const newErrors = [];
    expectedColumns.forEach(exp => {
      if (exp.required && !mapping[exp.key]) {
        newErrors.push(`Required column "${exp.label}" is not mapped.`);
      }
    });
    setErrors(newErrors);
    
    if (newErrors.length === 0) {
      setStep(3);
    }
  };

  const handleConfirmImport = () => {
    if (onImport) onImport({ file, mapping });
    // Reset state
    setFile(null);
    setStep(1);
    setPreviewData([]);
    setMapping({});
  };

  return (
    <div className="card w-full max-w-4xl p-0 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/90 p-6 border-b border-slate-800">
        <h3 className="text-lg font-black text-slate-100">Import Data</h3>
        
        {/* Stepper */}
        <div className="flex items-center justify-between max-w-xl mx-auto mt-6 px-4">
          {[
            { num: 1, label: 'Upload' },
            { num: 2, label: 'Map Columns' },
            { num: 3, label: 'Confirm' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step >= s.num
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {s.num}
                </div>
                <span className={`text-xs font-bold ${step >= s.num ? 'text-slate-100' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div className={`flex-1 h-0.5 mx-3 ${step > s.num ? 'bg-purple-600' : 'bg-slate-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: Upload */}
        {step === 1 && (
          <div 
            className="drop-zone border-2 border-dashed border-purple-500/30 hover:border-purple-500 rounded-2xl p-12 text-center bg-purple-500/5 hover:bg-purple-500/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv"
              onChange={(e) => e.target.files && processFile(e.target.files[0])}
            />
            <div className="w-16 h-16 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-2xl flex items-center justify-center mb-1 shadow-lg shadow-purple-500/10">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Click or drag CSV file here to upload</h4>
            <p className="text-xs text-slate-400 max-w-sm">Supported formats: CSV file only. Maximum size: 50MB per upload.</p>
          </div>
        )}

        {/* Step 2: Mapping */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <File className="w-8 h-8 text-purple-400" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-100 text-sm truncate">{file?.name}</div>
                <div className="text-xs text-slate-400">{(file?.size / 1024).toFixed(2)} KB</div>
              </div>
              <button onClick={() => setStep(1)} className="btn btn-icon-sm btn-ghost"><X className="w-4 h-4" /></button>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl space-y-2">
                {errors.map((err, i) => (
                  <div key={i} className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4" /> {err}
                  </div>
                ))}
              </div>
            )}

            <div>
              <h4 className="text-xs font-extrabold text-slate-400 mb-3 uppercase tracking-wider">Map Columns</h4>
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="data-table w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr>
                      <th className="p-3 text-slate-400 font-bold">Required Data Field</th>
                      <th className="p-3 text-slate-400 font-bold">Your CSV Column</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {expectedColumns.map(exp => (
                      <tr key={exp.key}>
                        <td className="p-3">
                          <div className="font-semibold text-slate-200">
                            {exp.label}
                            {exp.required && <span className="text-red-400 ml-1">*</span>}
                          </div>
                        </td>
                        <td className="p-3">
                          <select 
                            className="input w-full max-w-xs text-xs h-[38px] py-1"
                            value={mapping[exp.key] || ''}
                            onChange={(e) => setMapping({ ...mapping, [exp.key]: e.target.value })}
                          >
                            <option value="">-- Ignore --</option>
                            {headers.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-slate-400 mb-3 uppercase tracking-wider">Data Preview</h4>
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900">
                <table className="data-table w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr>
                      {headers.map(h => <th key={h} className="p-2.5 text-slate-400 font-bold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {previewData.map((row, i) => (
                      <tr key={i}>
                        {headers.map(h => <td key={h} className="p-2.5 text-slate-300 truncate max-w-[200px]">{row[h]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setStep(1)} className="btn btn-secondary">Cancel</button>
              <button onClick={validateMapping} className="btn btn-primary">
                <span>Continue</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-xl font-black text-slate-100">Ready to Import</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                File <strong className="text-slate-200">{file?.name}</strong> mapped successfully. The data is ready to be analyzed by the NLP engine.
              </p>
            </div>
            
            <div className="bg-slate-900 inline-block p-4 rounded-xl border border-slate-800 text-left min-w-[300px]">
              <div className="text-[10px] text-slate-400 font-black mb-2 uppercase tracking-wider">Mapped Columns</div>
              {Object.entries(mapping).map(([key, val]) => val && (
                <div key={key} className="flex justify-between items-center text-xs py-1 border-b border-white/5 last:border-0">
                  <span className="text-slate-300 font-semibold">{expectedColumns.find(e => e.key === key)?.label}</span>
                  <span className="text-purple-400 font-mono">→ {val}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button onClick={() => setStep(2)} className="btn btn-secondary">Back to Mapping</button>
              <button onClick={handleConfirmImport} className="btn btn-primary">
                Start Import Process
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
