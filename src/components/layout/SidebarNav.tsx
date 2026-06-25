import React from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { PanelTop, PanelLeft, Settings } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { useTranslation } from '../../hooks/useTranslation';

export const SidebarNav: React.FC = () => {
  const { t } = useTranslation();
  const layoutMode = useSettingsStore((state) => state.layoutMode);
  const setLayoutMode = useSettingsStore((state) => state.setLayoutMode);

  const toggleLayout = () => {
    setLayoutMode(layoutMode === 'vertical' ? 'horizontal' : 'vertical');
  };

  return (
    <div className="flex flex-col items-center py-2 px-1 gap-2 bg-[#0F141E]/80 backdrop-blur-md border-r border-white/5 w-12 shrink-0">
      <div className="text-white/50 mb-2 -rotate-90 text-[10px] tracking-[0.2em] font-bold whitespace-nowrap mt-8">
        ROEDEX V4
      </div>
      
      <div className="flex-1" />



      <Tooltip content={t('ui.toggleLayout')}>
        <button 
          onClick={toggleLayout}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors pointer-events-auto"
        >
          {layoutMode === 'vertical' ? <PanelTop size={18} /> : <PanelLeft size={18} />}
        </button>
      </Tooltip>

      <Tooltip content={t('ui.settings')}>
        <button 
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors pointer-events-auto"
        >
          <Settings size={18} />
        </button>
      </Tooltip>
    </div>
  );
};
