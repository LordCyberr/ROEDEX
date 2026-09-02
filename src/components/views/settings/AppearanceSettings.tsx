import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ToggleRow, SliderRow, SelectRow, HotkeyRow } from './SettingsControls';
import { useTranslation } from '../../../hooks/useTranslation';
import { Eye, Sliders, Keyboard } from 'lucide-react';

export const AppearanceSettings: React.FC = () => {
  const store = useSettingsStore(useShallow(state => ({
    language: state.language,
    setLanguage: state.setLanguage,
    theme: state.theme,
    setTheme: state.setTheme,
    performanceMode: state.performanceMode,
    setPerformanceMode: state.setPerformanceMode,
    displayDensity: state.displayDensity,
    setDisplayDensity: state.setDisplayDensity,
    verticalGroupingMode: state.verticalGroupingMode,
    setVerticalGroupingMode: state.setVerticalGroupingMode,
    layoutMode: state.layoutMode,
    globalScale: state.globalScale,
    setGlobalScale: state.setGlobalScale,
    activeOpacity: state.activeOpacity,
    setActiveOpacity: state.setActiveOpacity,
    idleOpacity: state.idleOpacity,
    setIdleOpacity: state.setIdleOpacity,
    orbSize: state.orbSize,
    setOrbSize: state.setOrbSize,
    minimizedIcon: state.minimizedIcon,
    setMinimizedIcon: state.setMinimizedIcon,
    minimizedIconUrl: state.minimizedIconUrl,
    setMinimizedIconUrl: state.setMinimizedIconUrl,
    orbBorderThickness: state.orbBorderThickness,
    setOrbBorderThickness: state.setOrbBorderThickness,
    autoMinimizeOnChest: state.autoMinimizeOnChest,
    setAutoMinimizeOnChest: state.setAutoMinimizeOnChest,
    minimizeHotkey: state.minimizeHotkey,
    setMinimizeHotkey: state.setMinimizeHotkey,
    toggleLayoutHotkey: state.toggleLayoutHotkey,
    setToggleLayoutHotkey: state.setToggleLayoutHotkey,
    resetSizeHotkey: state.resetSizeHotkey,
    setResetSizeHotkey: state.setResetSizeHotkey,
    lockUiHotkey: state.lockUiHotkey,
    setLockUiHotkey: state.setLockUiHotkey,
    visualQuality: state.visualQuality,
    setVisualQuality: state.setVisualQuality
  })));
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3.5">
      {/* Group 1: Appearance */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 pl-1">
          <Eye size={10} />
          <span>Appearance</span>
        </div>
        <SelectRow
          label={t('settings.language')}
          value={store.language}
          options={[
            { label: 'English', value: 'en' },
            { label: 'Español', value: 'es' },
            { label: 'Русский', value: 'ru' },
            { label: '한국어', value: 'ko' }
          ]}
          onChange={(v) => store.setLanguage(v as any)}
        />
        <SelectRow
          label={t('settings.uiTheme')}
          value={store.theme || 'default'}
          options={[
            { label: 'Dark Mode (Default)', value: 'default' },
            { label: 'AMOLED Black', value: 'amoled' },
            { label: 'Frosted Glass', value: 'glass' },
            { label: 'Neon Glow', value: 'neon' },
            { label: 'Cyberpunk Synthwave', value: 'cyberpunk' },
            { label: 'Emerald Forest', value: 'emerald' },
            { label: 'Solar Gold', value: 'gold' },
            { label: 'Deep Ocean', value: 'ocean' },
            { label: 'Midnight Slate', value: 'midnight' },
            { label: 'Volcano Basalt', value: 'volcano' },
            { label: 'Void Violet', value: 'void' },
            { label: 'Arctic Frost', value: 'arctic' },
            { label: 'Toxic Lime', value: 'toxin' },
            { label: 'Blood Moon Maroon', value: 'bloodmoon' },
            { label: 'Sandstorm Amber', value: 'sandstorm' },
            { label: 'Celestial Starlight', value: 'celestial' },
            { label: 'Ironforge Metallic', value: 'ironforge' },
            { label: 'Spirit Wisp Cyan', value: 'wisp' },
            { label: '🌌 Aurora Teal', value: 'aurora' },
            { label: '🌸 Rose Gold', value: 'rose' },
            { label: '⬛ Monochrome', value: 'monochrome' },
            { label: '🌲 Dark Forest', value: 'forest' },
            { label: '👑 Royal Purple & Gold', value: 'royal' },
            { label: 'Light Mode', value: 'light' },
            { label: "Bob's Ruyui (Black & Orange)", value: 'bob-theme' },
            { label: "Kaya's Demon (Black & Crimson)", value: 'kaya-theme' },
            { label: "Lia's Witch (Navy & Cyan)", value: 'lia-theme' },
            { label: "Crash's Orc (Dark Forest Green)", value: 'crash-theme' }
          ]}
          onChange={(v) => store.setTheme(v)}
        />
        <ToggleRow
          label="Performance Mode"
          description="Disables heavy animations (ParticleGlobe, MatrixRain) in main overlay for best performance."
          value={store.performanceMode}
          onChange={(v) => store.setPerformanceMode(v)}
        />
        <SelectRow
          label={t('settings.displayDensity')}
          value={store.displayDensity}
          options={[{ label: 'Compact Mode', value: 'compact' }, { label: 'Standard Mode', value: 'standard' }]}
          onChange={(v) => store.setDisplayDensity(v as any)}
        />
        <SelectRow
          label={t('settings.verticalLayout')}
          value={store.verticalGroupingMode}
          options={[{ label: 'Grouped by Zone', value: 'grouped' }, { label: 'Simple Titles', value: 'flat' }]}
          onChange={(v) => store.setVerticalGroupingMode(v as any)}
          disabled={store.layoutMode !== 'vertical'}
        />
      </div>

      {/* Group 2: Scale & Opacity */}
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 pl-1">
          <Sliders size={10} />
          <span>Scale & Opacity</span>
        </div>
        <SliderRow label={t('settings.globalScale')} value={store.globalScale || 1.0} min={0.5} max={2.5} step={0.05} display={(v) => `${Math.round((v || 1.0) * 100)}%`} onChange={store.setGlobalScale} realTime={false} />
        <SliderRow label={t('settings.activeOpacity')} value={store.activeOpacity} min={0.1} max={1} step={0.05} display={(v) => `${Math.round(v * 100)}%`} onChange={store.setActiveOpacity} />
        <SliderRow label={t('settings.idleOpacity')} value={store.idleOpacity} min={0.1} max={1} step={0.05} display={(v) => `${Math.round(v * 100)}%`} onChange={store.setIdleOpacity} />
        <SliderRow label={t('settings.minimizedOrbSize')} value={store.orbSize} min={30} max={100} step={2} display={(v) => `${v}px`} onChange={store.setOrbSize} />
        {store.minimizedIcon === 'custom' && (
          <div className="flex flex-col gap-1 px-2.5 py-1.5 mb-1.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
            <span className="text-[10px] text-[var(--text-muted)] font-medium">{t('settings.customImageUrl')}</span>
            <input type="text" value={store.minimizedIconUrl || ''} onChange={e => store.setMinimizedIconUrl(e.target.value)} className="w-full bg-[var(--bg-card)] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white outline-none focus:border-[var(--accent-primary)]/50 transition-colors" placeholder="https://example.com/icon.png" />
          </div>
        )}
        <SliderRow label={t('settings.orbBorderThickness')} value={store.orbBorderThickness} min={0} max={10} step={1} display={(v) => `${v}px`} onChange={store.setOrbBorderThickness} />
        <SelectRow
          label={t('settings.minimizedIcon')}
          value={store.minimizedIcon}
          options={[
            { label: 'Official ROEDEX Logo (Default)', value: 'logo' },
            { label: 'Tracking Pulse', value: 'pulse' },
            { label: 'Lightning', value: 'lightning' },
            { label: 'Sword', value: 'sword' },
            { label: 'Pickaxe', value: 'pickaxe' },
            { label: 'Shield', value: 'shield' },
            { label: 'ROEDEX Text', value: 'roedex' },
            { label: 'RX Emblem', value: 'rx' },
            { label: 'Custom Image URL', value: 'custom' }
          ]}
          onChange={(v) => store.setMinimizedIcon(v as any)}
        />
      </div>

      {/* Group 3: Shortcuts */}
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 pl-1">
          <Keyboard size={10} />
          <span>Behavior & Shortcuts</span>
        </div>
        <ToggleRow label={t('settings.autoMinimizeOnChest')} value={store.autoMinimizeOnChest} onChange={(v) => store.setAutoMinimizeOnChest(v)} />
        <HotkeyRow label={t('settings.minimizeHotkey')} value={store.minimizeHotkey || 'Ctrl+Shift+M'} onChange={store.setMinimizeHotkey} />
        <HotkeyRow label={t('settings.toggleLayoutHotkey')} value={store.toggleLayoutHotkey || 'Shift+H'} onChange={store.setToggleLayoutHotkey} />
        <HotkeyRow label={t('settings.resetSizeHotkey')} value={store.resetSizeHotkey || 'Shift+R'} onChange={store.setResetSizeHotkey} />
        <HotkeyRow label={t('settings.lockUiHotkey')} value={store.lockUiHotkey || 'Shift+U'} onChange={store.setLockUiHotkey} />
      </div>
    </div>
  );
};
