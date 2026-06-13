import React from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { ToggleRow } from './SettingsControls';

export const AdvancedSettings: React.FC = () => {
  const store = useTrackerStore();

  return (
    <>
      <ToggleRow label="Developer Mode" value={store.developerMode} onChange={store.setDeveloperMode} />
      <p className="text-[9px] text-[var(--text-muted)] px-1 mt-1 mb-2">
        Enable advanced performance tracking and socket debugging logs. Use <strong>Ctrl+Shift+D</strong> to toggle the live diagnostic panel.
      </p>
      <div className="mt-8 border-t border-red-500/30 pt-4">
        <h3 className="text-red-500 font-bold mb-2 text-xs uppercase tracking-wider">Danger Zone</h3>
        <p className="text-[10px] text-red-400/70 mb-3 leading-relaxed">
          Wiping the database will completely erase all custom layouts, preferences, lifetimes stats, and session data. It will simulate a fresh installation of the extension, allowing you to replay the full onboarding experience.
        </p>
        <button 
          onClick={() => {
            if (window.confirm("Are you sure you want to permanently erase all ROEDEX database files? This cannot be undone.")) {
              indexedDB.deleteDatabase('roedex-db');
              localStorage.removeItem('roedex-storage');
              window.location.reload();
            }
          }}
          className="bg-red-500/10 hover:bg-red-500/30 text-red-500 border border-red-500/50 px-4 py-2 rounded font-bold text-xs transition-all w-full tracking-wider"
        >
          HARD RESET DATABASE
        </button>
      </div>
    </>
  );
};
