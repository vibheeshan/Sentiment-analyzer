import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Check, Search, Settings, Trash2, Pencil, Copy, Archive, Sparkles, User, ShieldCheck, Sliders, RefreshCw, X } from 'lucide-react';
import Popover from './ui/Popover';
import { ConfirmDialog, Toast } from './ui';

export default function BrandSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [renameBrandId, setRenameBrandId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLogo, setNewBrandLogo] = useState("⚡");
  const [showArchived, setShowArchived] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [aiRules, setAiRules] = useState(true);
  const [restrictExports, setRestrictExports] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const [brands, setBrands] = useState([
    { id: 1, name: 'BrandPulse Core', logo: '⚡', active: true, archived: false },
    { id: 2, name: 'Acme SaaS Suite', logo: '🚀', active: false, archived: false },
    { id: 3, name: 'Global Retail Pro', logo: '🛍️', active: false, archived: false }
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && buttonRef.current && dropdownRef.current && !buttonRef.current.contains(event.target) && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeBrand = useMemo(() => brands.find((brand) => brand.active && !brand.archived) || brands.find((brand) => !brand.archived) || brands[0], [brands]);

  const visibleBrands = useMemo(
    () => brands
      .filter((brand) => brand.archived === showArchived)
      .filter((brand) => brand.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [brands, searchQuery, showArchived]
  );

  const activeCount = brands.filter((brand) => !brand.archived).length;
  const archivedCount = brands.filter((brand) => brand.archived).length;

  const selectBrand = (id) => {
    setBrands((current) => current.map((brand) => ({ ...brand, active: brand.id === id })));
    setIsOpen(false);
  };

  const duplicateBrand = (id) => {
    setBrands((current) => {
      const source = current.find((brand) => brand.id === id);
      if (!source) return current;
      const copy = {
        ...source,
        id: Date.now(),
        name: `${source.name} Copy`,
        active: false,
        archived: false,
      };
      return current.map((brand) => ({ ...brand, active: false })).concat(copy);
    });
  };

  const archiveBrand = (id) => {
    setBrands((current) => current.map((brand) => brand.id === id ? { ...brand, archived: !brand.archived, active: false } : brand));
  };

  const deleteBrand = (id) => {
    setBrands((current) => {
      const remaining = current.filter((brand) => brand.id !== id);
      if (remaining.length === 0) return current;
      if (!remaining.some((brand) => brand.active)) {
        remaining[0].active = true;
      }
      return remaining;
    });
  };

  const handleDeleteBrand = (id, e) => {
    e.stopPropagation();
    if (brands.length <= 1) {
      setToastMessage('Cannot delete the last remaining workspace.');
      return;
    }
    setConfirmDeleteId(id);
  };

  const startRenameBrand = (brand) => {
    setRenameBrandId(brand.id);
    setRenameValue(brand.name);
    setShowRenameModal(true);
  };

  const applyRename = () => {
    if (!renameValue.trim()) return;
    setBrands((current) => current.map((brand) => brand.id === renameBrandId ? { ...brand, name: renameValue } : brand));
    setRenameBrandId(null);
    setRenameValue("");
    setShowRenameModal(false);
  };

  const handleAddBrand = () => {
    if (!newBrandName.trim()) return;
    const brand = {
      id: Date.now(),
      name: newBrandName,
      logo: newBrandLogo,
      active: true,
      archived: false,
    };
    setBrands((current) => current.map((item) => ({ ...item, active: false })).concat(brand));
    setNewBrandName("");
    setNewBrandLogo('⚡');
    setShowAddModal(false);
  };

  const openWorkspaceSettings = () => setShowSettingsPanel(true);

  const closeSettingsPanel = () => setShowSettingsPanel(false);

  const saveWorkspaceSettings = () => {
    setShowSettingsPanel(false);
    setToastMessage('Workspace settings saved.');
  };

  return (
    <div className="brand-switcher relative">
      <Toast message={toastMessage} visible={Boolean(toastMessage)} onClose={() => setToastMessage('')} />
      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete workspace"
        message="Delete this workspace permanently?"
        confirmLabel="Delete"
        onConfirm={() => {
          deleteBrand(confirmDeleteId);
          setConfirmDeleteId(null);
          setToastMessage('Workspace deleted.');
        }}
        onClose={() => setConfirmDeleteId(null)}
      />
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className="brand-btn"
      >
        <span className="text-base">{activeBrand?.logo}</span>
        <span className="truncate">{activeBrand?.name}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={buttonRef}
        className="brand-dropdown"
      >
        <div ref={dropdownRef} role="menu" className="w-full h-full flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-[18px] border border-slate-200/60 bg-slate-50/90 px-3.5 py-2 dark:border-white/10 dark:bg-slate-950/80">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Workspace</div>
              <div className="text-sm font-black text-slate-900 dark:text-slate-100">Select active workspace</div>
            </div>
            <span className="rounded-full bg-purple-600/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-purple-300">Enterprise</span>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-[18px] border border-slate-200/70 bg-white/90 p-2 text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:border-white/10 dark:bg-slate-900/95">
            <button
              type="button"
              onClick={() => setShowArchived(false)}
              className={`rounded-xl px-3 py-2 font-black transition ${!showArchived ? 'bg-purple-600/10 text-purple-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setShowArchived(true)}
              className={`rounded-xl px-3 py-2 font-black transition ${showArchived ? 'bg-purple-600/10 text-purple-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
            >
              Archived ({archivedCount})
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-[18px] border border-slate-200/70 bg-white/90 px-3 py-2 dark:border-white/10 dark:bg-slate-900/95">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search workspace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200"
            />
          </div>

          <div className="flex items-center justify-between px-1.5 py-0.5">
            <div className="text-[9px] uppercase font-black tracking-wider text-slate-500">Workspaces</div>
            <div className="text-[10px] font-semibold text-slate-400">{visibleBrands.length} shown</div>
          </div>

          <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
            {visibleBrands.length > 0 ? visibleBrands.map((brand) => (
              <div
                key={brand.id}
                role="button"
                tabIndex={0}
                onClick={() => selectBrand(brand.id)}
                onKeyDown={(event) => event.key === 'Enter' && selectBrand(brand.id)}
                className={`group flex h-[54px] w-full items-center justify-between rounded-[18px] px-3.5 text-sm font-bold transition-all ${brand.active ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-sm' : 'bg-slate-100/80 text-slate-700 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/70'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden text-left min-w-0">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-200 text-base dark:bg-white/10 dark:text-slate-300">
                    {brand.logo}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{brand.name}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{brand.archived ? 'Archived workspace' : 'Live workspace'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {brand.active && <Check className="w-4 h-4 text-white" />}
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); startRenameBrand(brand); }}
                    className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100"
                    aria-label="Rename workspace"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); duplicateBrand(brand.id); }}
                    className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100"
                    aria-label="Duplicate workspace"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); archiveBrand(brand.id); }}
                    className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100"
                    aria-label={brand.archived ? 'Restore workspace' : 'Archive workspace'}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => handleDeleteBrand(brand.id, event)}
                    className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-red-400"
                    aria-label="Delete workspace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="rounded-[18px] border border-dashed border-slate-300/60 bg-slate-50/80 p-4 text-center text-xs text-slate-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-400">
                No workspaces match your search. Create a new one or clear the query.
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-purple-500"
            >
              <Plus className="w-4 h-4" /> Add workspace
            </button>
            <button
              type="button"
              onClick={openWorkspaceSettings}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-purple-400 hover:text-purple-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <Settings className="w-4 h-4" /> Workspace settings
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[11px] text-slate-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Workspace details
                </div>
                <div className="font-black text-slate-900 dark:text-slate-100">
                  {activeBrand?.name || 'No active workspace'}
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="grid gap-3 text-[10px] sm:grid-cols-2">
              {[
                { icon: User, label: 'Team size', value: '14 collaborators' },
                { icon: ShieldCheck, label: 'Roles', value: 'Admin + Analyst' },
                { icon: Sliders, label: 'Policy', value: 'Governed AI rules' },
                { icon: RefreshCw, label: 'Activity', value: 'Synced 3 min ago' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl bg-white border border-slate-200 p-3 dark:bg-slate-950 dark:border-white/10">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </div>
                  <div className="mt-1 font-bold text-slate-900 dark:text-slate-100">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Popover>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-overlay-panel)] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Create Brand Workspace</h3>
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

      {showRenameModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-overlay-panel)] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Rename Workspace</h3>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Workspace Name</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Enter workspace name"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={applyRename}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
              >
                Rename Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsPanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-overlay-panel)] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Workspace Settings</div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{activeBrand?.name || 'Workspace'} configuration</h3>
              </div>
              <button
                type="button"
                onClick={closeSettingsPanel}
                className="rounded-2xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                aria-label="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setAutoSync((prev) => !prev)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${autoSync ? 'border-purple-500/30 bg-purple-50 text-slate-900 dark:bg-purple-500/10 dark:text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300'}`}
              >
                <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  <RefreshCw className="w-4 h-4 text-purple-500" /> Auto-sync sources
                </div>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Keep review sources and sentiment pipelines aligned automatically.</p>
              </button>
              <button
                type="button"
                onClick={() => setAiRules((prev) => !prev)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${aiRules ? 'border-purple-500/30 bg-purple-50 text-slate-900 dark:bg-purple-500/10 dark:text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300'}`}
              >
                <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-purple-500" /> Govern AI rules
                </div>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Apply trust, authenticity, and content quality filters to AI responses.</p>
              </button>
              <button
                type="button"
                onClick={() => setRestrictExports((prev) => !prev)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${restrictExports ? 'border-purple-500/30 bg-purple-50 text-slate-900 dark:bg-purple-500/10 dark:text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300'}`}
              >
                <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  <Sliders className="w-4 h-4 text-purple-500" /> Export restrictions
                </div>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Control whether workspace data can be exported from the assistant.</p>
              </button>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Workspace status</div>
                <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/80 px-3 py-2 dark:bg-white/5">
                    <span>Source sync</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-500">Active</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/80 px-3 py-2 dark:bg-white/5">
                    <span>Context memory</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">24h</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 justify-end">
              <button
                type="button"
                onClick={closeSettingsPanel}
                className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-purple-400 hover:text-purple-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveWorkspaceSettings}
                className="rounded-2xl bg-purple-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-purple-500"
              >
                Save settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
