import React, { useState, useMemo } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { Shield, ShieldAlert, Palette, Bell, Sword, ChevronRight, Database, Bot, Map, ArrowLeft, CircleDot, Keyboard, Target, Info, Search } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from '../../hooks/useTranslation';
import { IsolatedInput } from '../ui/IsolatedInput';

import { GeneralSettings } from './settings/GeneralSettings';
import { TrackingSettings } from './settings/TrackingSettings';
import { WeaponSettings } from './settings/WeaponSettings';
import { ArmorSettings } from './settings/ArmorSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { NotificationFiltersSettings } from './settings/NotificationFiltersSettings';
import { CompanionSettings } from './settings/CompanionSettings';
import { AdvancedSettings } from './settings/AdvancedSettings';
import { AboutSettings } from './settings/AboutSettings';
import { MapSettings } from './settings/MapSettings';
import { OrbSettings } from './settings/OrbSettings';
import { ControlsSettings } from './settings/ControlsSettings';
import { TargetHealthBarSettings } from './settings/TargetHealthBarSettings';
import { PerformanceSettings } from './settings/PerformanceSettings';

export const SettingsViewComponent: React.FC = () => {
  const { t } = useTranslation();
  const store = useSettingsStore(useShallow((state: any) => ({
    developerMode: state.developerMode,
    layoutMode: state.layoutMode
  })));
  const [activeTab, setActiveTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => [
    {
      title: '🎮 Gameplay',
      id: 'gameplay',
      description: 'Tracking, timers, respawn alerts and map trails',
      items: [
        { id: 'tracking', title: t('settings.trackingData'), description: 'Respawn timers, mob tracking, resource alerts', icon: <Database size={14} /> },
        { id: 'map', title: t('settings.mapTitle'), description: 'Minimap engine, path trails, zone exploration', icon: <Map size={14} /> },
        { id: 'target_health', title: t('settings.targetHealthBar'), description: 'Live HP bar shown on enemies you target', icon: <Target size={14} /> },
      ]
    },
    {
      title: '🤖 Companion',
      id: 'companion',
      description: 'Your AI companion personality, dialogue and alerts',
      items: [
        { id: 'companion', title: t('settings.aiCompanion'), description: 'Choose your companion and configure their personality', icon: <Bot size={14} /> },
        { id: 'notifications', title: t('settings.alertSettings'), description: 'Toast timing, audio alerts and companion frequency', icon: <Bell size={14} /> },
        { id: 'notification_filters', title: t('settings.whatToAnnounce'), description: 'Enable or disable alerts per mob, item or resource', icon: <Bell size={14} /> },
      ]
    },
    {
      title: '🎨 Display',
      id: 'display',
      description: 'Themes, overlays and HUD widget visibility',
      items: [
        { id: 'general', title: t('settings.general'), description: 'Theme, language and interface appearance', icon: <Palette size={14} /> },
        { id: 'orb', title: t('settings.minimizedOrb'), description: 'The floating orb icon when ROEDEX is minimized', icon: <CircleDot size={14} /> },
        { id: 'weapon', title: t('settings.weaponOverlay'), description: 'Weapon durability and slot overlay', icon: <Sword size={14} /> },
        { id: 'armor', title: t('settings.armorOverlay'), description: 'Armor slot and condition overlay', icon: <Shield size={14} /> },
      ]
    },
    {
      title: '⚙️ Advanced',
      id: 'advanced',
      description: 'Performance, hotkeys, developer tools and version info',
      items: [
        { id: 'performance', title: t('settings.performance'), description: 'Rendering engine and frame rate optimizations', icon: <Database size={14} /> },
        { id: 'controls', title: t('settings.controlsHotkeys'), description: 'Keyboard shortcuts and overlay toggle keys', icon: <Keyboard size={14} /> },
        { id: 'advanced', title: t('settings.advanced'), description: 'Developer mode, debug tools and data reset', icon: <ShieldAlert size={14} className={store.developerMode ? 'text-amber-400' : ''} /> },
        { id: 'about', title: t('settings.aboutMe'), description: 'Version, credits and update notes', icon: <Info size={14} /> },
      ]
    }
  ], [t, store.developerMode]);

  const SECTION_COMPONENTS: Record<string, React.FC> = {
    general: GeneralSettings,
    performance: PerformanceSettings,
    orb: OrbSettings,
    controls: ControlsSettings,
    map: MapSettings,
    tracking: TrackingSettings,
    weapon: WeaponSettings,
    armor: ArmorSettings,
    target_health: TargetHealthBarSettings,
    notifications: NotificationSettings,
    notification_filters: NotificationFiltersSettings,
    companion: CompanionSettings,
    advanced: AdvancedSettings,
    about: AboutSettings
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const term = searchQuery.toLowerCase();
    return categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.title.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term)
      )
    })).filter(cat => cat.items.length > 0);
  }, [categories, searchQuery]);

  // Always use Drill-down Vertical Layout Mode
  if (activeTab) {
    const activeSection = categories.flatMap(c => c.items).find(s => s.id === activeTab);
    if (activeSection) {
      return (
        <div className="flex flex-col h-full w-full overflow-hidden p-2.5 text-[var(--text-primary)]">
          {/* Back Navigation Button */}
          <button 
            onClick={() => setActiveTab('')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors text-[9px] font-black uppercase tracking-wider mb-2 w-fit cursor-pointer select-none"
          >
            <ArrowLeft size={11} /> Back
          </button>
          
          {/* Detailed Header Card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-2.5 flex items-center gap-2.5 shadow-md shrink-0 mb-3">
            <div className="p-1.5 bg-[var(--bg-base)] rounded-lg border border-[var(--border-subtle)] shadow-inner">
              {activeSection.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[7.5px] font-black uppercase tracking-widest text-[var(--text-muted)] leading-none mb-0.5">Settings Category</span>
              <h2 className="font-black text-[11px] tracking-wider uppercase text-[var(--text-primary)] truncate leading-none">{activeSection.title}</h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-2">
            <div className="animate-in fade-in slide-in-from-right-2 duration-200">
              {SECTION_COMPONENTS[activeTab] && React.createElement(SECTION_COMPONENTS[activeTab])}
            </div>
          </div>
        </div>
      );
    }
  }



  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)]">
      <div className="p-2 shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/50">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <IsolatedInput
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-lg pl-7.5 pr-2 py-1.5 text-[10px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
          />
        </div>
      </div>
      <div className="p-2 flex flex-col gap-3 overflow-y-auto custom-scrollbar pb-4 flex-1 min-h-0">
        {filteredCategories.map((category) => (
          <div key={category.id} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-1 mb-0.5 mt-1">
            <h3 className="text-[10px] font-black tracking-widest uppercase text-[var(--accent-primary)] drop-shadow-sm">{category.title}</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-[var(--border-accent)] to-transparent" />
          </div>
          <div className="flex flex-col gap-1.5">
            {category.items.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className="flex items-center gap-2.5 w-full p-2.5 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 rounded-xl transition-all cursor-pointer group shadow-sm shrink-0"
              >
                <div className="p-1.5 bg-[var(--bg-base)] rounded-lg border border-[var(--border-subtle)] shrink-0 group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <div className="flex flex-col min-w-0 flex-1 text-left">
                  <h3 className="font-bold text-[10px] tracking-wide uppercase text-[var(--text-primary)] truncate mb-0.5">{section.title}</h3>
                  <p className="text-[8.5px] text-[var(--text-muted)] truncate leading-tight">{section.description}</p>
                </div>
                <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}
      {filteredCategories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)] italic text-[10px] select-none">
          No settings found matching "{searchQuery}"
        </div>
      )}
    </div>
    </div>
  );
};

export const SettingsView = React.memo(SettingsViewComponent);
