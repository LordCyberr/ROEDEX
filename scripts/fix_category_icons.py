import re

with open("src/components/views/TrackingView.tsx", "r", encoding="utf-8") as f:
    c = f.read()

c = re.sub(
    r'const addOrUpdate = \([\s\S]*?\) => \{',
    'const addOrUpdate = (\n      zone: string,\n      categoryKey: string,\n      categoryDisplayName: string,\n      name: string,\n      dist: number,\n      pos: Vector2,\n      isAlive: boolean,\n      isTimerInjection: boolean,\n      respawnTimeMs?: number\n    ) => {',
    c
)

c = re.sub(
    r'const groupId = `\$\{zoneDisplay\}_\$\{category\}`;',
    'const groupId = `${zoneDisplay}_${categoryKey}`;',
    c
)

c = re.sub(
    r'title: `\$\{zoneDisplay\} \$\{category\}`,\s*zone: zoneDisplay,\s*category,',
    'title: `${zoneDisplay} ${categoryDisplayName}`,\n          zone: zoneDisplay,\n          category: categoryKey,',
    c
)

c = re.sub(
    r'addOrUpdate\(zone, category, name, dist, pos, isAlive, isTimerInjection, respawnTimeMs\);',
    'addOrUpdate(zone, categoryKey, categoryDisplayName, name, dist, pos, isAlive, isTimerInjection, respawnTimeMs);',
    c
)

c = re.sub(
    r"const catOrderMap: Record<string, number> = \{ 'Mobs': 1, 'Ores': 2, 'Trees': 3, 'Plants': 4 \};",
    "const catOrderMap: Record<string, number> = { 'mobs': 1, 'ores': 2, 'trees': 3, 'plants': 4 };",
    c
)

with open("src/components/views/TrackingView.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("Done")
