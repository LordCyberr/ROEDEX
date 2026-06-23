import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
// import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { ToggleRow, SliderRow, SelectRow } from './SettingsControls';

export const WeaponSettings: React.FC = () => {
  const { t } = useTranslation();
  const store = useSettingsStore();

  return (
    <>
      <ToggleRow label={t('settings.enableWeaponOverlay')} value={store.weaponUISettings.show} onChange={(v) => store.updateWeaponUISettings({ show: v })} />
          <ToggleRow label={t('settings.lockPosition')} value={store.weaponUISettings.locked} disabled={!store.weaponUISettings.show} onChange={(v) => store.updateWeaponUISettings({ locked: v })} />
          
          <div className={`space-y-1.5 mt-2 pt-2 border-t border-[var(--border-subtle)] ${!store.weaponUISettings.show ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1">{t('settings.displayAppearance')}</div>
            <SelectRow 
              label={t('settings.layout')} 
              value={store.weaponUISettings.layout || 'horizontal'} 
              options={[
                {label: 'Horizontal', value: 'horizontal'},
                {label: 'Vertical', value: 'vertical'}
              ]} 
              onChange={(v) => store.updateWeaponUISettings({ layout: v as 'vertical' | 'horizontal' })} 
            />
            <SelectRow 
              label={t('settings.style')} 
              value={store.weaponUISettings.style} 
              options={[
                {label: 'Bar Only', value: 'bar'},
                {label: 'Text (Percentage)', value: 'text_percent'},
                {label: 'Text (Durability)', value: 'text_durability'},
                {label: 'Bar + Percentage', value: 'bar_percent'},
                {label: 'Bar + Durability', value: 'bar_durability'}
              ]} 
              onChange={(v) => store.updateWeaponUISettings({ style: v as any })} 
            />
            <ToggleRow label={t('settings.enableAnimations')} value={store.weaponUISettings.enableAnimations} onChange={(v) => store.updateWeaponUISettings({ enableAnimations: v })} />
            <SliderRow label={t('settings.barWidth')} value={store.weaponUISettings.width} min={20} max={300} step={10} display={`${store.weaponUISettings.width}px`} onChange={(v) => store.updateWeaponUISettings({ width: v })} />
            <SliderRow label={t('settings.barHeight')} value={store.weaponUISettings.height} min={2} max={60} step={2} display={`${store.weaponUISettings.height}px`} onChange={(v) => store.updateWeaponUISettings({ height: v })} />
            <SliderRow label={t('settings.scale')} value={store.weaponUISettings.scale} min={0.5} max={1.5} step={0.1} display={`${(store.weaponUISettings.scale * 100).toFixed(0)}%`} onChange={(v) => store.updateWeaponUISettings({ scale: v })} />
            <SliderRow label={t('settings.opacity')} value={store.weaponUISettings.opacity} min={0.1} max={1} step={0.05} display={`${(store.weaponUISettings.opacity * 100).toFixed(0)}%`} onChange={(v) => store.updateWeaponUISettings({ opacity: v })} />
            <SliderRow label={t('settings.borderRadius')} value={store.weaponUISettings.borderRadius} min={0} max={24} step={2} display={`${store.weaponUISettings.borderRadius}px`} onChange={(v) => store.updateWeaponUISettings({ borderRadius: v })} />
            <SliderRow label={t('settings.glassStrength')} value={store.weaponUISettings.glassStrength} min={0} max={30} step={2} display={`${store.weaponUISettings.glassStrength}px`} onChange={(v) => store.updateWeaponUISettings({ glassStrength: v })} />

            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t('settings.borderSettings')}</div>
            <SliderRow label={t('settings.borderWidth')} value={store.weaponUISettings.borderWidth || 0} min={0} max={10} step={1} display={`${store.weaponUISettings.borderWidth || 0}px`} onChange={(v) => store.updateWeaponUISettings({ borderWidth: v })} />
            <ToggleRow label={t('settings.dynamicBorderColor')} value={store.weaponUISettings.dynamicBorderColor ?? true} onChange={(v) => store.updateWeaponUISettings({ dynamicBorderColor: v })} />

            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t('settings.alertsAndAnchor')}</div>
            <ToggleRow label={t('settings.enableDurabilityAlerts')} value={store.weaponUISettings.enableAlerts} onChange={(v) => store.updateWeaponUISettings({ enableAlerts: v })} />
            <SelectRow 
              label={t('settings.alertThreshold')} 
              value={store.weaponUISettings.alertThreshold.toString()} 
              options={[
                {label: '10%', value: '10'},
                {label: '15%', value: '15'},
                {label: '20%', value: '20'},
                {label: '30%', value: '30'},
                {label: '40%', value: '40'}
              ]} 
              onChange={(v) => store.updateWeaponUISettings({ alertThreshold: parseInt(v) })} 
            />
            <SelectRow 
              label={t('settings.position')} 
              value={store.weaponUISettings.position} 
              options={[
                {label: 'Top Left', value: 'top-left'},
                {label: 'Top Right', value: 'top-right'},
                {label: 'Bottom Left', value: 'bottom-left'},
                {label: 'Bottom Right', value: 'bottom-right'},
                {label: 'Custom Dragged', value: 'custom'}
              ]} 
              onChange={(v) => store.updateWeaponUISettings({ position: v as any })} 
            />
          </div>
    </>
  );
};
