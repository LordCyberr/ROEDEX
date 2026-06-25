import os

file_path = "src/components/overlay/CompanionGuideOverlay.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix import
content = content.replace(
    "import { useSettingsStore } from '../../store/trackerStore';",
    "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
)

# Fix other properties that actually belong to useTrackerStore
content = content.replace("useSettingsStore(state => state.sessionPlayerName)", "useTrackerStore(state => state.sessionPlayerName)")
content = content.replace("useSettingsStore(state => state.playerProfile?.name)", "useTrackerStore(state => state.playerProfile?.name)")
content = content.replace("useSettingsStore(state => state.currentZone)", "useTrackerStore(state => state.currentZone)")
content = content.replace("useSettingsStore.getState().sessionPlayerName", "useTrackerStore.getState().sessionPlayerName")
content = content.replace("useSettingsStore.getState().playerProfile", "useTrackerStore.getState().playerProfile")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done fixing stores.")
