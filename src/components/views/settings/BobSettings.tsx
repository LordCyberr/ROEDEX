import React from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { ToggleRow, SliderRow, SelectRow } from './SettingsControls';

const SectionHeader: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="mt-4 mb-2">
    <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest uppercase pl-1">{title}</div>
    {description && <div className="text-[9px] text-[var(--text-secondary)] pl-1 mt-0.5 leading-tight">{description}</div>}
  </div>
);

export const BobSettings: React.FC = () => {
  const store = useTrackerStore();

  return (
    <>
      <ToggleRow 
        label="Enable AI Companion" 
        description="Turns the on-screen companion on or off entirely."
        value={store.notificationSettings.bobMode} 
        onChange={(v) => store.updateNotificationSettings({ bobMode: v })} 
      />

      <div className={`space-y-1 mt-3 pt-3 border-t border-[var(--border-subtle)] ${!store.notificationSettings.bobMode ? 'opacity-50 pointer-events-none' : ''}`}>
        
        <SectionHeader title="Preview & Setup" />
        
        <SelectRow
          label="Active Companion"
          description="Choose which character accompanies you."
          value={store.activeCompanion || 'bob'}
          options={[
            { label: 'Bob (The Explorer)', value: 'bob' },
            { label: 'Kaya (The Fiery Oni)', value: 'kaya' },
            { label: 'Lia (The Elf Mage)', value: 'lia' },
            { label: 'Crash (The Orc)', value: 'crash' }
          ]}
          onChange={(v) => store.setActiveCompanion(v as any)}
        />

        <button 
          onClick={() => {
            store.setTutorialStep(0);
            store.updateNotificationSettings({ tutorialCompleted: false });
          }}
          className="w-full bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/40 transition-colors px-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-1 shadow-inner"
        >
          Replay Onboarding Tutorial
        </button>
        
        <ToggleRow
          label="Show Preview Dummy"
          description="Spawns a fake message so you can drag and position the companion."
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

        <SectionHeader title="Appearance" />

        <SliderRow label="Companion Icon Size" description="Scales the avatar." value={store.notificationSettings.bobIconScale || 1.0} min={0.5} max={2.5} step={0.1} display={`${((store.notificationSettings.bobIconScale || 1.0) * 100).toFixed(0)}%`} onChange={(v) => store.updateNotificationSettings({ bobIconScale: v })} />
        <SliderRow label="Companion Text Size" description="Scales the chat bubble text." value={store.notificationSettings.bobTextScale || 1.0} min={0.5} max={2.5} step={0.1} display={`${((store.notificationSettings.bobTextScale || 1.0) * 100).toFixed(0)}%`} onChange={(v) => store.updateNotificationSettings({ bobTextScale: v })} />
        <SelectRow
          label="Chat Bubble Theme"
          description="Visual style of the companion's speech bubble."
          value={store.notificationSettings.bobBubbleTheme || 'connected'}
          options={[
            { label: 'Connected (Classic)', value: 'connected' },
            { label: 'Floating', value: 'floating' },
            { label: 'Holographic', value: 'holographic' }
          ]}
          onChange={(v) => store.updateNotificationSettings({ bobBubbleTheme: v as any })}
        />

        <SectionHeader title="Behavior" />

        <SelectRow
          label="Toast Frequency"
          description="How often the companion speaks to you."
          value={store.notificationSettings.bobFrequency}
          options={[
            { label: 'Rare (15-25m)', value: 'rare' },
            { label: 'Normal (8-15m)', value: 'normal' },
            { label: 'Chatty (3-8m)', value: 'chatty' }
          ]}
          onChange={(v) => store.updateNotificationSettings({ bobFrequency: v as any })}
        />

        <SliderRow label="Message Duration" description="How long messages stay on screen." value={store.notificationSettings.bobDuration || 5000} min={1000} max={15000} step={500} display={`${((store.notificationSettings.bobDuration || 5000) / 1000).toFixed(1)}s`} onChange={(v) => store.updateNotificationSettings({ bobDuration: v })} />

        <SectionHeader title="Positioning" />

        <SliderRow label="Bubble Distance" description="Horizontal distance from avatar." value={store.notificationSettings.bobBubbleDistance ?? 16} min={-50} max={150} step={2} display={`${store.notificationSettings.bobBubbleDistance ?? 16}px`} onChange={(v) => store.updateNotificationSettings({ bobBubbleDistance: v })} />
        <SliderRow label="Bubble Offset" description="Vertical shift of the bubble." value={store.notificationSettings.bobBubbleOffsetY ?? 0} min={-100} max={100} step={2} display={`${store.notificationSettings.bobBubbleOffsetY ?? 0}px`} onChange={(v) => store.updateNotificationSettings({ bobBubbleOffsetY: v })} />

        <SectionHeader title="Message Categories" description="Toggle which types of events trigger a companion response." />

        <SelectRow
          label="Quick Preset"
          description="Quickly enable or disable message groups."
          value={store.notificationSettings.bobJokes ? 'all' : 'essential'}
          options={[
            { label: 'All Enabled', value: 'all' },
            { label: 'Essential Only', value: 'essential' }
          ]}
          onChange={(v) => {
            if (v === 'all') {
              store.updateNotificationSettings({ bobGreetings: true, bobJokes: true, bobTips: true, bobSecret: true, bobAchievement: true, bobRareResource: true });
            } else {
              store.updateNotificationSettings({ bobGreetings: false, bobJokes: false, bobTips: false, bobSecret: false, bobAchievement: false, bobRareResource: false });
            }
          }}
        />

        <ToggleRow label="Greetings" description="Saying hello on launch." value={store.notificationSettings.bobGreetings} onChange={(v) => store.updateNotificationSettings({ bobGreetings: v })} />
        <ToggleRow label="Jokes & Personality" description="Random funny chatter." value={store.notificationSettings.bobJokes} onChange={(v) => store.updateNotificationSettings({ bobJokes: v })} />
        <ToggleRow label="Helpful Tips" description="Game mechanics advice." value={store.notificationSettings.bobTips} onChange={(v) => store.updateNotificationSettings({ bobTips: v })} />
        <ToggleRow label="Mining & Nodes" description="Reacts to hitting ore nodes." value={store.notificationSettings.bobMining} onChange={(v) => store.updateNotificationSettings({ bobMining: v })} />
        <ToggleRow label="Combat & Kills" description="Reacts when defeating enemies." value={store.notificationSettings.bobCombat} onChange={(v) => store.updateNotificationSettings({ bobCombat: v })} />
        <ToggleRow label="Gathering (Wood/Plants)" description="Reacts to forestry/herbs." value={store.notificationSettings.bobGathering} onChange={(v) => store.updateNotificationSettings({ bobGathering: v })} />
        <ToggleRow label="Zone Changes" description="Reacts to entering new areas." value={store.notificationSettings.bobZone} onChange={(v) => store.updateNotificationSettings({ bobZone: v })} />
        <ToggleRow label="Achievements" description="Celebrates progression." value={store.notificationSettings.bobAchievement} onChange={(v) => store.updateNotificationSettings({ bobAchievement: v })} />
        <ToggleRow label="Rare Drops & Loot" description="Hypes up epic loot drops." value={store.notificationSettings.bobRareDrop} onChange={(v) => store.updateNotificationSettings({ bobRareDrop: v })} />

      </div>
    </>
  );
};
