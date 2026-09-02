import React, { useState } from 'react';
import { ProfileTab } from '../loot/ProfileTab';
import { DailyDashboard } from './DailyDashboard';
import { AnalyticsCharts } from './AnalyticsCharts';
import { CombatLogs } from './CombatLogs';
import { useLayoutMode } from '../../../store/hooks/useSettingsSelector';
import { motion, AnimatePresence } from 'motion/react';
import { User, BarChart2, Calendar, Swords } from 'lucide-react';
import { Tooltip } from '../../ui/Tooltip';

type SubTab = 'classic' | 'dashboard' | 'charts' | 'combat';

export const ProfileView: React.FC = React.memo(() => {
  const layoutMode = useLayoutMode();
  const isHorizontal = layoutMode === 'horizontal';
  const [activeTab, setActiveTab] = useState<SubTab>('classic');
  
  return (
    <div className="w-full h-full bg-[var(--bg-base)] overflow-hidden flex flex-col">
      {/* Sub-tab Navigation */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-black/50 border-b border-white/10 shrink-0 select-none">
        <Tooltip content="Classic Profile" position="bottom">
          <button
            onClick={() => setActiveTab('classic')}
            className={`w-full flex items-center justify-center py-1.5 px-2 rounded-md transition-all duration-150 ${
              activeTab === 'classic' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)] font-bold' 
                : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
            }`}
          >
            <User size={14} /> 
          </button>
        </Tooltip>
        
        <Tooltip content="Daily Dashboard" position="bottom">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-center py-1.5 px-2 rounded-md transition-all duration-150 ${
              activeTab === 'dashboard' 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.25)] font-bold' 
                : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Calendar size={14} /> 
          </button>
        </Tooltip>

        <Tooltip content="Analytics Charts" position="bottom">
          <button
            onClick={() => setActiveTab('charts')}
            className={`w-full flex items-center justify-center py-1.5 px-2 rounded-md transition-all duration-150 ${
              activeTab === 'charts' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.25)] font-bold' 
                : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
            }`}
          >
            <BarChart2 size={14} /> 
          </button>
        </Tooltip>

        <Tooltip content="Combat Logs" position="bottom">
          <button
            onClick={() => setActiveTab('combat')}
            className={`w-full flex items-center justify-center py-1.5 px-2 rounded-md transition-all duration-150 ${
              activeTab === 'combat' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.25)] font-bold' 
                : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Swords size={14} /> 
          </button>
        </Tooltip>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          {activeTab === 'classic' && (
            <motion.div key="classic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2">
              <ProfileTab isHorizontal={isHorizontal} />
            </motion.div>
          )}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <DailyDashboard />
            </motion.div>
          )}
          {activeTab === 'charts' && (
            <motion.div key="charts" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <AnalyticsCharts />
            </motion.div>
          )}
          {activeTab === 'combat' && (
            <motion.div key="combat" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <CombatLogs />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
