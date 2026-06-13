import React from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { SelectRow, ToggleRow } from './SettingsControls';
import { useTranslation } from '../../../hooks/useTranslation';

export const TrackingSettings: React.FC = () => {
  const store = useTrackerStore();
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

      <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1 uppercase tracking-wider">Minimal Chest HUD</div>
      <ToggleRow 
        label="Enable Minimal Chest HUD" 
        value={store.minimalChestHud} 
        onChange={(v) => store.setMinimalChestHud(v)} 
      />
      {store.minimalChestHud && (
        <ToggleRow 
          label="Lock Minimal Chest HUD" 
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
        onClick={store.clearSessionCache}
        className="w-full text-center py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] rounded border border-red-500/20 transition-colors mb-1 shadow-sm"
      >
        {t('settings.clearSessionCache')}
      </button>
      <button
        onClick={store.clearSession}
        className="w-full text-center py-1.5 bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] text-[#cfd2d5] text-[10px] rounded border border-[var(--border-subtle)] transition-colors shadow-sm mb-4"
      >
        {t('settings.resetLootSession')}
      </button>
      
      <div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1 uppercase tracking-wider">Global Data Table</div>
      <ToggleRow 
        label="Show Distance Column" 
        value={store.tableSettings.showDistance} 
        onChange={(v) => store.updateTableSettings({ showDistance: v })} 
      />
      <ToggleRow 
        label="Show Counts (Alive/Dead)" 
        value={store.tableSettings.showCount} 
        onChange={(v) => store.updateTableSettings({ showCount: v })} 
      />
      <ToggleRow 
        label="Show Respawn Timers" 
        value={store.tableSettings.showTimer} 
        onChange={(v) => store.updateTableSettings({ showTimer: v })} 
      />
      <SelectRow
        label="Rarity Sort (When Distance Off)"
        value={store.tableSettings.raritySortOrder}
        options={[
          { label: 'Alphabetical Only', value: 'none' },
          { label: 'Mythic -> Common', value: 'desc' },
          { label: 'Common -> Mythic', value: 'asc' }
        ]}
        onChange={(v) => store.updateTableSettings({ raritySortOrder: v as any })}
      />
      <SelectRow
        label="Upcoming Respawns Tooltip Limit"
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
