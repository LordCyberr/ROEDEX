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
    popOutTab, poppedOutWindows, tabDimensions
  } = useSettingsStore(useShallow(state => ({
    layoutMode: state.layoutMode,
    popOutTab: state.popOutTab,
    poppedOutWindows: state.poppedOutWindows,
    tabDimensions: state.tabDimensions
  })));

  const isHorizontal = layoutMode === 'horizontal';

  const [activeTab, setActiveTab] = useState<'profile' | 'session' | 'chest'>(forcedTab || 'session');

  useEffect(() => {
    if (forcedTab) setActiveTab(forcedTab);
  }, [forcedTab]);

  const activeDimKey = isHorizontal ? `session_horizontal` : `session_vertical`;
  const activeDim = tabDimensions[activeDimKey] || {};
  const hasCustomHeight = activeDim.height !== undefined;
  const compactHeightClass = !hasCustomHeight ? 'max-h-[250px]' : '';

  return (
    <div className="flex flex-col h-full w-full min-w-[150px] text-[10px] bg-[var(--bg-base)]">

      {/* Tab Navigation */}
      {!hideNavigation && (
        <div className="flex p-1 gap-1 border-b border-white/[0.04] bg-[var(--bg-panel)] shrink-0 pointer-events-auto">
          <div className="flex-1 flex relative">
            <button 
              onClick={() => !poppedOutWindows['session_profile'] && setActiveTab('profile')}
              disabled={!!poppedOutWindows['session_profile']}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${poppedOutWindows['session_profile'] ? 'opacity-30 cursor-not-allowed' : activeTab === 'profile' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <User size={12} /> Profile
            </button>
            {!poppedOutWindows['session_profile'] && (
              <Tooltip content={`${t('ui.popOutTab')} - ${t('ui.profile')}`}>
                <button 
                  onClick={(e) => { e.stopPropagation(); popOutTab('session_profile', e.clientX, e.clientY); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <ArrowUpRight size={10} />
                </button>
              </Tooltip>
            )}
          </div>
          <div className="flex-1 flex relative">
            <button 
              onClick={() => !poppedOutWindows['session_session'] && setActiveTab('session')}
              disabled={!!poppedOutWindows['session_session']}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${poppedOutWindows['session_session'] ? 'opacity-30 cursor-not-allowed' : activeTab === 'session' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <Activity size={12} /> Session
            </button>
            {!poppedOutWindows['session_session'] && (
              <Tooltip content={`${t('ui.popOutTab')} - ${t('ui.session')}`}>
                <button 
                  onClick={(e) => { e.stopPropagation(); popOutTab('session_session', e.clientX, e.clientY); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <ArrowUpRight size={10} />
                </button>
              </Tooltip>
            )}
          </div>
          <div className="flex-1 flex relative">
            <button 
              onClick={() => !poppedOutWindows['session_chest'] && setActiveTab('chest')}
              disabled={!!poppedOutWindows['session_chest']}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${poppedOutWindows['session_chest'] ? 'opacity-30 cursor-not-allowed' : activeTab === 'chest' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <PackageOpen size={12} /> Chest
            </button>
            {!poppedOutWindows['session_chest'] && (
              <Tooltip content={`${t('ui.popOutTab')} - ${t('ui.chest')}`}>
                <button 
                  onClick={(e) => { e.stopPropagation(); popOutTab('session_chest', e.clientX, e.clientY); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <ArrowUpRight size={10} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-2 relative">
        {activeTab === 'profile' && <ProfileTab isHorizontal={isHorizontal} />}
        {activeTab === 'session' && <SessionTab isHorizontal={isHorizontal} compactHeightClass={compactHeightClass} />}
        {activeTab === 'chest' && <ChestTab isHorizontal={isHorizontal} compactHeightClass={compactHeightClass} />}
      </div>
    </div>
  );
};
