import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { Minus, Maximize2, PanelLeft, PanelTop, Globe2, Star, PackageOpen, Settings, Users, ExternalLink, RefreshCw, ScrollText, Lock, Unlock } from 'lucide-react';

import { useTranslation } from '../../hooks/useTranslation';

export interface HeaderProps {
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({ onPointerDown }) => {
  const { t } = useTranslation();
  const isMinimized = useTrackerStore((state) => state.isMinimized);
  const setIsMinimized = useTrackerStore((state) => state.setIsMinimized);
  const isUILocked = useTrackerStore((state) => state.isUILocked);
  const setIsUILocked = useTrackerStore((state) => state.setIsUILocked);
  
  const layoutMode = useTrackerStore((state) => state.layoutMode);
  const activeTab = useTrackerStore((state) => state.activeTab);
  const setActiveTab = useTrackerStore((state) => state.setActiveTab);
  const setLayoutMode = useTrackerStore((state) => state.setLayoutMode);
  const popOutTab = useTrackerStore((state) => state.popOutTab);
  const poppedOutWindows = useTrackerStore((state) => state.poppedOutWindows);
  const tabDimensions = useTrackerStore((state) => state.tabDimensions);
  const setTabDimensions = useTrackerStore((state) => state.setTabDimensions);

  const tabs = [
    { id: 'global', icon: Globe2, label: t('tabs.global') },
    { id: 'favorites', icon: Star, label: t('tabs.favorites') },
    { id: 'session', icon: PackageOpen, label: t('tabs.session') },
    { id: 'npcs', icon: Users, label: t('tabs.npcs') },
    { id: 'quests', icon: ScrollText, label: 'Quests' },
    { id: 'settings', icon: Settings, label: t('tabs.settings') }
  ] as const;

  const hasCustomDimensions = !!tabDimensions[activeTab]?.width || !!tabDimensions[activeTab]?.height;

  return (
    <div 
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onPointerDown?.(e);
      }}
      className={`flex items-center justify-between bg-[var(--bg-base)] border-b border-[var(--border-subtle)] shrink-0 select-none cursor-grab active:cursor-grabbing relative z-50 flex-nowrap ${isUILocked ? 'pointer-events-auto' : ''} ${
        layoutMode === 'horizontal' ? 'px-3 py-1 gap-2' : 'px-1 py-0 gap-1'
      }`}
    >

      {layoutMode === 'horizontal' ? (
        <>
          {/* Horizontal Tabs Section */}
          <div className="flex items-center flex-1 justify-center gap-2 shrink min-w-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                title={tab.label}
                className={`group relative transition-all duration-200 flex items-center justify-center shrink-0 p-1.5 rounded-xl ${
                  activeTab === tab.id 
                    ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] shadow-[0_0_8px_rgba(0,0,0,0)] shadow-[var(--accent-primary)]/10 ring-1 ring-inset ring-[var(--accent-primary)]/50' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                }`}
              >
                <tab.icon size={16} strokeWidth={2} />
              </button>
            ))}
          </div>

          <div className="w-[1px] h-6 mx-2 bg-[var(--border-subtle)] shrink-0" />

          {/* Horizontal Utilities Section */}
          <div className="flex items-center shrink-0 ml-auto gap-1">
            <button 
              onClick={() => setTabDimensions(activeTab, undefined, undefined)}
              title={t('misc.resetAutoSize')}
              className={`group relative rounded-full ${hasCustomDimensions ? 'text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'} transition-all duration-200 flex items-center justify-center p-1.5`}
            >
              <RefreshCw size={14} />
            </button>
            {!poppedOutWindows[activeTab] && (
              <button 
                onClick={(e) => popOutTab(activeTab, e.clientX + 20, e.clientY + 20)}
                title={t('misc.popOutTab')}
                className="group relative rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/20 transition-all duration-200 flex items-center justify-center p-1.5"
              >
                <ExternalLink size={14} />
              </button>
            )}
            <button 
              onClick={() => setIsUILocked(!isUILocked)}
              title={isUILocked ? "Unlock UI" : "Lock UI (Click-Through Mode)"}
              className={`group relative rounded-full transition-all duration-200 flex items-center justify-center p-1.5 ${isUILocked ? 'text-red-400 hover:text-red-300 bg-red-500/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'}`}
            >
              {isUILocked ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
            <button 
              onClick={() => setLayoutMode('vertical')}
              title={t('misc.toggleLayout')}
              className="group relative rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all duration-200 flex items-center justify-center p-1.5"
            >
              <PanelLeft size={16} />
            </button>
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? t('misc.maximize') : t('misc.minimize')}
              className="group relative rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all duration-200 flex items-center justify-center p-1.5"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
            </button>
          </div>
        </>
      ) : (
        /* Vertical Mode - Single Unified Block of Icons with Partition */
        <div className="flex w-full items-center justify-between gap-1 px-1 overflow-hidden">
          {/* Vertical Tabs Section */}
          <div className="grid grid-cols-3 grid-rows-2 justify-items-center gap-1 flex-1 min-w-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                title={tab.label}
                className={`group relative transition-all duration-200 flex items-center justify-center shrink-0 p-1 rounded-lg w-full max-w-[28px] ${
                  activeTab === tab.id 
                    ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] shadow-[0_0_8px_rgba(0,0,0,0)] shadow-[var(--accent-primary)]/10 ring-1 ring-[var(--accent-primary)]/50' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                }`}
              >
                <tab.icon size={14} strokeWidth={2} />
              </button>
            ))}
          </div>

          {/* Partition */}
          <div className="w-[1px] h-6 bg-[var(--border-subtle)]/70 shrink-0 mx-1" />

          {/* Vertical Utilities Section */}
          <div className="grid grid-cols-3 grid-rows-2 justify-items-center gap-1 flex-1 min-w-0">
            {!poppedOutWindows[activeTab] && (
              <button 
                onClick={(e) => popOutTab(activeTab, e.clientX + 20, e.clientY + 20)}
                title={t('misc.popOutTab')}
                className="group relative rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/20 transition-all duration-200 flex items-center justify-center p-1 w-full max-w-[28px]"
              >
                <ExternalLink size={13} />
              </button>
            )}

            <button 
              onClick={() => setLayoutMode('horizontal')}
              title={t('misc.toggleLayout')}
              className="group relative rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all duration-200 flex items-center justify-center p-1 w-full max-w-[28px]"
            >
              <PanelTop size={14} />
            </button>

            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? t('misc.maximize') : t('misc.minimize')}
              className="group relative rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all duration-200 flex items-center justify-center p-1 w-full max-w-[28px]"
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
            </button>

            <button 
              onClick={() => setTabDimensions(activeTab, undefined, undefined)}
              title={t('misc.resetAutoSize')}
              className={`group relative rounded-lg ${hasCustomDimensions ? 'text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'} transition-all duration-200 flex items-center justify-center p-1 w-full max-w-[28px]`}
            >
              <RefreshCw size={13} />
            </button>

            <button 
              onClick={() => setIsUILocked(!isUILocked)}
              title={isUILocked ? "Unlock UI" : "Lock UI (Click-Through Mode)"}
              className={`group relative rounded-lg transition-all duration-200 flex items-center justify-center p-1 w-full max-w-[28px] ${isUILocked ? 'text-red-400 hover:text-red-300 bg-red-500/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'}`}
            >
              {isUILocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
