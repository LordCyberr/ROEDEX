import sys
import re

file_path = 'src/components/views/SettingsView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add useTranslation
content = re.sub(
    r"(import \{ useShallow \} from 'zustand/react/shallow';)",
    r"\1\nimport { useTranslation } from '../../hooks/useTranslation';",
    content
)

content = re.sub(
    r"(export const SettingsView: React\.FC = \(\) => \{\n  const store =)",
    r"export const SettingsView: React.FC = () => {\n  const { t } = useTranslation();\n  const store =",
    content
)

replacements = [
    (r"title: 'General',", r"title: t('settings.general'),"),
    (r"<SelectRow \n            label=\"UI Theme\"", r"<SelectRow \n            label={t('settings.language')} \n            value={store.language} \n            options={[\n              {label: 'English', value: 'en'},\n              {label: 'Español', value: 'es'},\n              {label: 'Русский', value: 'ru'},\n              {label: '한국어', value: 'ko'}\n            ]} \n            onChange={(v) => store.setLanguage(v as any)} \n          />\n          <SelectRow \n            label={t('settings.uiTheme')}"),
    (r"label=\"Display Density\"", r"label={t('settings.displayDensity')}"),
    (r"label=\"Vertical Layout\"", r"label={t('settings.verticalLayout')}"),
    (r"label=\"Active Opacity\"", r"label={t('settings.activeOpacity')}"),
    (r"label=\"Idle Opacity\"", r"label={t('settings.idleOpacity')}"),
    (r"label=\"Minimized Orb Size\"", r"label={t('settings.minimizedOrbSize')}"),
    (r"label=\"Minimized Icon\"", r"label={t('settings.minimizedIcon')}"),
    (r"title: 'Tracking & Data',", r"title: t('settings.trackingData'),"),
    (r"label=\"Display Mode\"", r"label={t('settings.displayMode')}"),
    (r">Session view retains all discovered data continuously until manually reset\.<", r">{t('settings.sessionViewDesc')}<"),
    (r">TRACKER COLUMNS<", r">{t('settings.trackerColumns')}<"),
    (r"label=\"Show Distance\"", r"label={t('settings.showDistance')}"),
    (r"label=\"Show Alive / Dead Count\"", r"label={t('settings.showCount')}"),
    (r"label=\"Show Respawn Timer\"", r"label={t('settings.showTimer')}"),
    (r">DATA MANAGEMENT<", r">{t('settings.dataManagement')}<"),
    (r">\n\s*Clear Session Cache\n\s*</button>", r">\n            {t('settings.clearSessionCache')}\n          </button>"),
    (r">\n\s*Reset Loot Session\n\s*</button>", r">\n            {t('settings.resetLootSession')}\n          </button>"),
    (r"title: 'Weapon Overlay',", r"title: t('settings.weaponOverlay'),"),
    (r"title: 'Armor Overlay',", r"title: t('settings.armorOverlay'),"),
    (r"title: 'UI Notifications',", r"title: t('settings.uiNotifications'),"),
    (r"title: 'Bob Companion',", r"title: t('settings.bobCompanion'),"),
    (r"title: 'Advanced',", r"title: t('settings.advanced'),"),
    (r"<AccordionSection key=\{s\.id\} title=\{s\.title\} icon=\{s\.icon\} defaultOpen=\{s\.id === 'general'\}?", r"<AccordionSection key={s.id} title={s.title} icon={s.icon} defaultOpen={false}>"),
    (r"pb-8 px-1 pt-1 w-full", r"pb-1 px-1 pt-1 w-[260px]")
]

for old, new_r in replacements:
    content = re.sub(old, new_r, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied successfully")
