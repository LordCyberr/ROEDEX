import React from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ToggleRow, SliderRow, SelectRow } from './SettingsControls';
import { useTranslation } from '../../../hooks/useTranslation';
import { Bot, Sliders, MessageSquare } from 'lucide-react';

export const CompanionSettings: React.FC = () => {
  const { t } = useTranslation();
  const store = useSettingsStore(useShallow((state: any) => ({
    notificationSettings: state.notificationSettings,
    updateNotificationSettings: state.updateNotificationSettings,
    activeCompanion: state.activeCompanion,
    setActiveCompanion: state.setActiveCompanion,
    setTutorialStep: state.setTutorialStep,
    companionMessages: state.companionMessages
  })));

  return (
    <div className="flex flex-col gap-3.5">
      {/* Group 1: General Companion Activation */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 pl-1">
          <Bot size={10} />
          <span>General</span>
        </div>
        <ToggleRow 
          label={t('settings.enableCompanionMode')} 
          description={t('settings.descCompanion')}
          value={store.notificationSettings.companionMode} 
          onChange={(v) => store.updateNotificationSettings({ companionMode: v })} 
        />

        <div className={`flex flex-col gap-1 mt-1 pt-1.5 border-t border-white/5 ${!store.notificationSettings.companionMode ? 'opacity-40 pointer-events-none' : ''}`}>
          <SelectRow
            label={t('settings.activePersona')}
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
            className="w-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all px-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider mb-2 shadow-inner"
          >
            Replay Onboarding Tutorial
          </button>
          
          <ToggleRow
            label={t('settings.showPreviewDummy')}
            description="Spawns a fake message so you can drag and position the companion."
            value={!!useSettingsStore.getState().companionMessages?.find((n: any) => n.id === 'placeholder_companion')}
            onChange={(v) => {
              if (v) {
                if (!useSettingsStore.getState().companionMessages?.find((n: any) => n.id === 'placeholder_companion')) {
                  useSettingsStore.setState((s: any) => ({
                    companionMessages: [...(s.companionMessages || []), { id: 'placeholder_companion', title: 'Bob', message: 'Drag me to set position', type: 'chat', timestamp: Date.now() } as any]
                  }));
                }
              } else {
                useSettingsStore.setState((s: any) => ({
                  companionMessages: (s.companionMessages || []).filter((n: any) => n.id !== 'placeholder_companion')
                }));
              }
            }}
          />
        </div>
      </div>

      {/* Group 2: Bubble & Scale */}
      <div className={`flex flex-col gap-1 mt-1 ${!store.notificationSettings.companionMode ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 pl-1">
          <Sliders size={10} />
          <span>Bubble & Scale</span>
        </div>
        <SliderRow label={t('settings.companionIconScale')} description="Scales the avatar." value={store.notificationSettings.companionIconScale || 1.0} min={0.5} max={2.5} step={0.1} display={(v) => `${((v || 1.0) * 100).toFixed(0)}%`} onChange={(v) => store.updateNotificationSettings({ companionIconScale: v })} />
        <SliderRow label={t('settings.speechBubbleTextScale')} description="Scales the chat bubble text." value={store.notificationSettings.companionTextScale || 1.0} min={0.5} max={2.5} step={0.1} display={(v) => `${((v || 1.0) * 100).toFixed(0)}%`} onChange={(v) => store.updateNotificationSettings({ companionTextScale: v })} />
        <SelectRow
          label={t('settings.speechBubbleTheme')}
          description="Visual style of the companion's speech bubble."
          value={store.notificationSettings.companionBubbleTheme || 'connected'}
          options={[
            { label: 'Connected (Classic)', value: 'connected' },
            { label: 'Floating', value: 'floating' },
            { label: 'Holographic', value: 'holographic' }
          ]}
          onChange={(v) => store.updateNotificationSettings({ companionBubbleTheme: v as any })}
        />
        <SelectRow
          label="Bubble Material"
          description="The texture and visual effect of the bubble."
          value={store.notificationSettings.bobBubbleStyle || 'glass'}
          options={[
            { label: 'Frosted Glass', value: 'glass' },
            { label: 'Cyberpunk', value: 'cyber' },
            { label: 'Pixelated', value: 'pixel' },
            { label: 'Fantasy', value: 'fantasy' },
            { label: 'Minimal', value: 'minimal' },
            { label: 'Hologram', value: 'hologram' }
          ]}
          onChange={(v) => store.updateNotificationSettings({ bobBubbleStyle: v as any })}
        />
        <SelectRow
          label={t('settings.chatterFrequency')}
          description="How often the companion speaks to you."
          value={store.notificationSettings.bobFrequency}
          options={[
            { label: 'Rare (15-25m)', value: 'rare' },
            { label: 'Normal (8-15m)', value: 'normal' },
            { label: 'Chatty (3-8m)', value: 'chatty' }
          ]}
          onChange={(v) => store.updateNotificationSettings({ bobFrequency: v as any })}
        />
        <SelectRow
          label={t('settings.roastLevel')}
          description="How brutally the companion roasts you for dying or playing poorly."
          value={store.notificationSettings.roastLevel || 'mild'}
          options={[
            { label: 'Off', value: 'off' },
            { label: 'Mild (Playful)', value: 'mild' },
            { label: 'Savage (Brutal)', value: 'savage' }
          ]}
          onChange={(v) => store.updateNotificationSettings({ roastLevel: v as any })}
        />
        <SliderRow label={t('settings.speechBubbleDuration')} description="How long messages stay on screen." value={store.notificationSettings.companionDuration || 5000} min={1000} max={15000} step={500} display={(v) => `${((v || 5000) / 1000).toFixed(1)}s`} onChange={(v) => store.updateNotificationSettings({ companionDuration: v })} />
        <SliderRow label={t('settings.bubbleDistance')} description="Horizontal distance from avatar." value={store.notificationSettings.companionBubbleDistance ?? 16} min={-50} max={150} step={2} display={(v) => `${v ?? 16}px`} onChange={(v) => store.updateNotificationSettings({ companionBubbleDistance: v })} />
        <SliderRow label={t('settings.bubbleOffset')} description="Vertical shift of the bubble." value={store.notificationSettings.companionBubbleOffsetY ?? 0} min={-100} max={100} step={2} display={(v) => `${v ?? 0}px`} onChange={(v) => store.updateNotificationSettings({ companionBubbleOffsetY: v })} />
      </div>

      {/* Group 3: Triggers */}
      <div className={`flex flex-col gap-1 mt-1 ${!store.notificationSettings.companionMode ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 pl-1">
          <MessageSquare size={10} />
          <span>Message Categories</span>
        </div>
        <SelectRow
          label={t('settings.quickPreset')}
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
        <ToggleRow label={t('settings.greetings')} description="Saying hello on launch." value={store.notificationSettings.bobGreetings} onChange={(v) => store.updateNotificationSettings({ bobGreetings: v })} />
        <ToggleRow label={t('settings.jokes')} description="Random funny chatter." value={store.notificationSettings.bobJokes} onChange={(v) => store.updateNotificationSettings({ bobJokes: v })} />
        <ToggleRow label={t('settings.gameplayTips')} description="Game mechanics advice." value={store.notificationSettings.bobTips} onChange={(v) => store.updateNotificationSettings({ bobTips: v })} />
        <ToggleRow label={t('settings.miningWoodcutting')} description="Reacts to hitting ore nodes." value={store.notificationSettings.bobMining} onChange={(v) => store.updateNotificationSettings({ bobMining: v })} />
        <ToggleRow label={t('settings.combatBosses')} description="Reacts when defeating enemies." value={store.notificationSettings.bobCombat} onChange={(v) => store.updateNotificationSettings({ bobCombat: v })} />
        <ToggleRow label={t('settings.gatheringCrafting')} description="Reacts to forestry/herbs." value={store.notificationSettings.bobGathering} onChange={(v) => store.updateNotificationSettings({ bobGathering: v })} />
        <ToggleRow label={t('settings.zoneChanges')} description="Reacts to entering new areas." value={store.notificationSettings.bobZone} onChange={(v) => store.updateNotificationSettings({ bobZone: v })} />
        <ToggleRow label={t('settings.achievements')} description="Celebrates progression." value={store.notificationSettings.bobAchievement} onChange={(v) => store.updateNotificationSettings({ bobAchievement: v })} />
        <ToggleRow label={t('settings.rareLootDrops')} description="Hypes up epic loot drops." value={store.notificationSettings.bobRareDrop} onChange={(v) => store.updateNotificationSettings({ bobRareDrop: v })} />
      </div>
    </div>
  );
};
