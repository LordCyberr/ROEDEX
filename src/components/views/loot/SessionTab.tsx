import React, { useMemo } from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { useSettingsStore } from '../../../store/settingsStore';

// @ts-ignore
import { FixedSizeList as List } from 'react-window';
// @ts-ignore
import { AutoSizer } from 'react-virtualized-auto-sizer';

import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { PackageOpen, Play, Square, Diamond, Sword, Pickaxe, Axe, Leaf, Trash2, History } from 'lucide-react';

import { getResellValue } from '../../../data/prices';
import { getItemInfo } from '../../../data/rarity';
import { useGlobalTick } from '../../../core/tick';
import { AICompanion } from '../../../core/companion/AICompanion';
import { Tooltip } from '../../ui/Tooltip';
import { formatDuration } from '../../../utils/formatters';
import { useTranslation } from '../../../hooks/useTranslation';

const getRarityColor = (name: string) => {
  const info = getItemInfo(name);
  if (!info) return 'text-slate-300';
  switch (info.rarity) {
    case 'uncommon': return 'text-blue-400 font-medium';
    case 'rare': return 'text-green-400 font-bold';
    case 'mythic': return 'text-purple-400 font-black';
    case 'common':
    default: return 'text-slate-300';
  }
};


export const SessionTab: React.FC<{ isHorizontal: boolean; compactHeightClass: string }> = ({ isHorizontal, compactHeightClass }) => {
  const { t } = useTranslation();
  const { 
    sessionActive, setSessionActive, 
    sessionRunes, sessionLoot, 
    clearSession, sessionStartTime, setSessionStartTime,
    sessionMobsKilled, sessionTreesCut, sessionOresMined, sessionPlantsHarvested,
    sessionSettings, endSession
  } = useTrackerStore(useShallow((state: any) => ({
    sessionActive: state.sessionActive,
    setSessionActive: state.setSessionActive,
    sessionRunes: state.sessionRunes,
    sessionLoot: state.sessionLoot,
    clearSession: state.clearSession,
    setIsRunHistoryOpen: state.setIsRunHistoryOpen,
    sessionStartTime: state.sessionStartTime,
    setSessionStartTime: state.setSessionStartTime,
    sessionMobsKilled: state.sessionMobsKilled,
    sessionTreesCut: state.sessionTreesCut,
    sessionOresMined: state.sessionOresMined,
    sessionPlantsHarvested: state.sessionPlantsHarvested,
    sessionSettings: state.sessionSettings,
    endSession: state.endSession,
  })));

  const now = useGlobalTick();
  
  const sortedLoot = useMemo(() => Object.entries(sessionLoot as Record<string, number>).sort((a, b) => b[1] - a[1]), [sessionLoot]);
  const totalLootValue = useMemo(() => sortedLoot.reduce((acc, [name, qty]) => acc + getResellValue(name, qty), 0), [sortedLoot]);
  const totalWorth = sessionRunes + totalLootValue;

  const durationMs = sessionActive && sessionStartTime ? now - sessionStartTime : 0;
  
  

  const handleToggleSession = () => {
    if (sessionActive) {
      endSession(totalLootValue);
    } else {
      clearSession();
      setSessionStartTime(Date.now());
      setSessionActive(true);
    }
  };

  const isTimeGoalMet = sessionSettings.timeAttackMinutes > 0 && durationMs >= sessionSettings.timeAttackMinutes * 60000;
  const isLootGoalMet = sessionSettings.lootValueGoal > 0 && totalWorth >= sessionSettings.lootValueGoal;

  return (
    <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-2 h-full w-full`}>
      {/* Left Card: Session Controls */}
      <div className={`flex flex-col gap-2 ${isHorizontal ? 'w-[180px]' : 'w-full'} shrink-0 h-fit bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-2 rounded-lg relative overflow-y-auto custom-scrollbar`}>
        {(isTimeGoalMet || isLootGoalMet) && sessionActive && (
          <div className="absolute inset-0 pointer-events-none rounded border-2 border-emerald-500/50 animate-pulse z-0"></div>
        )}
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={handleToggleSession}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-all shadow-md ${
                sessionActive 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
              }`}
            >
              {sessionActive ? <><Square size={10} fill="currentColor" /> {t('sessionTab.finishRun')}</> : <><Play size={10} fill="currentColor" /> {t('sessionTab.startNewRun')}</>}
            </button>
            <Tooltip content={t('sessionTab.resetLoot' as any) as string}>
              <button
                onClick={() => {
                  clearSession();
                  AICompanion.onClearLoot();
                }}
                className="flex items-center justify-center px-2 py-1.5 rounded bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] text-[#cfd2d5] border border-[var(--border-subtle)] transition-all shadow-md"
              >
                <Trash2 size={10} />
              </button>
            </Tooltip>
            <Tooltip content={t('sessionTab.viewPastRuns' as any) as string}>
              <button
                onClick={() => useSettingsStore.getState().setIsRunHistoryOpen(true)}
                className="flex items-center justify-center px-2 py-1.5 rounded bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] text-[#cfd2d5] border border-[var(--border-subtle)] transition-all shadow-md"
              >
                <History size={10} />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center justify-between px-2 py-1 bg-[var(--bg-card)] rounded border border-white/[0.04] shrink-0">
            <div className="text-[14px] font-mono font-black text-white tracking-widest drop-shadow">
              {formatDuration(durationMs)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 shrink-0">
            <div className="bg-[var(--bg-card)] border border-white/[0.04] rounded flex items-center justify-between px-2 py-1.5 hover:bg-[var(--bg-hover)] transition-colors">
              <Sword size={12} className="text-rose-400" />
              <span className="text-white font-mono font-black text-[11px]">{sessionMobsKilled as number}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-white/[0.04] rounded flex items-center justify-between px-2 py-1.5 hover:bg-[var(--bg-hover)] transition-colors">
              <Axe size={12} className="text-amber-600" />
              <span className="text-white font-mono font-black text-[11px]">{sessionTreesCut as number}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-white/[0.04] rounded flex items-center justify-between px-2 py-1.5 hover:bg-[var(--bg-hover)] transition-colors">
              <Pickaxe size={12} className="text-slate-400" />
              <span className="text-white font-mono font-black text-[11px]">{sessionOresMined as number}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-white/[0.04] rounded flex items-center justify-between px-2 py-1.5 hover:bg-[var(--bg-hover)] transition-colors">
              <Leaf size={12} className="text-emerald-500" />
              <span className="text-white font-mono font-black text-[11px]">{sessionPlantsHarvested as number}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1 shrink-0 pt-0.5">
            <div className="bg-[var(--bg-card)] border border-[var(--border-accent)] rounded px-2 py-1.5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent"></div>
              <span className="text-cyan-400/80 text-[7px] uppercase tracking-wider flex items-center gap-1 z-10 font-bold"><Diamond size={8} /> {t('sessionTab.totalWorth')}</span>
              <span className="text-cyan-400 font-mono font-black text-[12px] z-10">{totalWorth.toLocaleString()}</span>
            </div>

          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-0.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-2 rounded-lg overflow-hidden h-full z-10">
        <div className={`flex flex-col gap-0.5 overflow-hidden flex-1 min-h-[60px] ${compactHeightClass}`}>
          {sortedLoot.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#3a3f47] italic text-[9px] gap-1">
              <PackageOpen size={16} className="opacity-50" />
              {t('stats.noLoot')}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center px-1.5 py-0.5 mt-1 border-b border-white/5 mb-1 shrink-0">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{t('loot.item')}</span>
                <div className="flex items-center gap-2 shrink-0 pr-2">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest w-12 text-right">{t('loot.count')}</span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest w-14 text-right">{t('loot.total')}</span>
                </div>
              </div>
              <ul className="flex-1 overflow-y-auto custom-scrollbar h-full pr-1 pb-1 flex flex-col gap-0.5">
                {sortedLoot.map(([name, quantity]) => {
                  const totalRunes = getResellValue(name, quantity);
                  const unitPrice = getResellValue(name, 1);
                  const displayTotal = totalRunes >= 1000 ? (totalRunes / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : totalRunes;
                  return (
                    <motion.li layout key={name} className="flex justify-between items-center bg-[var(--bg-hover)] px-1.5 py-1 rounded border border-[var(--border-subtle)] shrink-0">
                      <Tooltip content={name}><span className={`truncate pr-1 ${getRarityColor(name)}`}>{name}</span></Tooltip>
                      <Tooltip content={`Unit Value: ${unitPrice > 0 ? unitPrice : '-'}`}>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-emerald-400 font-bold text-[10px] w-12 text-right">x{quantity}</span>
                          <Tooltip content={totalRunes.toLocaleString()}><span className="text-[#5a6270] font-mono text-[9px] w-14 text-right">{displayTotal}</span></Tooltip>
                        </div>
                      </Tooltip>
                    </motion.li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
