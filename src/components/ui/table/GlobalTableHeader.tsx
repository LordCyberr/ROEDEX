import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { Clock } from 'lucide-react';

export const GlobalTableHeader: React.FC = () => {
  const tableSettings = useSettingsStore((state: any) => state.tableSettings);
  const { t } = useTranslation();

  let gridCols = '1fr';
  if (tableSettings.showDistance) gridCols += ' 26px';
  if (tableSettings.showCount) gridCols += ' 32px';
  if (tableSettings.showTimer) gridCols += ' 28px';

  return (
    <div className={`grid gap-1 items-center px-1.5 py-0.5 text-[8.5px] font-bold text-[var(--text-muted)] border-b border-[var(--border-subtle)] uppercase tracking-wider bg-[var(--bg-panel)] font-[var(--font-heading)]`} style={{ gridTemplateColumns: gridCols }}>
      <div>{t('columns.name')}</div>
      {tableSettings.showDistance && <div className="text-right">{t('columns.dist')}</div>}
      {tableSettings.showCount && (
        <div className="text-right flex items-center justify-end gap-0.5 whitespace-nowrap">
          ❤️/💀
        </div>
      )}
      {tableSettings.showTimer && (
        <div className="text-right flex justify-end">
          <Clock size={9} className="text-gray-500" />
        </div>
      )}
    </div>
  );
};
