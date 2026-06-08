import sys
import re

file_path = 'src/components/views/LootView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r"(import \{ useShallow \} from 'zustand/react/shallow';)",
    r"\1\nimport { useTranslation } from '../../hooks/useTranslation';",
    content
)

content = re.sub(
    r"(export const LootView: React\.FC = \(\) => \{\n  const \{)",
    r"export const LootView: React.FC = () => {\n  const { t } = useTranslation();\n  const {",
    content
)

replacements = [
    (r"Finish Run", r"{t('misc.finishRun')}"),
    (r"Start New Run", r"{t('misc.startNewRun')}"),
    (r"Runes/Hr", r"{t('misc.runesHr')}"),
    (r"Worth/Hr", r"{t('misc.worthHr')}"),
    (r"TOTAL SESSION WORTH", r"{t('misc.totalSessionWorth')}"),
    (r"RUNES MINED", r"{t('misc.runesMined')}"),
    (r"ITEMS LOOTED", r"{t('misc.itemsLooted')}"),
    (r"Loot Tracker & Runs", r"{t('tabs.lootTracker')}"),
    (r"Dashboard", r"{t('tabs.dashboard')}"),
    (r"Ledger", r"{t('tabs.ledger')}"),
    (r"Runs", r"{t('tabs.runs')}"),
    (r"Settings", r"{t('settings.general')}"),
    (r"Search loot...", r"{t('misc.searchLoot')}"),
    (r"No loot found in this session", r"{t('misc.noLoot')}"),
    (r"Clear History", r"{t('misc.clearHistory')}"),
    (r"No past runs recorded", r"{t('misc.noPastRuns')}"),
    (r"Duration", r"{t('misc.duration')}"),
    (r"Time Attack Goal", r"{t('settings.timeAttackGoal')}"),
    (r"Target Value Goal", r"{t('settings.targetValueGoal')}"),
    (r"Include Item Value", r"{t('settings.includeItemValue')}"),
    (r"Item", r"{t('columns.item')}"),
    (r"Qty", r"{t('columns.qty')}"),
    (r"Value", r"{t('columns.value')}")
]

for old, new_r in replacements:
    content = re.sub(old, new_r, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied successfully")
