import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ToggleRow, SelectRow } from './SettingsControls';
import { UIAppearanceSettings } from './UIAppearanceSettings';
import { X } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const { t } = useTranslation();
  const store = useSettingsStore(useShallow(state => ({
    notificationSettings: state.notificationSettings,
    updateNotificationSettings: state.updateNotificationSettings,
    notifications: state.notifications,
    targetUISettings: state.targetUISettings,
    updateTargetUISettings: state.updateTargetUISettings
  })));

  const [muteInput, setMuteInput] = React.useState('');

  const handleAddMute = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && muteInput.trim()) {
      const sanitized = muteInput.trim().toLowerCase();
      const currentDisabled = store.notificationSettings.disabledItems || {};
      store.updateNotificationSettings({
        disabledItems: { ...currentDisabled, [sanitized]: true }
      });
      setMuteInput('');
    }
  };

  const handleRemoveMute = (item: string) => {
    const currentDisabled = { ...(store.notificationSettings.disabledItems || {}) };
    delete currentDisabled[item];
    store.updateNotificationSettings({
      disabledItems: currentDisabled
    });
  };

  return (
    <>
      <ToggleRow label={t('settings.enableToasts')} value={store.notificationSettings.enabled} onChange={(v) => store.updateNotificationSettings({ enabled: v })} />
          
          <div className="mt-2 mb-2">
            <ToggleRow 
              label={t('settings.showPreviewDummy')}
              value={!!store.notifications.find(n => n.id === 'placeholder')}
              onChange={(v) => {
                if (v) {
                  if (!store.notifications.find(n => n.id === 'placeholder')) {
                    useSettingsStore.setState((s) => ({
                      notifications: [...s.notifications, { id: 'placeholder', title: 'Preview', message: 'Drag me to set position', type: 'info', timestamp: Date.now() }]
                    }));
                  }
                } else {
                  useSettingsStore.setState((s) => ({
                    notifications: s.notifications.filter(n => n.id !== 'placeholder')
                  }));
                }
              }}
            />
          </div>

          <div className={`space-y-1.5 mt-2 pt-2 border-t border-[var(--border-subtle)] ${!store.notificationSettings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>

            <div className="text-[9px] font-bold text-[var(--text-muted)] mb-1 pl-1">{t('settings.uiDesign')}</div>
            <SelectRow 
              label={t('settings.toastShape')} 
              value={store.notificationSettings.toastShape} 
              options={[
                {label: 'Rectangle (Default)', value: 'rectangle'},
                {label: 'Square', value: 'square'},
                {label: 'Smooth Curves', value: 'smooth'},
                {label: 'Pill', value: 'pill'}
              ]} 
              onChange={(v) => store.updateNotificationSettings({ toastShape: v as any })} 
            />
            <ToggleRow label={t('settings.enableNeonGlow')} value={store.notificationSettings.neonGlow} onChange={(v) => store.updateNotificationSettings({ neonGlow: v })} />
            <UIAppearanceSettings settings={store.notificationSettings} onUpdate={store.updateNotificationSettings} showDuration={true} widthRange={[150, 400]} heightRange={[30, 120]} />

            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t('settings.positionAnimation')}</div>
            <SelectRow 
              label={t('settings.position')} 
              value={store.notificationSettings.position} 
              options={[
                ...['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(p => ({ label: p.replace('-', ' '), value: p })),
                { label: 'Custom Dragged', value: 'custom' }
              ]} 
              onChange={(v) => store.updateNotificationSettings({ position: v as any })} 
            />

            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t('settings.eventTriggers')}</div>
            <ToggleRow label={t('settings.zoneChanges')} value={store.notificationSettings.zoneChange} onChange={(v) => store.updateNotificationSettings({ zoneChange: v })} />
            <ToggleRow label={t('settings.toolWarnings')} value={store.notificationSettings.toolWarning} onChange={(v) => store.updateNotificationSettings({ toolWarning: v })} />
            
            <ToggleRow label={t('settings.notifyItems')} value={store.notificationSettings.notifyItems} onChange={(v) => store.updateNotificationSettings({ notifyItems: v })} />
            <ToggleRow label={t('settings.notifyResources')} value={store.notificationSettings.notifyResources} onChange={(v) => store.updateNotificationSettings({ notifyResources: v })} />
            <ToggleRow label={t('settings.notifyLoot')} value={store.notificationSettings.notifyLoot} onChange={(v) => store.updateNotificationSettings({ notifyLoot: v })} />
            
            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t('settings.rareItemToggles')}</div>
            <ToggleRow label={t('settings.notifyRareMobDrops')} value={store.notificationSettings.notifyRareMobDrops ?? true} onChange={(v) => store.updateNotificationSettings({ notifyRareMobDrops: v })} />
            <ToggleRow label={t('settings.notifyRareOres')} value={store.notificationSettings.notifyRareOres ?? true} onChange={(v) => store.updateNotificationSettings({ notifyRareOres: v })} />
            <ToggleRow label={t('settings.notifyRarePlants')} value={store.notificationSettings.notifyRarePlants ?? true} onChange={(v) => store.updateNotificationSettings({ notifyRarePlants: v })} />
            
            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t('settings.mutedSpawnsItems')}</div>
            <div className="px-1 mb-2">
              <input
                type="text"
                value={muteInput}
                onChange={(e) => setMuteInput(e.target.value)}
                onKeyDown={handleAddMute}
                placeholder="Type name (e.g. Slime) and press Enter..."
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-lg px-2.5 py-1.5 text-[10px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.keys(store.notificationSettings.disabledItems || {}).map((item) => (
                  <div key={item} className="flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full text-[9px] text-[var(--text-secondary)] capitalize group">
                    <span>{item}</span>
                    <button onClick={() => handleRemoveMute(item)} className="text-[var(--text-muted)] hover:text-red-400 opacity-50 group-hover:opacity-100 transition-opacity">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </>
  );
};
