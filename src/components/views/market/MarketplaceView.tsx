import React, { useState } from 'react';
import { MarketDashboard } from './MarketDashboard';
import { BazaarGrid } from './BazaarGrid';
import { ItemDetailsModal } from './ItemDetailsModal';

export const MarketplaceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bazaar'>('bazaar');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-panel)] text-[var(--text-primary)]">
      {/* Header Tabs */}
      <div className="flex items-center px-4 py-2 border-b border-[var(--border-subtle)] gap-4 shrink-0 bg-[var(--bg-base)]">
        <button
          onClick={() => setActiveTab('bazaar')}
          className={`px-3 py-1.5 text-sm font-bold tracking-wide rounded-md transition-colors ${
            activeTab === 'bazaar'
              ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/50'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
          }`}
        >
          Bazaar
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 text-sm font-bold tracking-wide rounded-md transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/50'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
          }`}
        >
          Global Sales
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'dashboard' ? (
          <MarketDashboard />
        ) : (
          <BazaarGrid onSelectItem={setSelectedItemId} />
        )}
      </div>

      {/* Item Details Modal */}
      {selectedItemId && (
        <ItemDetailsModal 
          itemId={selectedItemId} 
          onClose={() => setSelectedItemId(null)} 
        />
      )}
    </div>
  );
};
