import React, { useState } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { DebugPanel } from './DebugPanel';
import { Shield, ShieldAlert, Palette, Bell, Sword, ChevronDown, ChevronRight, Database, Bot } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from '../../hooks/useTranslation';

// ── Accordion Section ──────────────────────────────────────────
const AccordionSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-2.5">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 w-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-200 select-none ${
          open 
            ? 'bg-[var(--accent-primary)] text-white shadow-md shadow-[var(--accent-primary)]/20 scale-[0.98]' 
            : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-card)]'
        }`}
      >
        {icon}
        <span className="flex-1 text-left">{title}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div className="px-1 pt-2 pb-1 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
};

// ── Toggle Row ─────────────────────────────────────────────────
const ToggleRow: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({ label, value, onChange, disabled }) => (
  <div className={`flex items-center justify-between px-2 py-1.5 mb-1 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-md ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <span className="text-[11px] text-[var(--text-primary)] font-medium">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-7 h-4 bg-[var(--bg-card)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--accent-primary)] shadow-inner"></div>
    </label>
  </div>
);

// ── Slider Row ─────────────────────────────────────────────────
const SliderRow: React.FC<{ label: string; value: number; min: number; max: number; step: number; display: string; onChange: (v: number) => void; disabled?: boolean }> = ({ label, value, min, max, step, display, onChange, disabled }) => (
  <div className={`flex flex-col gap-1 px-2 py-1.5 mb-1 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-md ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex justify-between items-center">
      <span className="text-[11px] text-[var(--text-primary)] font-medium">{label}</span>
      <span className="text-[10px] font-mono text-[var(--accent-primary)] font-bold">{display}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step}
      value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-[var(--bg-card)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
    />
  </div>
);

// ── Select Row ─────────────────────────────────────────────────
const SelectRow: React.FC<{ label: string; value: string; options: { label: string, value: string }[]; onChange: (v: string) => void; disabled?: boolean }> = ({ label, value, options, onChange, disabled }) => (
  <div className={`flex items-center justify-between px-2 py-1.5 mb-1 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-md ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <span className="text-[11px] text-[var(--text-primary)] font-medium">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[var(--bg-card)] border border-[var(--border-accent)] rounded px-1.5 py-0.5 text-[10px] text-[var(--text-primary)] outline-none cursor-pointer focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

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
  const [activeTab, setActiveTab] = useState('general');

  const sections = [
    {
      id: 'general',
      title: t('settings.general'),
      icon: <Palette size={14} />,
      content: (
        <>
          <SelectRow 
            label={t('settings.language')} 
            value={store.language} 
            options={[
              {label: 'English', value: 'en'},
              {label: 'Español', value: 'es'},
              {label: 'Русский', value: 'ru'},
              {label: '한국어', value: 'ko'}
            ]} 
            onChange={(v) => store.setLanguage(v as any)} 
          />
          <SelectRow 
            label={t('settings.uiTheme')} 
            value={store.theme} 
            options={[
              {label: 'Default Dark', value: 'default'},
              {label: 'Tokyo Night', value: 'tokyo-night'},
              {label: 'Dracula', value: 'dracula'},
              {label: 'Nord', value: 'nord'},
              {label: 'Mocha (Catppuccin)', value: 'mocha'},
              {label: 'Solarized Dark', value: 'solarized'},
              {label: 'Frost UI (Soft Glass)', value: 'frost'},
              {label: 'Neo-Brutalism', value: 'neo-brutalism'},
              {label: 'Tech Spec', value: 'tech-spec'},
              {label: 'Obsidian Luxury', value: 'obsidian'},
              {label: 'Acid Fade', value: 'acid-fade'},
              {label: 'Assertive Minimalist', value: 'minimalist'},
              {label: 'Ocean Blue', value: 'ocean'},
              {label: 'Crimson Red', value: 'crimson'},
              {label: 'Neon Purple', value: 'neon'},
              {label: 'Royal Purple', value: 'royal'},
              {label: 'Forest Green', value: 'forest'},
              {label: 'Sunset Orange', value: 'sunset'},
              {label: 'Midnight Obsidian', value: 'midnight'},
              {label: 'Cyberpunk Neon', value: 'cyberpunk'},
              {label: 'Monochrome', value: 'monochrome'},
              {label: 'Amethyst Royal', value: 'amethyst'}
            ]} 
            onChange={(v) => store.setTheme(v)} 
          />
          <SelectRow 
            label={t('settings.displayDensity')} 
            value={store.displayDensity} 
            options={[{label: 'Compact Mode', value: 'compact'}, {label: 'Standard Mode', value: 'standard'}]} 
            onChange={(v) => store.setDisplayDensity(v as any)} 
          />
          <SelectRow 
            label={t('settings.verticalLayout')} 
            value={store.verticalGroupingMode} 
            options={[{label: 'Grouped by Zone', value: 'grouped'}, {label: 'Simple Titles', value: 'flat'}]} 
            onChange={(v) => store.setVerticalGroupingMode(v as any)} 
            disabled={store.layoutMode !== 'vertical'}
          />
          <SliderRow label={t('settings.activeOpacity')} value={store.activeOpacity} min={0.1} max={1} step={0.05} display={`${Math.round(store.activeOpacity * 100)}%`} onChange={store.setActiveOpacity} />
          <SliderRow label={t('settings.idleOpacity')} value={store.idleOpacity} min={0.1} max={1} step={0.05} display={`${Math.round(store.idleOpacity * 100)}%`} onChange={store.setIdleOpacity} />
          <SliderRow label={t('settings.minimizedOrbSize')} value={store.orbSize} min={30} max={100} step={2} display={`${store.orbSize}px`} onChange={store.setOrbSize} />
          <SliderRow label="Orb Border Thickness" value={store.orbBorderThickness} min={0} max={10} step={1} display={`${store.orbBorderThickness}px`} onChange={store.setOrbBorderThickness} />
          <SelectRow 
            label={t('settings.minimizedIcon')} 
            value={store.minimizedIcon} 
            options={[
              {label: 'Tracking Pulse', value: 'pulse'},
              {label: 'Lightning', value: 'lightning'},
              {label: 'Sword', value: 'sword'},
              {label: 'Pickaxe', value: 'pickaxe'},
              {label: 'Shield', value: 'shield'},
              {label: 'ROEDEX', value: 'roedex'},
              {label: 'RX', value: 'rx'}
            ]} 
            onChange={(v) => store.setMinimizedIcon(v as any)} 
          />
          
          <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">BEHAVIOR</div>
          <ToggleRow label="Auto-Minimize on Chest Open" value={store.autoMinimizeOnChest} onChange={(v) => store.setAutoMinimizeOnChest(v)} />
        </>
      )
    },
    {
      id: 'tracking',
      title: t('settings.trackingData'),
      icon: <Database size={14} />,
      content: (
        <>
          <SelectRow 
            label={t('settings.displayMode')} 
            value={store.displayMode} 
            options={[{label: 'Session View', value: 'session'}, {label: 'Current Zone', value: 'current_zone'}]} 
            onChange={(v) => store.setDisplayMode(v as any)} 
          />
          <p className="text-[9px] text-[var(--text-muted)] mt-1 mb-2 px-1">{t('settings.sessionViewDesc')}</p>
          
          <button 
            onClick={store.clearSessionCache}
            className="w-full text-center py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] rounded border border-red-500/20 transition-colors mb-1 shadow-sm"
          >
            {t('settings.clearSessionCache')}
          </button>
          <button 
            onClick={store.clearSession}
            className="w-full text-center py-1.5 bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] text-[#cfd2d5] text-[10px] rounded border border-[var(--border-subtle)] transition-colors shadow-sm"
          >
            {t('settings.resetLootSession')}
          </button>
        </>
      )
    },
    {
      id: 'weapon',
      title: t('settings.weaponOverlay'),
      icon: <Sword size={14} />,
      content: (
        <>
          <ToggleRow label="Enable Weapon Overlay" value={store.weaponUISettings.show} onChange={(v) => store.updateWeaponUISettings({ show: v })} />
          <ToggleRow label="Lock Position" value={store.weaponUISettings.locked} disabled={!store.weaponUISettings.show} onChange={(v) => store.updateWeaponUISettings({ locked: v })} />
          
          <div className={`space-y-1.5 mt-2 pt-2 border-t border-[var(--border-subtle)] ${!store.weaponUISettings.show ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1">DISPLAY & APPEARANCE</div>
            <SelectRow 
              label="Layout" 
              value={store.weaponUISettings.layout || 'horizontal'} 
              options={[
                {label: 'Horizontal', value: 'horizontal'},
                {label: 'Vertical', value: 'vertical'}
              ]} 
              onChange={(v) => store.updateWeaponUISettings({ layout: v as 'vertical' | 'horizontal' })} 
            />
            <SelectRow 
              label="Style" 
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
            <ToggleRow label="Enable Animations" value={store.weaponUISettings.enableAnimations} onChange={(v) => store.updateWeaponUISettings({ enableAnimations: v })} />
            <SliderRow label="Width" value={store.weaponUISettings.width} min={100} max={300} step={10} display={`${store.weaponUISettings.width}px`} onChange={(v) => store.updateWeaponUISettings({ width: v })} />
            <SliderRow label="Height (Bar)" value={store.weaponUISettings.height} min={2} max={20} step={2} display={`${store.weaponUISettings.height}px`} onChange={(v) => store.updateWeaponUISettings({ height: v })} />
            <SliderRow label="Scale" value={store.weaponUISettings.scale} min={0.5} max={1.5} step={0.1} display={`${(store.weaponUISettings.scale * 100).toFixed(0)}%`} onChange={(v) => store.updateWeaponUISettings({ scale: v })} />
            <SliderRow label="Opacity" value={store.weaponUISettings.opacity} min={0.1} max={1} step={0.05} display={`${(store.weaponUISettings.opacity * 100).toFixed(0)}%`} onChange={(v) => store.updateWeaponUISettings({ opacity: v })} />
            <SliderRow label="Background Radius" value={store.weaponUISettings.borderRadius} min={0} max={24} step={2} display={`${store.weaponUISettings.borderRadius}px`} onChange={(v) => store.updateWeaponUISettings({ borderRadius: v })} />
            <SliderRow label="Background Blur" value={store.weaponUISettings.glassStrength} min={0} max={30} step={2} display={`${store.weaponUISettings.glassStrength}px`} onChange={(v) => store.updateWeaponUISettings({ glassStrength: v })} />

            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">BORDER SETTINGS</div>
            <SliderRow label="Border Thickness" value={store.weaponUISettings.borderWidth || 0} min={0} max={10} step={1} display={`${store.weaponUISettings.borderWidth || 0}px`} onChange={(v) => store.updateWeaponUISettings({ borderWidth: v })} />
            <ToggleRow label="Dynamic Color (Match Health)" value={store.weaponUISettings.dynamicBorderColor ?? true} onChange={(v) => store.updateWeaponUISettings({ dynamicBorderColor: v })} />

            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">ALERTS & ANCHOR</div>
            <ToggleRow label="Enable Alerts" value={store.weaponUISettings.enableAlerts} onChange={(v) => store.updateWeaponUISettings({ enableAlerts: v })} />
            <SelectRow 
              label="Alert Threshold" 
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
              label="Anchor Position" 
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
      )
    },
    {
      id: 'armor',
      title: t('settings.armorOverlay'),
      icon: <Shield size={14} />,
      content: (
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
      )
    },
    {
      id: 'notifications',
      title: t('settings.uiNotifications'),
      icon: <Bell size={14} />,
      content: (
        <>
          <ToggleRow label="Enable Notifications" value={store.notificationSettings.enabled} onChange={(v) => store.updateNotificationSettings({ enabled: v })} />
          <div className={`space-y-1.5 mt-2 pt-2 border-t border-[var(--border-subtle)] ${!store.notificationSettings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>

            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1">UI DESIGN</div>
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
            <SliderRow label="Display Duration" value={store.notificationSettings.duration} min={1000} max={10000} step={500} display={`${(store.notificationSettings.duration / 1000).toFixed(1)}s`} onChange={(v) => store.updateNotificationSettings({ duration: v })} />
            
            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">EVENT TRIGGERS</div>
            <ToggleRow label="Zone Changes" value={store.notificationSettings.zoneChange} onChange={(v) => store.updateNotificationSettings({ zoneChange: v })} />
            <ToggleRow label="Tool Durability Warnings" value={store.notificationSettings.toolWarning} onChange={(v) => store.updateNotificationSettings({ toolWarning: v })} />
            <ToggleRow label="Loot Drops" value={store.notificationSettings.lootEvents} onChange={(v) => store.updateNotificationSettings({ lootEvents: v })} />
          </div>
        </>
      )
    },
    {
      id: 'bob',
      title: t('settings.bobCompanion'),
      icon: <Bot size={14} />,
      content: (
        <>
          <ToggleRow label="Enable Bob" value={store.notificationSettings.bobMode} onChange={(v) => store.updateNotificationSettings({ bobMode: v })} />
          <div className={`space-y-1.5 mt-2 pt-2 border-t border-[var(--border-subtle)] ${!store.notificationSettings.bobMode ? 'opacity-50 pointer-events-none' : ''}`}>
            
            <SelectRow 
              label="Bob Preset" 
              value={store.notificationSettings.bobJokes ? 'all' : 'essential'} 
              options={[
                {label: 'All Enabled', value: 'all'},
                {label: 'Essential Only', value: 'essential'}
              ]} 
              onChange={(v) => {
                if (v === 'all') {
                  store.updateNotificationSettings({ 
                    bobGreetings: true, bobJokes: true, bobTips: true, bobSecret: true, 
                    bobAchievement: true, bobRareResource: true 
                  });
                } else {
                  store.updateNotificationSettings({ 
                    bobGreetings: false, bobJokes: false, bobTips: false, bobSecret: false, 
                    bobAchievement: false, bobRareResource: false 
                  });
                }
              }} 
            />

            <SliderRow label="Bob Icon Size" value={store.notificationSettings.bobIconScale || 1.0} min={0.5} max={2.5} step={0.1} display={`${((store.notificationSettings.bobIconScale || 1.0) * 100).toFixed(0)}%`} onChange={(v) => store.updateNotificationSettings({ bobIconScale: v })} />
            <SliderRow label="Bob Text Size" value={store.notificationSettings.bobTextScale || 1.0} min={0.5} max={2.5} step={0.1} display={`${((store.notificationSettings.bobTextScale || 1.0) * 100).toFixed(0)}%`} onChange={(v) => store.updateNotificationSettings({ bobTextScale: v })} />
            <SliderRow label="Message Duration" value={store.notificationSettings.bobDuration || 5000} min={1000} max={15000} step={500} display={`${((store.notificationSettings.bobDuration || 5000) / 1000).toFixed(1)}s`} onChange={(v) => store.updateNotificationSettings({ bobDuration: v })} />
            <SliderRow label="Bubble Distance (Horizontal)" value={store.notificationSettings.bobBubbleDistance ?? 16} min={-50} max={150} step={2} display={`${store.notificationSettings.bobBubbleDistance ?? 16}px`} onChange={(v) => store.updateNotificationSettings({ bobBubbleDistance: v })} />
            <SliderRow label="Bubble Offset (Vertical)" value={store.notificationSettings.bobBubbleOffsetY ?? 0} min={-100} max={100} step={2} display={`${store.notificationSettings.bobBubbleOffsetY ?? 0}px`} onChange={(v) => store.updateNotificationSettings({ bobBubbleOffsetY: v })} />

            <SelectRow 
              label="Bob Icon" 
              value={store.notificationSettings.bobIcon || 'bot'} 
              options={[
                {label: 'Default Bot', value: 'bot'},
                {label: 'Ghost', value: 'ghost'},
                {label: 'Cat', value: 'cat'},
                {label: 'Wizard', value: 'wizard'},
                {label: 'Skull', value: 'skull'},
                {label: 'Smiley', value: 'alien'},
                {label: 'Dog', value: 'dog'}
              ]} 
              onChange={(v) => store.updateNotificationSettings({ bobIcon: v as any })} 
            />

            <SelectRow 
              label="Bubble Theme" 
              value={store.notificationSettings.bobTheme || 'default'} 
              options={[
                {label: 'Default Light', value: 'default'},
                {label: 'Cyberpunk', value: 'cyberpunk'},
                {label: 'Fantasy', value: 'fantasy'},
                {label: 'Minimal Dark', value: 'minimal'},
                {label: 'Hologram', value: 'hologram'}
              ]} 
              onChange={(v) => store.updateNotificationSettings({ bobTheme: v as any })} 
            />
            <SelectRow 
              label="Toast Frequency" 
              value={store.notificationSettings.bobFrequency} 
              options={[
                {label: 'Rare (15-25m)', value: 'rare'},
                {label: 'Normal (8-15m)', value: 'normal'},
                {label: 'Chatty (3-8m)', value: 'chatty'}
              ]} 
              onChange={(v) => store.updateNotificationSettings({ bobFrequency: v as any })} 
            />

            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">CATEGORIES</div>
            <ToggleRow label="Enable Greetings" value={store.notificationSettings.bobGreetings} onChange={(v) => store.updateNotificationSettings({ bobGreetings: v })} />
            <ToggleRow label="Enable Jokes" value={store.notificationSettings.bobJokes} onChange={(v) => store.updateNotificationSettings({ bobJokes: v })} />
            <ToggleRow label="Enable Tips" value={store.notificationSettings.bobTips} onChange={(v) => store.updateNotificationSettings({ bobTips: v })} />
            <ToggleRow label="Enable Mining Messages" value={store.notificationSettings.bobMining} onChange={(v) => store.updateNotificationSettings({ bobMining: v })} />
            <ToggleRow label="Enable Combat Messages" value={store.notificationSettings.bobCombat} onChange={(v) => store.updateNotificationSettings({ bobCombat: v })} />
            <ToggleRow label="Enable Gathering Messages" value={store.notificationSettings.bobGathering} onChange={(v) => store.updateNotificationSettings({ bobGathering: v })} />
            <ToggleRow label="Enable Zone Messages" value={store.notificationSettings.bobZone} onChange={(v) => store.updateNotificationSettings({ bobZone: v })} />
            <ToggleRow label="Enable Achievement Messages" value={store.notificationSettings.bobAchievement} onChange={(v) => store.updateNotificationSettings({ bobAchievement: v })} />
            <ToggleRow label="Enable Rare Resource Messages" value={store.notificationSettings.bobRareResource} onChange={(v) => store.updateNotificationSettings({ bobRareResource: v })} />
            <ToggleRow label="Enable Rare Drop Messages" value={store.notificationSettings.bobRareDrop} onChange={(v) => store.updateNotificationSettings({ bobRareDrop: v })} />
            <ToggleRow label="Enable Secret Messages" value={store.notificationSettings.bobSecret} onChange={(v) => store.updateNotificationSettings({ bobSecret: v })} />

            <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">PREVIEW</div>
            <ToggleRow 
              label="Show Preview Dummy"
              value={!!useTrackerStore.getState().bobMessages.find(n => n.id === 'placeholder_bob')}
              onChange={(v) => {
                if (v) {
                  if (!useTrackerStore.getState().bobMessages.find(n => n.id === 'placeholder_bob')) {
                    useTrackerStore.setState((s) => ({
                      bobMessages: [...s.bobMessages, { id: 'placeholder_bob', title: 'Bob', message: 'Drag me to set position', type: 'chat', timestamp: Date.now() } as any]
                    }));
                  }
                } else {
                  useTrackerStore.setState((s) => ({
                    bobMessages: s.bobMessages.filter(n => n.id !== 'placeholder_bob')
                  }));
                }
              }}
            />
          </div>
        </>
      )
    },
    {
      id: 'advanced',
      title: t('settings.advanced'),
      icon: <ShieldAlert size={14} className={store.developerMode ? 'text-amber-400' : ''} />,
      content: (
        <>
          <ToggleRow label="Developer Mode" value={store.developerMode} onChange={store.setDeveloperMode} />
          <p className="text-[9px] text-[var(--text-muted)] px-1 mt-1 mb-2">Enable advanced performance tracking and socket debugging logs.</p>
          {store.developerMode && <DebugPanel />}
        </>
      )
    }
  ];

  if (store.layoutMode === 'horizontal') {
    const activeSection = sections.find(s => s.id === activeTab) || sections[0];
    return (
      <div className="flex w-[520px] h-[280px] text-[var(--text-primary)] pl-1">
         {/* Sidebar Tabs */}
         <div className="w-[160px] shrink-0 flex flex-col gap-1 pr-2 border-r border-[var(--border-subtle)] mr-2 overflow-y-auto custom-scrollbar pt-1 pb-4">
           {sections.map(s => (
             <button
               key={s.id}
               onClick={() => setActiveTab(s.id)}
               className={`flex items-center gap-2 w-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-200 select-none ${
                 activeTab === s.id 
                   ? 'bg-[var(--accent-primary)] text-white shadow-md shadow-[var(--accent-primary)]/20' 
                   : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
               }`}
             >
               {s.icon}
               <span className="flex-1 text-left">{s.title}</span>
             </button>
           ))}
         </div>
         {/* Tab Content */}
         <div className="flex-1 w-[320px] overflow-y-auto custom-scrollbar pr-1 pb-4 pt-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 pl-1 border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
              {activeSection.icon}
              {activeSection.title}
            </h3>
            <div key={activeSection.id} className="animate-in fade-in slide-in-from-right-2 duration-200">
              {activeSection.content}
            </div>
         </div>
      </div>
    );
  }

  // Vertical Layout Mode
  return (
    <div className="flex flex-col text-[var(--text-primary)] overflow-y-auto custom-scrollbar pb-1 px-1 pt-1 w-full min-w-[150px]">
      {sections.map(s => (
        <AccordionSection key={s.id} title={s.title} icon={s.icon} defaultOpen={false}>
          {s.content}
        </AccordionSection>
      ))}
    </div>
  );
};
