import React from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { ToggleRow, SliderRow, SelectRow } from './SettingsControls';


export const ArmorSettings: React.FC = () => {
  const store = useTrackerStore();

  return (
    <>
      <ToggleRow label="Enable Armor Overlay" value={store.armorUISettings.show} onChange={(v) => store.updateArmorUISettings({ show: v })} />
          <ToggleRow label="Lock Position" value={store.armorUISettings.locked} disabled={!store.armorUISettings.show} onChange={(v) => store.updateArmorUISettings({ locked: v })} />
          
          <div className={`space-y-1.5 mt-2 pt-2 border-t border-[var(--border-subtle)] ${!store.armorUISettings.show ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1">DISPLAY & APPEARANCE</div>
            <SelectRow 
              label="Layout" 
              value={store.armorUISettings.layout} 
              options={[
                {label: 'Vertical Stack', value: 'vertical'},
                {label: 'Horizontal Row', value: 'horizontal'}
              ]} 
              onChange={(v) => store.updateArmorUISettings({ layout: v as 'vertical' | 'horizontal' })} 
            />
            <SelectRow 
              label="Style" 
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
            <ToggleRow label="Enable Animations" value={store.armorUISettings.enableAnimations} onChange={(v) => store.updateArmorUISettings({ enableAnimations: v })} />
            <SliderRow label="Width" value={store.armorUISettings.width} min={80} max={300} step={10} display={`${store.armorUISettings.width}px`} onChange={(v) => store.updateArmorUISettings({ width: v })} />
            <SliderRow label="Height (Bar)" value={store.armorUISettings.height} min={2} max={20} step={2} display={`${store.armorUISettings.height}px`} onChange={(v) => store.updateArmorUISettings({ height: v })} />
            <SliderRow label="Scale" value={store.armorUISettings.scale} min={0.5} max={1.5} step={0.1} display={`${(store.armorUISettings.scale * 100).toFixed(0)}%`} onChange={(v) => store.updateArmorUISettings({ scale: v })} />
            <SliderRow label="Opacity" value={store.armorUISettings.opacity} min={0.1} max={1} step={0.05} display={`${(store.armorUISettings.opacity * 100).toFixed(0)}%`} onChange={(v) => store.updateArmorUISettings({ opacity: v })} />
            <SliderRow label="Background Radius" value={store.armorUISettings.borderRadius} min={0} max={24} step={2} display={`${store.armorUISettings.borderRadius}px`} onChange={(v) => store.updateArmorUISettings({ borderRadius: v })} />
            <SliderRow label="Background Blur" value={store.armorUISettings.glassStrength} min={0} max={30} step={2} display={`${store.armorUISettings.glassStrength}px`} onChange={(v) => store.updateArmorUISettings({ glassStrength: v })} />

            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">BORDER SETTINGS</div>
            <SliderRow label="Border Thickness" value={store.armorUISettings.borderWidth || 0} min={0} max={10} step={1} display={`${store.armorUISettings.borderWidth || 0}px`} onChange={(v) => store.updateArmorUISettings({ borderWidth: v })} />
            <ToggleRow label="Dynamic Color (Match Health)" value={store.armorUISettings.dynamicBorderColor ?? true} onChange={(v) => store.updateArmorUISettings({ dynamicBorderColor: v })} />

            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">ALERTS & ANCHOR</div>
            <ToggleRow label="Enable Alerts" value={store.armorUISettings.enableAlerts} onChange={(v) => store.updateArmorUISettings({ enableAlerts: v })} />
            <SelectRow 
              label="Alert Threshold" 
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
              label="Anchor Position" 
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
    </>
  );
};
