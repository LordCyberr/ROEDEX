import json
import re

file_path = "src/i18n/translations.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add categories.respawns
content = re.sub(
    r'("categories": \{[\s\S]*?)("plants": "Plants",\s*)"other": "Other"',
    r'\1\2"respawns": "Respawns",\n      "other": "Other"',
    content
)
content = re.sub(
    r'("categories": \{[\s\S]*?)("plants": "Plantas",\s*)"other": "Otro"',
    r'\1\2"respawns": "Reapariciones",\n      "other": "Otro"',
    content
)
content = re.sub(
    r'("categories": \{[\s\S]*?)("plants": "РАСТЕНИЯ",\s*)"other": "ДРУГОЕ"',
    r'\1\2"respawns": "ВОЗРОЖДЕНИЯ",\n      "other": "ДРУГОЕ"',
    content
)
content = re.sub(
    r'("categories": \{[\s\S]*?)("plants": "식물",\s*)"other": "기타"',
    r'\1\2"respawns": "리스폰",\n      "other": "기타"',
    content
)

# Add ui.toggle
content = re.sub(
    r'("ui": \{[\s\S]*?)("clearData": "Clear Data",)',
    r'\1"toggle": "Toggle",\n      \2',
    content
)
content = re.sub(
    r'("ui": \{[\s\S]*?)("clearData": "Borrar Datos",)',
    r'\1"toggle": "Alternar",\n      \2',
    content
)
content = re.sub(
    r'("ui": \{[\s\S]*?)("clearData": "Очистить Данные",)',
    r'\1"toggle": "Переключить",\n      \2',
    content
)
content = re.sub(
    r'("ui": \{[\s\S]*?)("clearData": "데이터 지우기",)',
    r'\1"toggle": "토글",\n      \2',
    content
)

# Add loot.chestValueTooltip
content = re.sub(
    r'("loot": \{[\s\S]*?)("search": "Search\.\.\.",)',
    r'\1"chestValueTooltip": "Total value of gathered resources in your Backpack (excluding tools)",\n      \2',
    content
)
content = re.sub(
    r'("loot": \{[\s\S]*?)("search": "Buscar\.\.\.",)',
    r'\1"chestValueTooltip": "Valor total de los recursos reunidos en tu mochila (excluyendo herramientas)",\n      \2',
    content
)
content = re.sub(
    r'("loot": \{[\s\S]*?)("search": "Поиск\.\.\.",)',
    r'\1"chestValueTooltip": "Общая стоимость собранных ресурсов в рюкзаке (исключая инструменты)",\n      \2',
    content
)
content = re.sub(
    r'("loot": \{[\s\S]*?)("search": "검색\.\.\.",)',
    r'\1"chestValueTooltip": "배낭에 수집된 자원의 총 가치 (도구 제외)",\n      \2',
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

# Fix TrackingView.tsx
tv_path = "src/components/views/TrackingView.tsx"
with open(tv_path, "r", encoding="utf-8") as f:
    tv = f.read()

tv = tv.replace(
    '<Tooltip content={`Toggle ${zone}`}>',
    '<Tooltip content={`${t(\'ui.toggle\')} ${zone}`}>'
)
tv = tv.replace(
    '<Tooltip content={`Toggle ${cat.category}`}>',
    '<Tooltip content={`${t(\'ui.toggle\')} ${cat.category}`}>'
)

with open(tv_path, "w", encoding="utf-8") as f:
    f.write(tv)

# Fix ChestTab.tsx
ct_path = "src/components/views/loot/ChestTab.tsx"
with open(ct_path, "r", encoding="utf-8") as f:
    ct = f.read()

ct = ct.replace(
    '<Tooltip content="Total value of gathered resources in your Backpack (excluding tools)">',
    '<Tooltip content={t(\'loot.chestValueTooltip\')}>'
)

with open(ct_path, "w", encoding="utf-8") as f:
    f.write(ct)

print("Translations applied successfully.")
