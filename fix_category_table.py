import re

with open('src/components/ui/CategoryTable.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix GlobalTableHeader
content = content.replace(
    "const tableSettings = useTrackerStore((state) => state.tableSettings);",
    "const tableSettings = useSettingsStore((state: any) => state.tableSettings);"
)

# Fix DataRow
target_datarow = """  const { toggleFavorite, isFav, density, tableSettings, tutorialStep } = useTrackerStore(useShallow((state) => ({
    toggleFavorite: state.toggleFavorite,
    isFav: state.favorites.includes(row.name),
    density: state.displayDensity,
    tableSettings: state.tableSettings,
    tutorialStep: state.notificationSettings.tutorialStep,
  })));"""

replace_datarow = """  const { toggleFavorite, isFav, density, tableSettings, tutorialStep } = useSettingsStore(useShallow((state: any) => ({
    toggleFavorite: state.toggleFavorite,
    isFav: state.favorites.includes(row.name),
    density: state.displayDensity,
    tableSettings: state.tableSettings,
    tutorialStep: state.notificationSettings?.tutorialStep || 0,
  })));"""

if target_datarow in content:
    content = content.replace(target_datarow, replace_datarow)
else:
    print('target_datarow not found')

# Fix CategorySection
target_categorysection = """  const { toggleCategory, collapsed, density } = useTrackerStore(useShallow((state) => ({
    toggleCategory: state.toggleCategory,
    collapsed: state.collapsedCategories[categoryId],
    density: state.displayDensity,
  })));"""

replace_categorysection = """  const { toggleCategory, collapsed, density } = useSettingsStore(useShallow((state: any) => ({
    toggleCategory: state.toggleCategory,
    collapsed: state.collapsedCategories[categoryId],
    density: state.displayDensity,
  })));"""

if target_categorysection in content:
    content = content.replace(target_categorysection, replace_categorysection)
else:
    print('target_categorysection not found')

# Also fix the setHoveredTimerId in TimerDisplay
content = content.replace(
    """onMouseEnter={() => useTrackerStore.getState().setHoveredTimerId('tutorial-timer-row')}""",
    """onMouseEnter={() => useSettingsStore.getState().setHoveredTimerId('tutorial-timer-row')}"""
)
content = content.replace(
    """onMouseLeave={() => useTrackerStore.getState().setHoveredTimerId(null)}""",
    """onMouseLeave={() => useSettingsStore.getState().setHoveredTimerId(null)}"""
)


with open('src/components/ui/CategoryTable.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed CategoryTable.tsx')
