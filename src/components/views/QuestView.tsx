import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Scroll } from 'lucide-react';

export const QuestView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full opacity-50 p-4 text-center">
      <Scroll size={48} className="mb-4 text-[var(--accent-primary)] opacity-50" />
      <div className="text-[var(--text-primary)] font-bold mb-2 tracking-widest uppercase">
        {t('quests.upcomingFeature' as any) || 'Upcoming Feature'}
      </div>
    </div>
  );
};
