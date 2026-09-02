import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { PackageOpen, Activity, User, ArrowUpRight } from 'lucide-react';
import { ProfileTab } from './loot/ProfileTab';
import { SessionTab } from './loot/SessionTab';
import { ChestTab } from './loot/ChestTab';
import { Tooltip } from '../ui/Tooltip';
import { useTranslation } from '../../hooks/useTranslation';

interface LootViewProps {
  forcedTab?: 'profile' | 'session' | 'chest';
  hideNavigation?: boolean;
}

export const LootView: React.FC<LootViewProps> = ({ forcedTab, hideNavigation }) => {
  const { t } = useTranslation();
  
  const { 
    layoutMode,
    popOutTab, poppedOutWindows
  } = useSettingsStore(useShallow(state => ({
    layoutMode: state.layoutMode,
    popOutTab: state.popOutTab,
    poppedOutWindows: state.poppedOutWindows
  })));

  const isHorizontal = layoutMode === 'horizontal';

  const [activeTab, setActiveTab] = useState<'profile' | 'session' | 'chest'>(forcedTab || 'session');

  useEffect(() => {
    if (forcedTab) setActiveTab(forcedTab);
  }, [forcedTab]);

  return (
    <div className="flex flex-col h-full w-full min-w-[150px] text-[10px] bg-[var(--bg-base)]">

      {/* Tab Navigation */}
      {!hideNavigation && (
        <div className="flex p-1.5 gap-1.5 border-b border-white/[0.08] bg-black/40 backdrop-blur-md shrink-0 pointer-events-auto select-none">
          {[
            { id: 'profile', key: 'profile', label: t('sessionTab.profile' as any) || 'Profile', subtitle: t('sessionTab.xpAndLevel' as any) || 'XP & Level', icon: <User size={11} />, color: 'blue' },
            { id: 'session', key: 'session', label: t('sessionTab.run' as any) || 'Run', subtitle: t('sessionTab.dashboard' as any) || 'Dashboard', icon: <Activity size={11} />, color: 'emerald' },
            { id: 'chest', key: 'chest', label: t('sessionTab.chest' as any) || 'Chest', subtitle: t('sessionTab.globalBank' as any) || 'Global Bank', icon: <PackageOpen size={11} />, color: 'cyan' }
          ].map(tab => {
            const isPopped = !!poppedOutWindows[tab.key];
            const isActive = activeTab === tab.id;
            
            let activeClasses = '';
            if (tab.color === 'blue') activeClasses = 'bg-blue-500/20 border-blue-400/40 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
            else if (tab.color === 'emerald') activeClasses = 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
            else if (tab.color === 'cyan') activeClasses = 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]';

            return (
              <div key={tab.id} className="flex-1 flex relative group">
                <button 
                  onClick={() => !isPopped && setActiveTab(tab.id as any)}
                  disabled={isPopped}
                  className={`w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 border text-center cursor-pointer ${
                    isPopped 
                      ? 'opacity-35 cursor-not-allowed border-transparent bg-white/[0.01] text-slate-500' 
                      : isActive 
                        ? activeClasses 
                        : 'border-white/5 text-slate-400 hover:text-slate-100 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {tab.icon}
                    <span className="font-black tracking-wider text-[9.5px] uppercase">{tab.label}</span>
                  </div>
                  <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{tab.subtitle}</span>
                </button>
                {!isPopped && (
                  <div className="absolute top-1 right-1 z-20">
                    <Tooltip content={`${t('ui.popOutTab')} - ${tab.label}`}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); popOutTab(tab.key, e.clientX, e.clientY); }}
                        className="p-1 text-slate-400 hover:text-white hover:bg-black/60 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer border border-white/10 hover:border-white/30 shadow-sm backdrop-blur-md"
                      >
                        <ArrowUpRight size={10} />
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-2 relative flex flex-col min-h-0">
        {activeTab === 'profile' && <ProfileTab isHorizontal={isHorizontal} />}
        {activeTab === 'session' && <SessionTab isHorizontal={isHorizontal} compactHeightClass="" />}
        {activeTab === 'chest' && <ChestTab isHorizontal={isHorizontal} compactHeightClass="" />}
      </div>
    </div>
  );
};
