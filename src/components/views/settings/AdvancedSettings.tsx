import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ToggleRow } from './SettingsControls';
import { clearAllStorageAndReload } from '../../../store/trackerStore';
import { Activity } from 'lucide-react';

export const AdvancedSettings: React.FC = () => {
  const { t } = useTranslation();
  const store = useSettingsStore(useShallow(state => ({
    developerMode: state.developerMode,
    setDeveloperMode: state.setDeveloperMode,
    profilerMetrics: state.profilerMetrics,
  })));

  return (
    <>
      <ToggleRow 
        label={t('settings.enableDevMode')} 
        value={store.developerMode} 
        onChange={(val) => {
          if (val) {
            useSettingsStore.getState().addNotification({
              type: 'warning',
              title: t('settings.devModeEnabled') || 'Developer Mode Enabled',
              message: t('settings.devModeWarning') || 'Warning: This mode is for development and diagnostics ONLY! It enables debug overlays and logs that may impact performance. Do not enable this unless you know what you are doing!'
            });
          }
          store.setDeveloperMode(val);
        }} 
      />
      <p className="text-[9px] text-[var(--text-muted)] px-1 mt-1 mb-2">
        {t('settings.devModeDesc') || "Enable advanced performance tracking and socket debugging logs."} <strong>Alt+Shift+X</strong>
      </p>

      {store.developerMode && (
        <div className="mt-4 p-3 bg-black/40 border border-emerald-500/30 rounded-xl shadow-inner">
          <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Activity size={12} /> Performance Diagnostics</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col bg-white/5 p-2 rounded border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-[8px] text-slate-400 uppercase tracking-widest">Parse Avg</span>
              <span className="font-mono text-[12px] font-black text-slate-200">{store.profilerMetrics?.parseTime?.average?.toFixed(2) || '0.00'}ms</span>
            </div>
            <div className="flex flex-col bg-white/5 p-2 rounded border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-[8px] text-slate-400 uppercase tracking-widest">Dropped Events</span>
              <span className="font-mono text-[12px] font-black text-slate-200">{store.profilerMetrics?.parseTime?.droppedEvents || 0}</span>
            </div>
            <div className="flex flex-col bg-white/5 p-2 rounded border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-[8px] text-slate-400 uppercase tracking-widest">Render Avg</span>
              <span className="font-mono text-[12px] font-black text-slate-200">{store.profilerMetrics?.renderTime?.average?.toFixed(2) || '0.00'}ms</span>
            </div>
            <div className="flex flex-col bg-white/5 p-2 rounded border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-[8px] text-slate-400 uppercase tracking-widest">Max Parse</span>
              <span className="font-mono text-[12px] font-black text-slate-200">{store.profilerMetrics?.parseTime?.max?.toFixed(2) || '0.00'}ms</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-red-500/30 pt-4">
        <h3 className="text-red-500 font-bold mb-2 text-xs uppercase tracking-wider">{t('settings.dangerZone')}</h3>
        <p className="text-[10px] text-red-400/70 mb-3 leading-relaxed">
          {t('settings.dangerZoneDesc') || "Wiping the database will completely erase all custom layouts, preferences, lifetimes stats, and session data. It will simulate a fresh installation of the extension, allowing you to replay the full onboarding experience."}
        </p>
        <button 
          onClick={() => {
            if (window.confirm(t('settings.confirmHardReset') || "Are you sure you want to permanently erase all ROEDEX database files? This cannot be undone.")) {
              useSettingsStore.getState().setFirstTimeWizardCompleted(false);
              useSettingsStore.getState().updateProfilerMetrics({
                parseTime: { average: 0, max: 0, droppedEvents: 0 },
                renderTime: { average: 0, lastRender: 0 }
              });
              clearAllStorageAndReload();
            }
          }}
          className="bg-red-500/10 hover:bg-red-500/30 text-red-500 border border-red-500/50 px-4 py-2 rounded font-bold text-xs transition-all w-full tracking-wider"
        >
          {t('settings.hardResetBtn') || "HARD RESET DATABASE"}
        </button>
      </div>
    </>
  );
};
