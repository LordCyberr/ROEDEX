import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ToggleRow, SliderRow, SelectRow, HotkeyRow } from './SettingsControls';
import { useTranslation } from '../../../hooks/useTranslation';

export const GeneralSettings: React.FC = () => {
  const store = useSettingsStore(useShallow(state => ({
    language: state.language,
    setLanguage: state.setLanguage,
    theme: state.theme,
    setTheme: state.setTheme,
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
    setLockUiHotkey: state.setLockUiHotkey
  })));
  const { t } = useTranslation();

  return (
    <>
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
        value={store.theme}
        options={[
          { label: 'Dark Mode (Default)', value: 'default' },
          { label: "Bob's Adventure (Premium)", value: 'ruyui' },
          { label: "Kaya's Flame (Premium)", value: 'ruyui-demon' },
          { label: "Lia's Magic (Premium)", value: 'ruyui-witch' },
          { label: "Crash's Resolve (Premium)", value: 'ruyui-orc' },
          { label: 'Abstract Chain (Premium)', value: 'abstract' },
          { label: 'Obsidian Gold (Premium)', value: 'obsidian' },
          { label: 'Neon Cyberpunk (Premium)', value: 'cyberpunk' },
          { label: 'Holographic Blue (Premium)', value: 'hologram' },
          { label: 'Amethyst Violet (Premium)', value: 'amethyst' },
          { label: 'Ruby Glass (Premium)', value: 'ruby_glass' },
          { label: 'Ocean Blue', value: 'ocean' },
          { label: 'Crimson Red', value: 'crimson' },
          { label: 'Midnight Black', value: 'midnight' },
          { label: 'Tokyo Night', value: 'tokyo-night' },
          { label: 'Light Mode', value: 'light' }
        ]}
        onChange={(v) => store.setTheme(v)}
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
      <SliderRow label={t('settings.globalScale')} value={store.globalScale || 1.0} min={0.5} max={2.5} step={0.05} display={(v) => `${Math.round((v || 1.0) * 100)}%`} onChange={store.setGlobalScale} realTime={false} />
      <SliderRow label={t('settings.activeOpacity')} value={store.activeOpacity} min={0.1} max={1} step={0.05} display={(v) => `${Math.round(v * 100)}%`} onChange={store.setActiveOpacity} />
      <SliderRow label={t('settings.idleOpacity')} value={store.idleOpacity} min={0.1} max={1} step={0.05} display={(v) => `${Math.round(v * 100)}%`} onChange={store.setIdleOpacity} />
      <SliderRow label={t('settings.minimizedOrbSize')} value={store.orbSize} min={30} max={100} step={2} display={(v) => `${v}px`} onChange={store.setOrbSize} />
      {store.minimizedIcon === 'custom' && (
        <div className="flex flex-col gap-1 px-2 py-1.5 mb-1 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-md">
          <span className="text-[11px] text-[var(--text-primary)] font-medium">{t('settings.customImageUrl')}</span>
          <input type="text" value={store.minimizedIconUrl || ''} onChange={e => store.setMinimizedIconUrl(e.target.value)} className="w-full bg-[var(--bg-base)] border border-[var(--border-accent)] rounded px-1.5 py-1 text-[10px] text-white outline-none" placeholder="https://example.com/icon.png" />
        </div>
      )}
      <SliderRow label={t('settings.orbBorderThickness')} value={store.orbBorderThickness} min={0} max={10} step={1} display={`${store.orbBorderThickness}px`} onChange={store.setOrbBorderThickness} />
      <SelectRow
        label={t('settings.minimizedIcon')}
        value={store.minimizedIcon}
        options={[
          { label: 'Tracking Pulse', value: 'pulse' },
          { label: 'Lightning', value: 'lightning' },
          { label: 'Sword', value: 'sword' },
          { label: 'Pickaxe', value: 'pickaxe' },
          { label: 'Shield', value: 'shield' },
          { label: 'ROEDEX', value: 'roedex' },
          { label: 'RX', value: 'rx' },
          { label: 'Custom Image URL', value: 'custom' }
        ]}
        onChange={(v) => store.setMinimizedIcon(v as any)}
      />

      <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t('settings.behavior')}</div>
      <ToggleRow label={t('settings.autoMinimizeOnChest')} value={store.autoMinimizeOnChest} onChange={(v) => store.setAutoMinimizeOnChest(v)} />
      <HotkeyRow label={t('settings.minimizeHotkey')} value={store.minimizeHotkey || 'Ctrl+Shift+M'} onChange={store.setMinimizeHotkey} />
      <HotkeyRow label={t('settings.toggleLayoutHotkey')} value={store.toggleLayoutHotkey || 'Shift+H'} onChange={store.setToggleLayoutHotkey} />
      <HotkeyRow label={t('settings.resetSizeHotkey')} value={store.resetSizeHotkey || 'Shift+R'} onChange={store.setResetSizeHotkey} />
      <HotkeyRow label={t('settings.lockUiHotkey')} value={store.lockUiHotkey || 'Shift+U'} onChange={store.setLockUiHotkey} />
    </>
  );
};
