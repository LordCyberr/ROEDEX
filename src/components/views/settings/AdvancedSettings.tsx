import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
// import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ToggleRow } from './SettingsControls';
import { clearAllStorageAndReload } from '../../../store/trackerStore';

export const AdvancedSettings: React.FC = () => {
  const { t } = useTranslation();
  const store = useSettingsStore(useShallow(state => ({
    developerMode: state.developerMode,
    setDeveloperMode: state.setDeveloperMode
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
      <div className="mt-8 border-t border-red-500/30 pt-4">
        <h3 className="text-red-500 font-bold mb-2 text-xs uppercase tracking-wider">{t('settings.dangerZone')}</h3>
        <p className="text-[10px] text-red-400/70 mb-3 leading-relaxed">
          {t('settings.dangerZoneDesc') || "Wiping the database will completely erase all custom layouts, preferences, lifetimes stats, and session data. It will simulate a fresh installation of the extension, allowing you to replay the full onboarding experience."}
        </p>
        <button 
          onClick={() => {
            if (window.confirm(t('settings.confirmHardReset') || "Are you sure you want to permanently erase all ROEDEX database files? This cannot be undone.")) {
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
