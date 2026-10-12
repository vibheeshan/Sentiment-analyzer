import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MessageSquare, Tag, AlertTriangle } from 'lucide-react';

export default function GlobalSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setIsOpen(true);
      // Mocking /feedback backend endpoint
      setTimeout(() => {
        const mockData = [
          { id: 1, type: 'feedback', text: `Customer mentioned ${query} in a recent review.`, sentiment: 'positive' },
          { id: 2, type: 'topic', text: `Topic: ${query} issues`, count: 42 },
          { id: 3, type: 'alert', text: `Alert: Spike in negative sentiment around ${query}`, severity: 'high' }
        ];
        setResults(mockData);
        setIsLoading(false);
      }, 400);
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    if (onSelect) onSelect(item);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="h-[42px] bg-slate-900/60 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 text-xs font-medium rounded-[11px] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 block w-full pl-9 pr-12 placeholder-slate-400 transition-all shadow-inner"
          placeholder="Search feedback, topics, alerts... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
        />
        {isLoading ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none hidden sm:flex">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/10 rounded">⌘K</kbd>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
          <ul className="max-h-64 overflow-y-auto p-1">
            {results.map((item) => (
              <li 
                key={item.id} 
                onClick={() => handleSelect(item)}
                className="flex items-start gap-3 p-3 hover:bg-slate-800 cursor-pointer rounded-md transition-colors"
              >
                {item.type === 'feedback' && <MessageSquare className="w-4 h-4 text-emerald-400 mt-0.5" />}
                {item.type === 'topic' && <Tag className="w-4 h-4 text-sky-400 mt-0.5" />}
                {item.type === 'alert' && <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />}
                
                <div className="flex flex-col">
                  <span className="text-sm text-slate-200 font-medium">{item.text}</span>
                  {item.type === 'topic' && <span className="text-xs text-slate-500">{item.count} mentions</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
