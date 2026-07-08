import { memo } from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { CategoryList } from './CategoryList';
import { TableRowData } from './types';

interface CategorySectionProps {
  categoryId: string;
  title: string;
  data: TableRowData[];
  align?: 'left' | 'center';
}

export const CategorySection = memo(({ categoryId, title, data, align = 'center' }: CategorySectionProps) => {
  const { toggleCategory, collapsed, density } = useSettingsStore(useShallow((state: any) => ({
    toggleCategory: state.toggleCategory,
    collapsed: state.collapsedCategories[categoryId],
    density: state.displayDensity,
  })));

  if (data.length === 0) return null;

  const py = density === 'compact' ? 'py-0.5' : 'py-1';
  const textSz = density === 'compact' ? 'text-[8.5px]' : 'text-[10px]';

  return (
    <div className="flex flex-col">
      <Tooltip content={`Toggle ${title}`}>
        <button
          id={categoryId === 'npcs_alchemist' ? 'tutorial-alchemist-category' : undefined}
          onClick={() => toggleCategory(categoryId)}
          className={`flex items-center ${align === 'left' ? 'justify-start pl-4 pr-4 mx-4' : 'justify-center mx-6'} gap-1 my-0.5 ${py} ${textSz} font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] select-none hover:text-white hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-subtle)] rounded-full bg-black/30 shadow-none font-[var(--font-heading)] min-w-0 overflow-hidden`}
        >
          <div className="shrink-0">{collapsed ? <ChevronRight size={10} strokeWidth={3} /> : <ChevronDown size={10} strokeWidth={3} />}</div>
          <span className="truncate block whitespace-nowrap overflow-hidden text-ellipsis">{title}</span>
        </button>
      </Tooltip>

      {!collapsed && <CategoryList data={data} collapsed={collapsed} categoryId={categoryId} />}
    </div>
  );
});
