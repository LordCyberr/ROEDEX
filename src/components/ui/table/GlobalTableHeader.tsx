import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { Clock, Heart, Skull } from 'lucide-react';

export const GlobalTableHeader: React.FC = () => {
  const tableSettings = useSettingsStore((state: any) => state.tableSettings);
  const { t } = useTranslation();

  let gridCols = '1fr';
  if (tableSettings.showDistance) gridCols += ' 26px';
  if (tableSettings.showCount) gridCols += ' 32px';
  if (tableSettings.showTimer) gridCols += ' 28px';

  return (
    <div 
      className="grid gap-1.5 items-center px-2 py-1.5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest backdrop-blur-md rounded-t-lg shadow-sm" 
      style={{ 
        gridTemplateColumns: gridCols,
        background: 'color-mix(in srgb, var(--bg-card) 60%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--border-subtle) 50%, transparent)'
      }}
    >
      <div className="pl-1 truncate" style={{ color: 'var(--text-secondary)' }}>{t('columns.name')}</div>
      {tableSettings.showDistance && <div className="text-right tracking-wider opacity-80">{t('columns.dist')}</div>}
      {tableSettings.showCount && (
        <div className="text-right flex items-center justify-end gap-1 whitespace-nowrap opacity-90">
          <Heart size={10} className="text-red-400/90 drop-shadow-sm" />
          <span className="opacity-50 text-[8px] mx-0.5">/</span>
          <Skull size={10} className="text-gray-400 drop-shadow-sm" />
        </div>
      )}
      {tableSettings.showTimer && (
        <div className="text-right flex justify-end">
          <Clock size={10} className="text-[var(--accent-primary)] opacity-80 drop-shadow-sm" />
        </div>
      )}
    </div>
  );
};
