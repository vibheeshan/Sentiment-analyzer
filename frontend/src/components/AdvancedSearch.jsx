import React, { useState } from 'react';
import { Search, Plus, Trash2, Filter } from 'lucide-react';

export default function AdvancedSearch({ onSearch }) {
  const [conditions, setConditions] = useState([
    { id: 1, field: 'text', operator: 'contains', value: '', booleanOp: 'AND' }
  ]);
  const [useRegex, setUseRegex] = useState(false);

  const addCondition = () => {
    setConditions([
      ...conditions,
      { id: Date.now(), field: 'text', operator: 'contains', value: '', booleanOp: 'AND' }
    ]);
  };

  const removeCondition = (id) => {
    if (conditions.length === 1) return;
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id, key, value) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, [key]: value } : c));
  };

  const handleSearch = () => {
    if (onSearch) onSearch({ conditions, useRegex });
  };

  return (
    <div className="card w-full max-w-4xl p-6 rounded-[18px] bg-slate-900 border border-slate-800 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-5 h-5 text-sky-400" />
        <h3 className="text-lg font-black text-slate-100">Advanced Search Builder</h3>
      </div>

      <div className="space-y-4 mb-6">
        {conditions.map((condition, index) => (
          <div key={condition.id} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            {index > 0 ? (
              <select
                className="input text-xs font-bold w-24 h-[42px] shrink-0"
                value={condition.booleanOp}
                onChange={(e) => updateCondition(condition.id, 'booleanOp', e.target.value)}
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
                <option value="NOT">NOT</option>
              </select>
            ) : (
              <div className="w-24 text-xs font-black text-purple-400 pl-2 uppercase tracking-wider h-[42px] flex items-center shrink-0">WHERE</div>
            )}

            <select
              className="input text-xs font-medium flex-1 h-[42px] min-w-[140px]"
              value={condition.field}
              onChange={(e) => updateCondition(condition.id, 'field', e.target.value)}
            >
              <option value="text">Feedback Text</option>
              <option value="author">Author Name</option>
              <option value="sentiment">Sentiment Score</option>
              <option value="topic">Topic/Theme</option>
            </select>

            <select
              className="input text-xs font-medium flex-1 h-[42px] min-w-[130px]"
              value={condition.operator}
              onChange={(e) => updateCondition(condition.id, 'operator', e.target.value)}
            >
              <option value="contains">Contains</option>
              <option value="equals">Equals</option>
              <option value="starts_with">Starts With</option>
              <option value="ends_with">Ends With</option>
              {condition.field === 'sentiment' && (
                <>
                  <option value="gt">Greater Than</option>
                  <option value="lt">Less Than</option>
                </>
              )}
            </select>

            <input
              type="text"
              className="input text-xs flex-[2] h-[42px] min-w-[180px]"
              placeholder="Enter value..."
              value={condition.value}
              onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
            />

            <button
              onClick={() => removeCondition(condition.id)}
              disabled={conditions.length === 1}
              className="btn btn-icon-sm btn-ghost text-slate-400 hover:text-red-400 disabled:opacity-30 flex-shrink-0"
              title="Remove condition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-6">
          <button
            onClick={addCondition}
            className="btn btn-secondary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" /> <span>Add Condition</span>
          </button>
          
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-600 accent-purple-600 focus:ring-purple-600"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
            />
            Enable Regex Matching
          </label>
        </div>

        <button
          onClick={handleSearch}
          className="btn btn-primary h-[42px] px-5"
        >
          <Search className="w-4 h-4" /> <span>Run Search Query</span>
        </button>
      </div>
    </div>
  );
}
