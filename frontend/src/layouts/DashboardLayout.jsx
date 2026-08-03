import React from 'react';
import Navbar from './Navbar';

export default function DashboardLayout({
  activeTab,
  searchQuery,
  setSearchQuery,
  onShare,
  onExportCsv,
  onMenuToggle,
  children,
}) {
  return (
    <main className="main-area">
      <Navbar
        activeTab={activeTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onShare={onShare}
        onExportCsv={onExportCsv}
        onMenuToggle={onMenuToggle}
      />
      <div className="page-content" id="scroll-container">
        {children}
      </div>
    </main>
  );
}
