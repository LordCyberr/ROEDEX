import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSettingsStore } from '../../../store/settingsStore';
import { ToggleRow, SliderRow, SelectRow } from './SettingsControls';
import { UIAppearanceSettings } from './UIAppearanceSettings';
import { Settings, Eye, AlertCircle } from 'lucide-react';

export const WeaponSettings: React.FC = () => {
  const { t } = useTranslation();
  const store = useSettingsStore();

  return (
    <div className="flex flex-col gap-3.5">
      {/* Group 1: General Activation */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 pl-1">
          <Settings size={10} />
          <span>General</span>
        </div>
        <ToggleRow label={t('settings.enableWeaponOverlay')} value={store.weaponUISettings.show} onChange={(v) => store.updateWeaponUISettings({ show: v })} />
        <ToggleRow label={t('settings.lockPosition')} value={store.weaponUISettings.locked} disabled={!store.weaponUISettings.show} onChange={(v) => store.updateWeaponUISettings({ locked: v })} />
      </div>

      {/* Group 2: Display & Appearance */}
      <div className={`flex flex-col gap-1 mt-1 ${!store.weaponUISettings.show ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 pl-1">
          <Eye size={10} />
          <span>Style & Scale</span>
        </div>
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
            {label: 'Text (Hits Remaining)', value: 'text_durability'},
            {label: 'Bar + Percentage', value: 'bar_percent'},
            {label: 'Bar + Hits Remaining', value: 'bar_durability'}
          ]} 
          onChange={(v) => store.updateWeaponUISettings({ style: v as any })} 
        />
        <ToggleRow label={t('settings.enableAnimations')} value={store.weaponUISettings.enableAnimations} onChange={(v) => store.updateWeaponUISettings({ enableAnimations: v })} />
        <UIAppearanceSettings settings={store.weaponUISettings} onUpdate={store.updateWeaponUISettings} widthRange={[20, 300]} heightRange={[2, 60]} />
        <SliderRow label={t('settings.borderRadius')} value={store.weaponUISettings.borderRadius} min={0} max={24} step={2} display={`${store.weaponUISettings.borderRadius}px`} onChange={(v) => store.updateWeaponUISettings({ borderRadius: v })} />
        <SliderRow label={t('settings.glassStrength')} value={store.weaponUISettings.glassStrength} min={0} max={30} step={2} display={`${store.weaponUISettings.glassStrength}px`} onChange={(v) => store.updateWeaponUISettings({ glassStrength: v })} />
      </div>

      {/* Group 3: Alerts & Anchor */}
      <div className={`flex flex-col gap-1 mt-1 ${!store.weaponUISettings.show ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 pl-1">
          <AlertCircle size={10} />
          <span>Alerts & Anchor</span>
        </div>
        <SliderRow label={t('settings.borderWidth')} value={store.weaponUISettings.borderWidth || 0} min={0} max={10} step={1} display={`${store.weaponUISettings.borderWidth || 0}px`} onChange={(v) => store.updateWeaponUISettings({ borderWidth: v })} />
        <ToggleRow label={t('settings.dynamicBorderColor')} value={store.weaponUISettings.dynamicBorderColor ?? true} onChange={(v) => store.updateWeaponUISettings({ dynamicBorderColor: v })} />
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
    </div>
  );
};
