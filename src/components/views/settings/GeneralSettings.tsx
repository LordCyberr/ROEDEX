import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { SliderRow, SelectRow } from './SettingsControls';
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
    visualQuality: state.visualQuality,
    setVisualQuality: state.setVisualQuality
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
          { label: "Bob's Adventure (Premium)", value: 'bob-theme' },
          { label: "Kaya's Flame (Premium)", value: 'kaya-theme' },
          { label: "Lia's Magic (Premium)", value: 'lia-theme' },
          { label: "Crash's Resolve (Premium)", value: 'crash-theme' },
          { label: 'Obsidian Gold (Premium)', value: 'gold' },
          { label: 'Neon Cyberpunk (Premium)', value: 'cyberpunk' },
          { label: 'Emerald Green (Premium)', value: 'emerald' },
          { label: 'Ruby Glass (Premium)', value: 'glass' },
          { label: 'Neon Purple (Premium)', value: 'neon' },
          { label: 'Ocean Blue', value: 'ocean' },
          { label: 'Midnight Black', value: 'amoled' },
          { label: 'Volcano (Premium)', value: 'volcano' },
          { label: 'The Void (Premium)', value: 'void' },
          { label: 'Arctic Frost (Premium)', value: 'arctic' },
          { label: 'Toxic Waste (Premium)', value: 'toxin' },
          { label: 'Bloodmoon (Premium)', value: 'bloodmoon' },
          { label: 'Sandstorm (Premium)', value: 'sandstorm' },
          { label: 'Celestial (Premium)', value: 'celestial' },
          { label: 'Ironforge (Premium)', value: 'ironforge' },
          { label: 'Wisp (Premium)', value: 'wisp' },
          { label: 'Aurora Borealis (Premium)', value: 'aurora' },
          { label: 'Rose Gold (Premium)', value: 'rose' },
          { label: 'Monochrome (Premium)', value: 'monochrome' },
          { label: 'Forest Life (Premium)', value: 'forest' },
          { label: 'Royal Purple (Premium)', value: 'royal' },
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
    </>
  );
};
