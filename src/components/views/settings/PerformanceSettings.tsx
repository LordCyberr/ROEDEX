import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { SelectRow } from './SettingsControls';
import { Activity } from 'lucide-react';

export const PerformanceSettings: React.FC = () => {
  const store = useSettingsStore(useShallow(state => ({
    visualQuality: state.visualQuality,
    setVisualQuality: state.setVisualQuality,
    mapSettings: state.mapSettings,
    updateMapSettings: state.updateMapSettings,
    recordingSettings: state.recordingSettings,
    updateRecordingSettings: state.updateRecordingSettings,
  })));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1 px-1">
        <Activity size={14} className="text-[var(--accent-primary)]" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">Core Performance</span>
      </div>
      
      <SelectRow
        label="Visual Quality"
        value={store.visualQuality || 'high'}
        options={[
          { label: 'High (Glass & Animations)', value: 'high' },
          { label: 'Max Performance (Solid & Fast)', value: 'performance' }
        ]}
        onChange={(v) => store.setVisualQuality(v as any)}
      />
      {store.visualQuality === 'performance' && (
        <div className="px-2 py-1 mb-2 text-[9px] text-[var(--accent-primary)] font-bold bg-[var(--accent-primary)]/10 rounded border border-[var(--accent-primary)]/30">
          Max Performance enabled. Blurs, heavy shadows, and animations are disabled to maximize your in-game FPS.
        </div>
      )}

      <div className="mt-2 flex items-center gap-2 mb-1 px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Engine Tuning</span>
      </div>

      <SelectRow
        label="Map Refresh Rate"
        value={store.mapSettings.mapRefreshRate || 'uncapped'}
        options={[
          { label: 'Uncapped (Smoothest)', value: 'uncapped' },
          { label: '144 FPS', value: '144' },
          { label: '60 FPS (Battery Saver)', value: '60' }
        ]}
        onChange={(v) => store.updateMapSettings({ mapRefreshRate: v as any })}
      />
      
      <SelectRow
        label="GPS Smoothing Level"
        value={store.recordingSettings.smoothingLevel || 'light'}
        options={[
          { label: 'Off (Raw Data)', value: 'off' },
          { label: 'Light Smoothing', value: 'light' },
          { label: 'Heavy Smoothing', value: 'heavy' }
        ]}
        onChange={(v) => store.updateRecordingSettings({ smoothingLevel: v as any })}
      />
    </div>
  );
};
