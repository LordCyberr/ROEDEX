import { memo } from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { CategoryList } from './CategoryList';
import { GlobalTableHeader } from './GlobalTableHeader';
import { TableRowData } from './types';

export const CategoryCard = memo(({ categoryId, title, data, showHeader = false }: { categoryId: string; title: string; data: TableRowData[]; showHeader?: boolean }) => {
  const { toggleCategory, collapsed, density } = useSettingsStore(useShallow((state: any) => ({
    toggleCategory: state.toggleCategory,
    collapsed: state.collapsedCategories[categoryId],
    density: state.displayDensity,
  })));

  if (data.length === 0) return null;

  const py = density === 'compact' ? 'py-0.5' : 'py-1';
  const textSz = density === 'compact' ? 'text-[8.5px]' : 'text-[10px]';

  return (
    <div className={`flex flex-col bg-[var(--bg-card)] rounded-lg overflow-hidden shrink-0 shadow-md border border-[var(--border-subtle)] w-fit min-w-fit h-fit max-h-full`}>
      <Tooltip content={`Toggle ${title}`}>
        <button
          onClick={() => toggleCategory(categoryId)}
          className={`flex items-center justify-between px-2 ${py} bg-[var(--bg-base)] hover:bg-[var(--bg-panel)] transition-colors ${textSz} font-bold text-[var(--text-primary)] uppercase tracking-wider shrink-0 select-none border-b border-[var(--border-subtle)] font-[var(--font-heading)]`}
        >
          <div className="flex items-center gap-1">
            {collapsed ? <ChevronRight size={12} strokeWidth={2.5} /> : <ChevronDown size={12} strokeWidth={2.5} />}
            {title}
          </div>
        </button>
      </Tooltip>

      {!collapsed && (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {showHeader && <GlobalTableHeader />}
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <CategoryList data={data} collapsed={collapsed} categoryId={categoryId} />
          </div>
        </div>
      )}
    </div>
  );
});

export const CategoryTable = CategoryCard;
