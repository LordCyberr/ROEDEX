import React from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { Minus, Maximize2, PanelLeft, PanelTop, Globe2, PackageOpen, Settings, Users, ExternalLink, RefreshCw, ArrowDownLeft, Lock, Unlock, Scroll, Book, User, Activity, Zap } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { useTranslation } from '../../hooks/useTranslation';
export interface HeaderProps {
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ onPointerDown }) => {
  const { t } = useTranslation();
  const { addBobMessage } = useSettingsStore(useShallow((state: any) => ({ addBobMessage: state.addBobMessage })));
  const {

    isMinimized, setIsMinimized,
    isUILocked, setIsUILocked,
    layoutMode, setLayoutMode,
    activeTab, setActiveTab,
    popOutTab, poppedOutWindows,
    mergeAllTabs,
    tabDimensions, setTabDimensions,
    tutorialStep,
    tutorialCompleted,
    seenTabs,
    updateNotificationSettings,
  } = useSettingsStore(useShallow((state: any) => ({
    isMinimized: state.isMinimized,
    setIsMinimized: state.setIsMinimized,
    isUILocked: state.isUILocked,
    setIsUILocked: state.setIsUILocked,
    layoutMode: state.layoutMode,
    setLayoutMode: state.setLayoutMode,
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
    popOutTab: state.popOutTab,
    poppedOutWindows: state.poppedOutWindows,
    mergeAllTabs: state.mergeAllTabs,
    tabDimensions: state.tabDimensions,
    setTabDimensions: state.setTabDimensions,
    tutorialStep: state.notificationSettings?.tutorialStep || 0,
    tutorialCompleted: state.notificationSettings?.tutorialCompleted || false,
    seenTabs: state.notificationSettings?.seenTabs || {},
    updateNotificationSettings: state.updateNotificationSettings,
    setShowSniper: state.setShowSniper,
  })));

  const [, setSettingsClicks] = React.useState(0);

  const handleTabHover = (tabId: string) => {
    if (!tutorialCompleted) return; // Only show tooltips AFTER tutorial
    if (!seenTabs[tabId]) {
      updateNotificationSettings({ seenTabs: { ...seenTabs, [tabId]: true } });
      let text = '';
      if (tabId === 'global') text = t('tabHover.global' as any);
      if (tabId === 'favorites') text = t('tabHover.favorites' as any);
      if (tabId === 'profile') text = t('tabHover.profile' as any) || 'Profile';
      if (tabId === 'session') text = t('tabHover.session' as any);
      if (tabId === 'chest') text = t('tabHover.chest' as any) || 'Chest';
      if (tabId === 'npcs') text = t('tabHover.npcs' as any);
      if (tabId === 'tracking') text = t('tabHover.tracking' as any);
      if (tabId === 'roepedia') text = t('tabHover.roepedia' as any) || 'ROEpedia';
      if (tabId === 'settings') text = t('tabHover.settings' as any);
      
      if (text) {
        addBobMessage({
          title: "Tab Info",
          message: text,
          type: 'info'
        });
      }
    }
  };

  const tabs = [
    { id: 'global', icon: Globe2, label: t('tabs.global'), badge: null },
    { id: 'profile', icon: User, label: t('tabs.profile' as any) || 'Profile', badge: null },
    { id: 'session', icon: Activity, label: t('tabs.session'), badge: null },
    { id: 'chest', icon: PackageOpen, label: t('tabs.chest' as any) || 'Chest', badge: null },
    { id: 'npcs', icon: Users, label: t('tabs.npcs' as any) || 'NPCs & Players', badge: null },
    { id: 'quests', icon: Scroll, label: t('tabs.quests' as any) || 'Quests', badge: null },
    { id: 'roepedia', icon: Book, label: t('tabs.roepedia' as any) || 'ROEpedia', badge: null },
    { id: 'settings', icon: Settings, label: t('tabs.settings'), badge: null }
  ] as const;

  const activeDimKey = layoutMode === 'horizontal' ? `${activeTab}_horizontal` : `${activeTab}_vertical`;
  const hasCustomDimensions = !!tabDimensions[activeDimKey]?.width || !!tabDimensions[activeDimKey]?.height;


  return (
    <div 
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if (!isUILocked) onPointerDown?.(e);
      }}
      className={`flex items-center justify-between bg-[var(--bg-base)] border-b border-[var(--border-subtle)] shrink-0 select-none relative z-50 flex-nowrap ${isUILocked ? 'pointer-events-auto cursor-default' : 'cursor-grab active:cursor-grabbing'} ${
        layoutMode === 'horizontal' ? 'px-2 py-1 gap-1.5' : 'px-1.5 py-1 gap-1'
      }`}
    >

      {layoutMode === 'horizontal' ? (
        <>
          {/* Horizontal Tabs Section */}
          <div role="tablist" aria-label="Main Navigation Tabs" className="flex items-center flex-1 justify-center gap-1.5 shrink min-w-0">
            {tabs.map(tab => (
              <Tooltip key={tab.id} content={tab.label}>
                <button
                  id={`tutorial-${tab.id}-tab`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-label={tab.label}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === 'settings') {
                      setSettingsClicks(prev => {
                        if (prev + 1 >= 5) {
                          useSettingsStore.getState().setShowSniper(true);
                          return 0;
                        }
                        return prev + 1;
                      });
                    } else {
                      setSettingsClicks(0);
                    }
                  }}
                  onMouseEnter={() => handleTabHover(tab.id)}
                  className={`group relative transition-all duration-200 flex items-center justify-center shrink-0 p-1 rounded-lg ${
                    activeTab === tab.id 
                      ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] shadow-[0_0_8px_rgba(0,0,0,0)] shadow-[var(--accent-primary)]/10 ring-1 ring-inset ring-[var(--accent-primary)]/50' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={14} strokeWidth={2} />
                  {/* Live count badge */}
                  {(tab as any).badge != null && (
                    <span className={`absolute -top-0.5 -right-0.5 min-w-[13px] h-[13px] px-0.5 rounded-full text-[7px] font-black text-white flex items-center justify-center leading-none ${(tab as any).badgeColor || 'bg-rose-500'} shadow-sm`}>
                      {(tab as any).badge > 99 ? '99+' : (tab as any).badge}
                    </span>
                  )}
                </button>
              </Tooltip>
            ))}
          </div>

          <div className="w-[1px] h-4 mx-1.5 bg-[var(--border-subtle)] shrink-0" />

          {/* Horizontal Utilities Section */}
          <div className="flex items-center shrink-0 ml-auto gap-1">
            <Tooltip content={t('stats.quickStats') || 'Quick Performance Stats'}>
              <button 
                aria-label={t('stats.quickStats') || 'Quick Performance Stats'}
                onClick={() => {
                  const state = useSettingsStore.getState() as any;
                  state.setIsQuickStatsOpen?.(!state.isQuickStatsOpen);
                }}
                className="group relative rounded-full text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all duration-200 flex items-center justify-center p-1"
              >
                <Zap size={12} />
              </button>
            </Tooltip>
            <Tooltip content={t('misc.resetAutoSize')}>
              <button 
                aria-label={t('misc.resetAutoSize') || 'Reset Auto Size'}
                onClick={() => setTabDimensions(activeDimKey, undefined, undefined)}
                className={`group relative rounded-full ${hasCustomDimensions ? 'text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'} transition-all duration-200 flex items-center justify-center p-1`}
              >
                <RefreshCw size={12} />
              </button>
            </Tooltip>
            {!poppedOutWindows[activeTab] && (
              <Tooltip content={t('misc.popOutTab')}>
                <button 
                  id="tutorial-popout-btn"
                  aria-label={t('misc.popOutTab') || 'Pop Out Tab'}
                  onClick={(e) => popOutTab(activeTab, e.clientX + 20, e.clientY + 20)}
                  className="group relative rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/20 transition-all duration-200 flex items-center justify-center p-1"
                >
                  <ExternalLink size={12} />
                </button>
              </Tooltip>
            )}
            {(Object.keys(poppedOutWindows).length > 0 || tutorialStep === 11) && (
              <Tooltip content={t('ui.mergeTabs')}>
                <button 
                  id="tutorial-merge-btn"
                  aria-label={t('ui.mergeTabs') || 'Merge Tabs'}
                  onClick={() => mergeAllTabs()}
                  className="group relative rounded-full text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all duration-200 flex items-center justify-center p-1"
                >
                  <ArrowDownLeft size={12} />
                </button>
              </Tooltip>
            )}

            <Tooltip content={t('misc.toggleLayout')}>
              <button 
                id="tutorial-layout-toggle"
                aria-label={t('misc.toggleLayout') || 'Toggle Layout Mode'}
                onClick={() => setLayoutMode('vertical')}
                className="group relative rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/20 transition-all duration-200 flex items-center justify-center p-1"
              >
                <PanelLeft size={12} />
              </button>
            </Tooltip>
            <Tooltip content={isUILocked ? (t('ui.unlockUi' as any) || "Unlock UI") : (t('ui.lockUi' as any) || "Lock UI")}>
              <button 
                id="tutorial-lock-btn"
                aria-label={isUILocked ? (t('ui.unlockUi' as any) || "Unlock UI") : (t('ui.lockUi' as any) || "Lock UI")}
                onClick={() => setIsUILocked(!isUILocked)}
                className={`group relative rounded-full transition-all duration-200 flex items-center justify-center p-1 ${isUILocked ? 'text-amber-400 hover:text-amber-300' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/10'}`}
              >
                {isUILocked ? <Lock size={12} /> : <Unlock size={12} />}
              </button>
            </Tooltip>
            <Tooltip content={isMinimized ? t('misc.maximize') : t('misc.minimize')}>
              <button 
                id="tutorial-minimize-btn"
                aria-label={isMinimized ? t('misc.maximize') || 'Maximize' : t('misc.minimize') || 'Minimize'}
                onClick={() => setIsMinimized(true)}
                className="group relative rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/20 transition-all duration-200 flex items-center justify-center p-1"
              >
                <Minus size={12} />
              </button>
            </Tooltip>
          </div>
        </>
      ) : (
        /* Vertical Mode - Single Unified Block of Icons with Partition */
          <div className="flex w-full items-center justify-between gap-1 px-1 relative shrink-0">
          {/* Vertical Tabs Section */}
          <div role="tablist" aria-label="Main Navigation Tabs" className="grid grid-cols-4 grid-rows-2 gap-1 shrink-0">
            {tabs.map(tab => (
              <Tooltip key={tab.id} content={tab.label}>
                <button
                  id={`tutorial-${tab.id}-tab`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-label={tab.label}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === 'settings') {
                      setSettingsClicks(prev => {
                        if (prev + 1 >= 5) {
                          useSettingsStore.getState().setShowSniper(true);
                          return 0;
                        }
                        return prev + 1;
                      });
                    } else {
                      setSettingsClicks(0);
                    }
                  }}
                  onMouseEnter={() => handleTabHover(tab.id)}
                  className={`group relative transition-all duration-200 flex items-center justify-center p-1 rounded-lg shrink-0 ${
                    activeTab === tab.id 
                      ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] shadow-[0_0_8px_rgba(0,0,0,0)] shadow-[var(--accent-primary)]/10 ring-1 ring-[var(--accent-primary)]/50' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={14} strokeWidth={2} className="shrink-0" />
                  {/* Live count badge */}
                  {(tab as any).badge != null && (
                    <span className={`absolute -top-0.5 -right-0.5 min-w-[13px] h-[13px] px-0.5 rounded-full text-[7px] font-black text-white flex items-center justify-center leading-none ${(tab as any).badgeColor || 'bg-rose-500'} shadow-sm`}>
                      {(tab as any).badge > 99 ? '99+' : (tab as any).badge}
                    </span>
                  )}
                </button>
              </Tooltip>
            ))}
          </div>

          {/* Partition */}
          <div className="w-[1px] h-6 bg-[var(--border-subtle)]/70 shrink-0 mx-1" />

          {/* Vertical Utilities Section */}
          <div className="grid grid-cols-3 grid-rows-2 gap-1 shrink-0">
            {!poppedOutWindows[activeTab] && (
              <Tooltip content={t('misc.popOutTab')}>
                <button 
                  id="tutorial-popout-btn"
                  aria-label={t('misc.popOutTab') || 'Pop Out Tab'}
                  onClick={(e) => popOutTab(activeTab, e.clientX + 20, e.clientY + 20)}
                  className="col-start-1 row-start-1 group relative rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/20 transition-all duration-200 flex items-center justify-center p-1 shrink-0"
                >
                  <ExternalLink size={13} className="shrink-0" />
                </button>
              </Tooltip>
            )}
            {(Object.keys(poppedOutWindows).length > 0 || tutorialStep === 11) && (
              <Tooltip content={t('ui.mergeTabs')}>
                <button 
                  id="tutorial-merge-btn"
                  aria-label={t('ui.mergeTabs') || 'Merge Tabs'}
                  onClick={() => mergeAllTabs()}
                  className="col-start-1 row-start-2 group relative rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all duration-200 flex items-center justify-center p-1 shrink-0"
                >
                  <ArrowDownLeft size={13} className="shrink-0" />
                </button>
              </Tooltip>
            )}

            <Tooltip content={t('misc.toggleLayout')}>
              <button 
                id="tutorial-layout-toggle"
                aria-label={t('misc.toggleLayout') || 'Toggle Layout Mode'}
                onClick={() => setLayoutMode('horizontal')}
                className="col-start-2 row-start-1 group relative rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all duration-200 flex items-center justify-center p-1 shrink-0"
              >
                <PanelTop size={14} className="shrink-0" />
              </button>
            </Tooltip>

            <Tooltip content={isUILocked ? (t('ui.unlockUi' as any) || "Unlock UI") : (t('ui.lockUi' as any) || "Lock UI")}>
              <button 
                id="tutorial-lock-btn"
                aria-label={isUILocked ? (t('ui.unlockUi' as any) || "Unlock UI") : (t('ui.lockUi' as any) || "Lock UI")}
                onClick={() => setIsUILocked(!isUILocked)}
                className={`col-start-3 row-start-2 group relative rounded-lg transition-all duration-200 flex items-center justify-center p-1 shrink-0 ${isUILocked ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'}`}
              >
                {isUILocked ? <Lock size={14} className="shrink-0" /> : <Unlock size={14} className="shrink-0" />}
              </button>
            </Tooltip>

            <Tooltip content={t('misc.resetAutoSize')}>
              <button 
                aria-label={t('misc.resetAutoSize') || 'Reset Auto Size'}
                onClick={() => setTabDimensions(activeDimKey, undefined, undefined)}
                className={`col-start-2 row-start-2 group relative rounded-lg ${hasCustomDimensions ? 'text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'} transition-all duration-200 flex items-center justify-center p-1 shrink-0`}
              >
                <RefreshCw size={13} className="shrink-0" />
              </button>
            </Tooltip>

            <Tooltip content={isMinimized ? t('misc.maximize') : t('misc.minimize')}>
              <button 
                id="tutorial-minimize-btn"
                aria-label={isMinimized ? t('misc.maximize') || 'Maximize' : t('misc.minimize') || 'Minimize'}
                onClick={() => setIsMinimized(!isMinimized)}
                className="col-start-3 row-start-1 group relative rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all duration-200 flex items-center justify-center p-1 shrink-0"
              >
                {isMinimized ? <Maximize2 size={14} className="shrink-0" /> : <Minus size={14} className="shrink-0" />}
              </button>
            </Tooltip>


          </div>
        </div>
      )}
    </div>
  );
});

Header.displayName = 'Header';
