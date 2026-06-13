import React, { useState } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { Shield, ShieldAlert, Palette, Bell, Sword, ChevronDown, ChevronRight, Database, Bot } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from '../../hooks/useTranslation';

import { GeneralSettings } from './settings/GeneralSettings';
import { TrackingSettings } from './settings/TrackingSettings';
import { WeaponSettings } from './settings/WeaponSettings';
import { ArmorSettings } from './settings/ArmorSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { BobSettings } from './settings/BobSettings';
import { AdvancedSettings } from './settings/AdvancedSettings';
import { AboutSettings } from './settings/AboutSettings';
import { Tooltip } from '../ui/Tooltip';

import { AnimatePresence, motion } from 'motion/react';

// ── Accordion Section ──────────────────────────────────────────
const AccordionSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  description?: string;
  children: React.ReactNode;
}> = ({ title, icon, isOpen, onToggle, description, children }) => {
  return (
    <div className={`mb-2 transition-all duration-300 ${isOpen ? 'bg-[var(--bg-base)] rounded-2xl p-1.5 border border-black/40 shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)]' : ''}`}>
      <Tooltip content={description}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 w-full px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 select-none ${
          isOpen 
            ? 'bg-[var(--accent-primary)] text-white rounded-xl shadow-[0_4px_15px_rgba(249,115,22,0.3)]' 
            : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] rounded-full border border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-card)]'
        }`}
      >
        {icon}
        <span className="flex-1 text-left">{title}</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      </Tooltip>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-1.5 pt-3 pb-1.5 space-y-1.5 max-h-[350px] overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SettingsView: React.FC = () => {
  const { t } = useTranslation();
  const store = useTrackerStore(useShallow(state => {
    const { 
      packetCounts, enemies, resources, loot, timers, 
      playerPosition, throttledPlayerPosition, slotDurabilities,
      weapon, armor, sessionLoot,
      ...safeState 
    } = state;
    return safeState;
  }));
  const [activeTab, setActiveTab] = useState('');

  const sections = [
    { id: 'general', title: t('settings.general'), description: t('settings.descGeneral'), icon: <Palette size={14} />, content: <GeneralSettings /> },
    { id: 'tracking', title: t('settings.trackingData'), description: t('settings.descTracking'), icon: <Database size={14} />, content: <TrackingSettings /> },
    { id: 'weapon', title: t('settings.weaponOverlay'), description: t('settings.descWeapon'), icon: <Sword size={14} />, content: <WeaponSettings /> },
    { id: 'armor', title: t('settings.armorOverlay'), description: t('settings.descArmor'), icon: <Shield size={14} />, content: <ArmorSettings /> },
    { id: 'notifications', title: t('settings.uiNotifications'), description: t('settings.descNotifications'), icon: <Bell size={14} />, content: <NotificationSettings /> },
    { id: 'companion', title: t('settings.aiCompanion'), description: t('settings.descCompanion'), icon: <Bot size={14} />, content: <BobSettings /> },
    { id: 'advanced', title: t('settings.advanced'), description: t('settings.descAdvanced'), icon: <ShieldAlert size={14} className={store.developerMode ? 'text-amber-400' : ''} />, content: <AdvancedSettings /> },
    { id: 'about', title: t('settings.aboutMe'), description: t('settings.descAbout'), icon: <span className="text-[14px]">✧</span>, content: <AboutSettings /> }
  ];

  if (store.layoutMode === 'horizontal') {
    const activeSection = sections.find(s => s.id === activeTab) || sections[0];
    return (
      <div className="flex w-[460px] h-[420px] max-w-[90vw] max-h-[75vh] text-[var(--text-primary)]">
         {/* Sidebar Tabs */}
         <div className="w-[140px] shrink-0 flex flex-col gap-0.5 pr-2 pl-1.5 border-r border-[var(--border-subtle)] mr-2 overflow-y-auto custom-scrollbar pt-1 pb-4">
            {sections.map(s => (
             <Tooltip key={s.id} content={s.description}>
             <button
               onClick={() => setActiveTab(s.id)}
               className={`flex items-center gap-2 w-full px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full transition-all duration-200 select-none ${
                 activeTab === s.id 
                   ? 'bg-[var(--accent-primary)] text-white shadow-md shadow-[var(--accent-primary)]/20' 
                   : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
               }`}
             >
               {s.icon}
               <span className="flex-1 text-left">{s.title}</span>
             </button>
             </Tooltip>
           ))}
         </div>
         {/* Tab Content */}
         <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4 pt-1 min-w-0">
            <Tooltip content={activeSection.description}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 pl-1 border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2 w-max max-w-full">
                {activeSection.icon}
                {activeSection.title}
              </h3>
            </Tooltip>
            <div key={activeSection.id} className="animate-in fade-in slide-in-from-right-2 duration-200 w-full max-w-full">
              {activeSection.content}
            </div>
         </div>
      </div>
    );
  }

  // Vertical Layout Mode
  return (
    <div className="p-2 space-y-1 pb-2">
      {sections.map((section) => (
        <AccordionSection 
          key={section.id} 
          title={section.title} 
          icon={section.icon} 
          description={section.description}
          isOpen={activeTab === section.id}
          onToggle={() => setActiveTab(activeTab === section.id ? '' : section.id)}
        >
          {section.content}
        </AccordionSection>
      ))}
    </div>
  );
};
