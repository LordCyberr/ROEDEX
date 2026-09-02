import React, { useMemo } from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ToggleRow, SliderRow } from './SettingsControls';
import { GAME_DATABASE } from '../../../data/gameDatabase';
import { Search, Layers } from 'lucide-react';

export const NotificationFiltersSettings: React.FC = () => {
  const store = useSettingsStore(useShallow(state => ({
    notificationSettings: state.notificationSettings,
    updateNotificationSettings: state.updateNotificationSettings,
  })));

  const [searchQuery, setSearchQuery] = React.useState('');
  
  const currentDisabled = store.notificationSettings.disabledItems || {};
  const currentDisabledTimers = store.notificationSettings.disabledTimers || {};

  const handleToggleMute = (itemId: string, isCurrentlyMuted: boolean, type: 'loot' | 'timer' = 'loot') => {
    if (type === 'loot') {
      const newDisabled = { ...currentDisabled };
      if (isCurrentlyMuted) {
        delete newDisabled[itemId];
      } else {
        newDisabled[itemId] = true;
      }
      store.updateNotificationSettings({ disabledItems: newDisabled });
    } else {
      const newDisabledTimers = { ...currentDisabledTimers };
      if (isCurrentlyMuted) {
        delete newDisabledTimers[itemId];
      } else {
        newDisabledTimers[itemId] = true;
      }
      store.updateNotificationSettings({ disabledTimers: newDisabledTimers });
    }
  };

  const entities = useMemo(() => {
    const list: Array<{id: string, name: string, type: string, rarity: number}> = [];
    GAME_DATABASE.forEach(data => {
      const rarityNum = data.rarity === 'mystical' ? 4 : (data.rarity === 'rare' ? 3 : (data.rarity === 'uncommon' ? 2 : 1));
      if (data.category === 'monster' || data.category === 'boss') {
        list.push({ id: data.rawName, name: data.sanitizedName, type: 'mob', rarity: rarityNum });
      } else if (data.category === 'ore' || data.category === 'tree' || data.category === 'plant') {
        list.push({ id: data.rawName, name: data.sanitizedName, type: 'resource', rarity: rarityNum });
      }
    });
    // Sort by name
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredEntities = useMemo(() => {
    if (!searchQuery) return entities;
    const lowerQuery = searchQuery.toLowerCase();
    return entities.filter(e => e.name.toLowerCase().includes(lowerQuery) || e.type.includes(lowerQuery));
  }, [entities, searchQuery]);

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex flex-col gap-1 mb-2 shrink-0">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1 pl-1">
          <Layers size={10} />
          <span>Notification Limits</span>
        </div>
        <SliderRow 
          label="Max Recent Notifications" 
          value={store.notificationSettings.maxNotifications || 5} 
          min={1} max={25} step={1} 
          display={(v) => `${v}`} 
          onChange={(v) => store.updateNotificationSettings({ maxNotifications: v })} 
        />
      </div>

      <div className="text-[10px] text-[var(--text-muted)] mb-2">
        Enable or disable overlay notifications for specific items, mobs, or resources. By default, all are enabled if the master switches are on.
      </div>

      <div className="relative mb-2 shrink-0">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input 
          type="text"
          placeholder="Search items, mobs, resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg pl-6 pr-2 py-1.5 text-[11px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar border border-[var(--border-subtle)] rounded-lg p-2 space-y-1 bg-black/20">
        {filteredEntities.map(entity => {
          const isMuted = !!currentDisabled[entity.name.toLowerCase()];
          const isTimerMuted = !!currentDisabledTimers[entity.name.toLowerCase()];
          return (
            <div key={entity.id} className="flex items-center justify-between p-1.5 rounded hover:bg-[var(--bg-panel)]/50 transition-colors border border-transparent hover:border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${entity.type === 'mob' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <span className="text-[11px] font-bold" style={{ color: entity.rarity > 2 ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                  {entity.name}
                </span>
                <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">{entity.type}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-[var(--text-muted)] mb-0.5">Loot</span>
                  <ToggleRow label="" value={!isMuted} onChange={() => handleToggleMute(entity.name.toLowerCase(), isMuted, 'loot')} />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-[var(--text-muted)] mb-0.5">Timer</span>
                  <ToggleRow label="" value={!isTimerMuted} onChange={() => handleToggleMute(entity.name.toLowerCase(), isTimerMuted, 'timer')} />
                </div>
              </div>
            </div>
          );
        })}
        {filteredEntities.length === 0 && (
          <div className="text-center text-[10px] text-[var(--text-muted)] py-4">No matching entities found.</div>
        )}
      </div>
    </div>
  );
};
