import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useTrackerStore } from '../../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { SelectRow, ToggleRow } from './SettingsControls';
import { useTranslation } from '../../../hooks/useTranslation';

export const TrackingSettings: React.FC = () => {
  const trackerStore = useTrackerStore();
  const store = useSettingsStore(useShallow(state => ({
    displayMode: state.displayMode,
    setDisplayMode: state.setDisplayMode,
    minimalChestHud: state.minimalChestHud,
    setMinimalChestHud: state.setMinimalChestHud,
    minimalChestHudLocked: state.minimalChestHudLocked,
    setMinimalChestHudLocked: state.setMinimalChestHudLocked,
    setMinimalChestTutorialSeen: state.setMinimalChestTutorialSeen,
    tableSettings: state.tableSettings,
    updateTableSettings: state.updateTableSettings
  })));
  const { t } = useTranslation();

  return (
    <>
      <SelectRow
        label={t('settings.displayMode')}
        value={store.displayMode}
        options={[{ label: 'Session View', value: 'session' }, { label: 'Current Zone', value: 'current_zone' }]}
        onChange={(v) => store.setDisplayMode(v as any)}
      />
      <p className="text-[9px] text-[var(--text-muted)] mt-1 mb-2 px-1">{t('settings.sessionViewDesc')}</p>

      <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1 uppercase tracking-wider">{t('settings.minimalChestHud')}</div>
      <ToggleRow 
        label={t('settings.minimalChestHud')} 
        value={store.minimalChestHud} 
        onChange={(v) => store.setMinimalChestHud(v)} 
      />
      {store.minimalChestHud && (
        <ToggleRow 
          label={t('settings.lockMinimalChestHud')} 
          value={store.minimalChestHudLocked} 
          onChange={(v) => store.setMinimalChestHudLocked(v)} 
        />
      )}
      {store.minimalChestHud && (
        <button
          onClick={() => store.setMinimalChestTutorialSeen(false)}
          className="w-full text-center py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] rounded border border-cyan-500/20 transition-colors mb-4 shadow-sm"
        >
          Reset HUD Tutorial
        </button>
      )}

      <div className="w-full h-px bg-white/5 my-3" />

      <button
        onClick={trackerStore.clearSessionCache}
        className="w-full text-center py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] rounded border border-red-500/20 transition-colors mb-1 shadow-sm"
      >
        {t('settings.clearSessionCache')}
      </button>
      <button
        onClick={trackerStore.clearSession}
        className="w-full text-center py-1.5 bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] text-[#cfd2d5] text-[10px] rounded border border-[var(--border-subtle)] transition-colors shadow-sm mb-4"
      >
        {t('settings.resetLootSession')}
      </button>
      
      <div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1 uppercase tracking-wider">{t('settings.globalDataTable')}</div>
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
    </>
  );
};
