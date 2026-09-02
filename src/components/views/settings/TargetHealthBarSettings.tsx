import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ToggleRow, SelectRow } from './SettingsControls';
import { UIAppearanceSettings } from './UIAppearanceSettings';
import { useTrackerStore } from '../../../store/trackerStore';

export const TargetHealthBarSettings: React.FC = () => {
  const store = useSettingsStore(useShallow((state: any) => ({
    targetUISettings: state.targetUISettings,
    updateTargetUISettings: state.updateTargetUISettings
  })));

  const isDummyActive = useTrackerStore(state => state.currentTarget?.key === 'dummy-target');

  const toggleDummy = (active: boolean) => {
    if (active) {
      useTrackerStore.setState({
        currentTarget: {
          key: 'dummy-target',
          name: 'Preview Target',
          hp: 75,
          maxHp: 100,
          type: 'mob',
          lastHit: Date.now() + 9999999 // keep it alive for a while
        }
      });
    } else {
      const current = useTrackerStore.getState().currentTarget;
      if (current?.key === 'dummy-target') {
        useTrackerStore.setState({ currentTarget: null });
      }
    }
  };

  React.useEffect(() => {
    return () => {
      const current = useTrackerStore.getState().currentTarget;
      if (current?.key === 'dummy-target') {
        useTrackerStore.setState({ currentTarget: null });
      }
    };
  }, []);

  return (
    <div className="space-y-1.5 pt-2">
      <div className="text-[9px] font-bold text-[var(--text-muted)] mb-1 pl-1">Preview</div>
      <ToggleRow 
        label="Show Dummy Target" 
        value={isDummyActive} 
        onChange={(v) => toggleDummy(v)} 
      />

      <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">Visibility Settings</div>
      <ToggleRow label="Show Mob Health" value={store.targetUISettings.showMobHealth} onChange={(v) => store.updateTargetUISettings({ showMobHealth: v })} />
      <ToggleRow label="Show Ore Health" value={store.targetUISettings.showOreHealth} onChange={(v) => store.updateTargetUISettings({ showOreHealth: v })} />
      <ToggleRow label="Show Tree Health" value={store.targetUISettings.showTreeHealth} onChange={(v) => store.updateTargetUISettings({ showTreeHealth: v })} />
      
      <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">Size & Scale</div>
      <UIAppearanceSettings settings={store.targetUISettings} onUpdate={store.updateTargetUISettings} widthRange={[150, 600]} heightRange={[8, 48]} />

      <div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">Position & Opacity</div>
      <ToggleRow label="Lock Position" value={store.targetUISettings.locked} onChange={(v) => store.updateTargetUISettings({ locked: v })} />
      <SelectRow 
        label="Position" 
        value={store.targetUISettings.position} 
        options={[
          { label: 'Top Center', value: 'top-center' },
          { label: 'Bottom Center', value: 'bottom-center' },
          { label: 'Center', value: 'center' },
          { label: 'Top Left', value: 'top-left' },
          { label: 'Top Right', value: 'top-right' },
          { label: 'Bottom Left', value: 'bottom-left' },
          { label: 'Bottom Right', value: 'bottom-right' },
          { label: 'Custom Dragged', value: 'custom' }
        ]} 
        onChange={(v) => store.updateTargetUISettings({ position: v as any })} 
      />
    </div>
  );
};
