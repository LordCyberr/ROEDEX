import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';

export const FocusHighlight: React.FC = () => {
  const { t } = useTranslation();
  const store = useTrackerStore();
  const settingsStore = useSettingsStore();

  // Show if HUD enabled, chest is open, and tutorial not seen
  if (!settingsStore.minimalChestHud || !store.isChestOpen || settingsStore.minimalChestTutorialSeen) {
    return null;
  }

  const finishTutorial = () => {
    settingsStore.setMinimalChestTutorialSeen(true);
  };

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-auto bg-black/80 flex items-center justify-center">
      <div className="bg-[#1a1c23] border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-xl font-black text-emerald-400 mb-2 uppercase tracking-widest">{t('focusHighlight.minimalHud')}</h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Welcome to the Minimal Chest HUD! I have extracted your values into draggable widgets.
          Follow these steps to set them up:
        </p>
        
        <div className="flex flex-col gap-4 text-left w-full mb-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">1</div>
            <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-white">{t('focusHighlight.dragBackpack')}</strong> {t('focusHighlight.placeBackpack')}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">2</div>
            <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-white">{t('focusHighlight.dragChest')}</strong> {t('focusHighlight.placeChest')}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold shrink-0">3</div>
            <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-white">{t('focusHighlight.dragRedX')}</strong> {t('focusHighlight.placeRedX')}</p>
          </div>
        </div>

        <button 
          onClick={finishTutorial}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-sm rounded transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >{t('wizard.gotIt')}</button>
      </div>
    </div>
  );
};
