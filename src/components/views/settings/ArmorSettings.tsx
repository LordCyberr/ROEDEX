import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSettingsStore } from '../../../store/settingsStore';
import { ToggleRow, SliderRow, SelectRow } from './SettingsControls';
import { UIAppearanceSettings } from './UIAppearanceSettings';
import { Settings, Eye, AlertCircle } from 'lucide-react';

export const ArmorSettings: React.FC = () => {
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
        <ToggleRow label={t('settings.enableArmorOverlay')} value={store.armorUISettings.show} onChange={(v) => store.updateArmorUISettings({ show: v })} />
        <ToggleRow label={t('settings.lockPosition')} value={store.armorUISettings.locked} disabled={!store.armorUISettings.show} onChange={(v) => store.updateArmorUISettings({ locked: v })} />
      </div>

      {/* Group 2: Display & Appearance */}
      <div className={`flex flex-col gap-1 mt-1 ${!store.armorUISettings.show ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 pl-1">
          <Eye size={10} />
          <span>Style & Scale</span>
        </div>
        <SelectRow 
          label={t('settings.layout')} 
          value={store.armorUISettings.layout} 
          options={[
            {label: 'Vertical Stack', value: 'vertical'},
            {label: 'Horizontal Row', value: 'horizontal'}
          ]} 
          onChange={(v) => store.updateArmorUISettings({ layout: v as 'vertical' | 'horizontal' })} 
        />
        <SelectRow 
          label={t('settings.style')} 
          value={store.armorUISettings.style} 
          options={[
            {label: 'Bar Only', value: 'bar'},
            {label: 'Text (Percentage)', value: 'text_percent'},
            {label: 'Text (Durability)', value: 'text_durability'},
            {label: 'Bar + Percentage', value: 'bar_percent'},
            {label: 'Bar + Durability', value: 'bar_durability'}
          ]} 
          onChange={(v) => store.updateArmorUISettings({ style: v as any })} 
        />
        <ToggleRow label={t('settings.enableAnimations')} value={store.armorUISettings.enableAnimations} onChange={(v) => store.updateArmorUISettings({ enableAnimations: v })} />
        <UIAppearanceSettings settings={store.armorUISettings} onUpdate={store.updateArmorUISettings} widthRange={[20, 300]} heightRange={[2, 60]} />
        <SliderRow label={t('settings.borderRadius')} value={store.armorUISettings.borderRadius} min={0} max={24} step={2} display={`${store.armorUISettings.borderRadius}px`} onChange={(v) => store.updateArmorUISettings({ borderRadius: v })} />
        <SliderRow label={t('settings.glassStrength')} value={store.armorUISettings.glassStrength} min={0} max={30} step={2} display={`${store.armorUISettings.glassStrength}px`} onChange={(v) => store.updateArmorUISettings({ glassStrength: v })} />
      </div>

      {/* Group 3: Alerts & Anchor */}
      <div className={`flex flex-col gap-1 mt-1 ${!store.armorUISettings.show ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 pl-1">
          <AlertCircle size={10} />
          <span>Alerts & Anchor</span>
        </div>
        <SliderRow label={t('settings.borderWidth')} value={store.armorUISettings.borderWidth || 0} min={0} max={10} step={1} display={`${store.armorUISettings.borderWidth || 0}px`} onChange={(v) => store.updateArmorUISettings({ borderWidth: v })} />
        <ToggleRow label={t('settings.dynamicBorderColor')} value={store.armorUISettings.dynamicBorderColor ?? true} onChange={(v) => store.updateArmorUISettings({ dynamicBorderColor: v })} />
        <ToggleRow label={t('settings.enableDurabilityAlerts')} value={store.armorUISettings.enableAlerts} onChange={(v) => store.updateArmorUISettings({ enableAlerts: v })} />
        <SelectRow 
          label={t('settings.alertThreshold')} 
          value={store.armorUISettings.alertThreshold.toString()} 
          options={[
            {label: '10%', value: '10'},
            {label: '15%', value: '15'},
            {label: '20%', value: '20'},
            {label: '30%', value: '30'},
            {label: '40%', value: '40'}
          ]} 
          onChange={(v) => store.updateArmorUISettings({ alertThreshold: parseInt(v) })} 
        />
        <SelectRow 
          label={t('settings.position')} 
          value={store.armorUISettings.position} 
          options={[
            {label: 'Top Left', value: 'top-left'},
            {label: 'Top Right', value: 'top-right'},
            {label: 'Bottom Left', value: 'bottom-left'},
            {label: 'Bottom Right', value: 'bottom-right'},
            {label: 'Custom Dragged', value: 'custom'}
          ]} 
          onChange={(v) => store.updateArmorUISettings({ position: v as any })} 
        />
      </div>
    </div>
  );
};
