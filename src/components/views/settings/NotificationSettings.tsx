import React from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { ToggleRow, SliderRow, SelectRow } from './SettingsControls';

export const NotificationSettings: React.FC = () => {
  const store = useTrackerStore(useShallow(state => ({
    notificationSettings: state.notificationSettings,
    updateNotificationSettings: state.updateNotificationSettings
  })));

  return (
    <>
      <ToggleRow label="Enable Notifications" value={store.notificationSettings.enabled} onChange={(v) => store.updateNotificationSettings({ enabled: v })} />
          
          <div className="mt-2 mb-2">
            <ToggleRow 
              label="Show Preview Dummy"
              value={!!useTrackerStore.getState().notifications.find(n => n.id === 'placeholder')}
              onChange={(v) => {
                if (v) {
                  if (!useTrackerStore.getState().notifications.find(n => n.id === 'placeholder')) {
                    useTrackerStore.setState((s) => ({
                      notifications: [...s.notifications, { id: 'placeholder', title: 'Preview', message: 'Drag me to set position', type: 'info', timestamp: Date.now() }]
                    }));
                  }
                } else {
                  useTrackerStore.setState((s) => ({
                    notifications: s.notifications.filter(n => n.id !== 'placeholder')
                  }));
                }
              }}
            />
          </div>

          <div className={`space-y-1.5 mt-2 pt-2 border-t border-[var(--border-subtle)] ${!store.notificationSettings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>

            <div className="text-[9px] font-bold text-[var(--text-muted)] mb-1 pl-1">UI DESIGN</div>
            <SelectRow 
              label="Toast Shape" 
              value={store.notificationSettings.toastShape} 
              options={[
                {label: 'Rectangle (Default)', value: 'rectangle'},
                {label: 'Square', value: 'square'},
                {label: 'Smooth Curves', value: 'smooth'},
                {label: 'Pill', value: 'pill'}
              ]} 
              onChange={(v) => store.updateNotificationSettings({ toastShape: v as any })} 
            />
            <ToggleRow label="Neon Glowing Border" value={store.notificationSettings.neonGlow} onChange={(v) => store.updateNotificationSettings({ neonGlow: v })} />
            <SliderRow label="Width" value={store.notificationSettings.width} min={150} max={400} step={10} display={`${store.notificationSettings.width}px`} onChange={(v) => store.updateNotificationSettings({ width: v })} />
            <SliderRow label="Min Height" value={store.notificationSettings.height} min={30} max={120} step={5} display={`${store.notificationSettings.height}px`} onChange={(v) => store.updateNotificationSettings({ height: v })} />
            <SliderRow label="Scale" value={store.notificationSettings.scale} min={0.5} max={1.5} step={0.1} display={`${(store.notificationSettings.scale * 100).toFixed(0)}%`} onChange={(v) => store.updateNotificationSettings({ scale: v })} />
            <SliderRow label="Opacity" value={store.notificationSettings.opacity} min={0.2} max={1} step={0.05} display={`${(store.notificationSettings.opacity * 100).toFixed(0)}%`} onChange={(v) => store.updateNotificationSettings({ opacity: v })} />

            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">POSITION & ANIMATION</div>
            <SelectRow 
              label="Screen Position" 
              value={store.notificationSettings.position} 
              options={[
                ...['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(p => ({ label: p.replace('-', ' '), value: p })),
                { label: 'Custom Dragged', value: 'custom' }
              ]} 
              onChange={(v) => store.updateNotificationSettings({ position: v as any })} 
            />

            <SliderRow label="Display Duration" value={store.notificationSettings.duration} min={1000} max={10000} step={500} display={`${(store.notificationSettings.duration / 1000).toFixed(1)}s`} onChange={(v) => store.updateNotificationSettings({ duration: v })} />
            
            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">EVENT TRIGGERS</div>
            <ToggleRow label="Zone Changes" value={store.notificationSettings.zoneChange} onChange={(v) => store.updateNotificationSettings({ zoneChange: v })} />
            <ToggleRow label="Tool Durability Warnings" value={store.notificationSettings.toolWarning} onChange={(v) => store.updateNotificationSettings({ toolWarning: v })} />
            <ToggleRow label="Loot Drops" value={store.notificationSettings.lootEvents} onChange={(v) => store.updateNotificationSettings({ lootEvents: v })} />
          </div>
    </>
  );
};
