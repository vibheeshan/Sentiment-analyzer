import React, { useState } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';

export default function BrandSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLogo, setNewBrandLogo] = useState("⚡");
  const [brands, setBrands] = useState([
    { id: 1, name: 'BrandPulse Core', logo: '⚡', active: true },
    { id: 2, name: 'Acme SaaS Suite', logo: '🚀', active: false },
    { id: 3, name: 'Global Retail Pro', logo: '🛍️', active: false }
  ]);

  const activeBrand = brands.find(b => b.active) || brands[0];

  const selectBrand = (id) => {
    setBrands(brands.map(b => ({ ...b, active: b.id === id })));
    setIsOpen(false);
  };

  const handleAddBrand = () => {
    if (!newBrandName.trim()) return;
    const newId = brands.length + 1;
    const newBrand = {
      id: newId,
      name: newBrandName,
      logo: newBrandLogo,
      active: true
    };
    setBrands(brands.map(b => ({ ...b, active: false })).concat(newBrand));
    setNewBrandName("");
    setShowAddModal(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 px-3.5 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-sm"
      >
        <span className="text-base">{activeBrand.logo}</span>
        <span>{activeBrand.name}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 w-60 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 shadow-2xl p-2 rounded-xl z-50 space-y-1">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Workspaces</div>
          {brands.map(b => (
            <button
              key={b.id}
              onClick={() => selectBrand(b.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${b.active ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
            >
              <div className="flex items-center gap-2">
                <span>{b.logo}</span>
                <span>{b.name}</span>
              </div>
              {b.active && <Check className="w-4 h-4 text-purple-400" />}
            </button>
          ))}
          <div className="border-t border-white/5 pt-1 mt-1">
            <button 
              onClick={() => { setShowAddModal(true); setIsOpen(false); }} 
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-purple-400 font-bold hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Workspace
            </button>
          </div>
        </div>
      )}

      {/* Modal for adding workspace */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Add New Brand Workspace</h3>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Brand Name</label>
              <input 
                type="text" 
                value={newBrandName} 
                onChange={(e) => setNewBrandName(e.target.value)} 
                placeholder="e.g. Acme Health" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Workspace Icon / Logo</label>
              <select 
                value={newBrandLogo} 
                onChange={(e) => setNewBrandLogo(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="⚡">⚡ Lightning</option>
                <option value="🚀">🚀 Rocket</option>
                <option value="🛍️">🛍️ Shopping</option>
                <option value="✨">✨ Stars</option>
                <option value="🔥">🔥 Fire</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddBrand} 
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
              >
                Create Brand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
