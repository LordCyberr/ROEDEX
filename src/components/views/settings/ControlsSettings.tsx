import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { HotkeyRow } from './SettingsControls';
import { useTranslation } from '../../../hooks/useTranslation';

export const ControlsSettings: React.FC = () => {
  const store = useSettingsStore(useShallow(state => ({
    minimizeHotkey: state.minimizeHotkey,
    setMinimizeHotkey: state.setMinimizeHotkey,
    toggleLayoutHotkey: state.toggleLayoutHotkey,
    setToggleLayoutHotkey: state.setToggleLayoutHotkey,
    resetSizeHotkey: state.resetSizeHotkey,
    setResetSizeHotkey: state.setResetSizeHotkey,
    lockUiHotkey: state.lockUiHotkey,
    setLockUiHotkey: state.setLockUiHotkey,
  })));
  const { t } = useTranslation();

  return (
    <>
      <div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1">Keyboard Shortcuts</div>
      <HotkeyRow label={t('settings.minimizeHotkey')} value={store.minimizeHotkey || 'Ctrl+Shift+M'} onChange={store.setMinimizeHotkey} />
      <HotkeyRow label={t('settings.toggleLayoutHotkey')} value={store.toggleLayoutHotkey || 'Shift+H'} onChange={store.setToggleLayoutHotkey} />
      <HotkeyRow label={t('settings.lockUiHotkey')} value={store.lockUiHotkey || 'Shift+U'} onChange={store.setLockUiHotkey} />
      <HotkeyRow label={t('settings.resetSizeHotkey')} value={store.resetSizeHotkey || 'Shift+R'} onChange={store.setResetSizeHotkey} />
    </>
  );
};
