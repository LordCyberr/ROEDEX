import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ToggleRow, SliderRow, SelectRow } from './SettingsControls';
import { useTranslation } from '../../../hooks/useTranslation';

export const OrbSettings: React.FC = () => {
  const store = useSettingsStore(useShallow(state => ({
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
  })));
  const { t } = useTranslation();

  return (
    <>
      <div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1">Appearance</div>
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
          { label: 'Jarvis Animation', value: 'jarvis' },
          { label: 'Custom Image URL', value: 'custom' }
        ]}
        onChange={(v) => store.setMinimizedIcon(v as any)}
      />
      {store.minimizedIcon === 'custom' && (
        <div className="flex flex-col gap-1 px-2 py-1.5 mb-1 overlay-panel">
          <span className="text-[11px] text-[var(--text-primary)] font-medium">{t('settings.customImageUrl')}</span>
          <input type="text" value={store.minimizedIconUrl || ''} onChange={e => store.setMinimizedIconUrl(e.target.value)} className="w-full bg-[var(--bg-base)] border border-[var(--border-accent)] rounded px-1.5 py-1 text-[10px] text-white outline-none" placeholder="https://example.com/icon.png" />
        </div>
      )}
      <SliderRow label={t('settings.minimizedOrbSize')} value={store.orbSize} min={30} max={100} step={2} display={(v) => `${v}px`} onChange={store.setOrbSize} />
      <SliderRow label={t('settings.orbBorderThickness')} value={store.orbBorderThickness} min={0} max={10} step={1} display={`${store.orbBorderThickness}px`} onChange={store.setOrbBorderThickness} />
      
      <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t('settings.behavior')}</div>
      <ToggleRow label={t('settings.autoMinimizeOnChest')} value={store.autoMinimizeOnChest} onChange={(v) => store.setAutoMinimizeOnChest(v)} />
    </>
  );
};
