import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useTrackerStore } from '../../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { SelectRow, ToggleRow } from './SettingsControls';
import { useTranslation } from '../../../hooks/useTranslation';
import { Trash2, RefreshCw, BarChart2, Database } from 'lucide-react';

export const TrackingSettings: React.FC = () => {
  const store = useSettingsStore(useShallow(state => ({
    displayMode: state.displayMode,
    setDisplayMode: state.setDisplayMode,
    orbSize: state.orbSize,
    setOrbSize: state.setOrbSize,
    orbBorderThickness: state.orbBorderThickness,
    setOrbBorderThickness: state.setOrbBorderThickness,
    tableSettings: state.tableSettings,
    updateTableSettings: state.updateTableSettings
  })));
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3.5">
      {/* Group 1: Session Options */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 pl-1">
          <Database size={10} />
          <span>Session & Cache</span>
        </div>
        <SelectRow
          label={t('settings.displayMode')}
          value={store.displayMode}
          options={[{ label: 'Session View', value: 'session' }, { label: 'Current Zone', value: 'current_zone' }]}
          onChange={(v) => store.setDisplayMode(v as any)}
        />
        <p className="text-[9px] text-[var(--text-muted)] mt-1 mb-2 px-2.5 leading-relaxed">{t('settings.sessionViewDesc')}</p>

        <button
          onClick={() => {
            useTrackerStore.getState().clearSessionCache();
            useSettingsStore.getState().addNotification({ type: 'system-online', title: 'CACHE CLEARED', message: 'Local session cache has been erased.' });
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] rounded-xl border border-red-500/20 transition-all mb-1 shadow-sm font-bold uppercase tracking-wider"
        >
          <Trash2 size={11} /> {t('settings.clearSessionCache')}
        </button>
        <button
          onClick={() => {
            useTrackerStore.getState().clearSession();
            useSettingsStore.getState().addNotification({ type: 'system-online', title: 'SESSION RESET', message: 'Loot tracking session has been reset.' });
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-[10px] rounded-xl border border-white/10 transition-all shadow-sm font-bold uppercase tracking-wider"
        >
          <RefreshCw size={11} /> {t('settings.resetLootSession')}
        </button>
      </div>

      {/* Group 3: Data Table */}
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 pl-1">
          <BarChart2 size={10} />
          <span>Global Data Table</span>
        </div>
        <SelectRow
          label="Tracking Style"
          value={store.tableSettings.trackingStyle || 'center'}
          options={[
            { label: 'Center Arrow', value: 'center' },
            { label: 'Nav Ring', value: 'ring' }
          ]}
          onChange={(v) => store.updateTableSettings({ trackingStyle: v as any })}
        />
        <ToggleRow 
          label={t('settings.showDistance')} 
          value={store.tableSettings.showDistance} 
          onChange={(v) => store.updateTableSettings({ showDistance: v })} 
        />
        <ToggleRow 
          label={t('settings.showCount')} 
          value={store.tableSettings.showCount} 
          onChange={(v) => store.updateTableSettings({ showCount: v })} 
        />
        <ToggleRow 
          label={t('settings.showTimer')} 
          value={store.tableSettings.showTimer} 
          onChange={(v) => store.updateTableSettings({ showTimer: v })} 
        />
        <SelectRow
          label={t('settings.raritySortOrder')}
          value={store.tableSettings.raritySortOrder}
          options={[
            { label: 'Alphabetical Only', value: 'none' },
            { label: 'Mythic -> Common', value: 'desc' },
            { label: 'Common -> Mythic', value: 'asc' }
          ]}
          onChange={(v) => store.updateTableSettings({ raritySortOrder: v as any })}
        />
        <SelectRow
          label={t('settings.maxRespawnTooltips')}
          value={store.tableSettings.maxRespawnTooltips?.toString() || '5'}
          options={[
            { label: 'Show 5', value: '5' },
            { label: 'Show 10', value: '10' },
            { label: 'Show 15', value: '15' },
            { label: 'Show 20', value: '20' }
          ]}
          onChange={(v) => store.updateTableSettings({ maxRespawnTooltips: parseInt(v) as any })}
        />
        <SelectRow
          label={t('settings.recentLootLength') || 'Recent Loot List Length'}
          value={store.tableSettings.recentLootLength?.toString() || '10'}
          options={[
            { label: 'Show 5 items', value: '5' },
            { label: 'Show 10 items', value: '10' },
            { label: 'Show 15 items', value: '15' }
          ]}
          onChange={(v) => store.updateTableSettings({ recentLootLength: parseInt(v) as any })}
        />
        <ToggleRow 
          label={t('settings.enableItemGlow')} 
          value={store.tableSettings.itemGlow} 
          onChange={(v) => store.updateTableSettings({ itemGlow: v })} 
        />
      </div>
    </div>
  );
};
