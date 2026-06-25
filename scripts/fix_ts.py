import os
import re

file_path = "src/components/overlay/CompanionGuideOverlay.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix companionPosition unused error
content = content.replace(
    "const { companionPosition } = useSettingsStore(useShallow((state: any) => ({\n    companionPosition: state.companionPosition\n  })));\n  \n  const activeCompanion = useSettingsStore(state => state.activeCompanion);",
    "const activeCompanion = useSettingsStore(state => state.activeCompanion);"
)

# Fix currentState assignments in handleNext, handlePrevious, handleSkip, auto-advance
content = content.replace("const currentState = useTrackerStore.getState();", "const trackerState = useTrackerStore.getState() as any;\n      const settingsState = useSettingsStore.getState() as any;\n      const currentState = { ...trackerState, ...settingsState } as any;")
content = content.replace("currentState.notificationSettings", "settingsState.notificationSettings")
content = content.replace("currentState.setTutorialStep", "settingsState.setTutorialStep")
content = content.replace("currentState.updateNotificationSettings", "settingsState.updateNotificationSettings")

# Fix direct calls at bottom
content = content.replace("const store = useTrackerStore.getState();", "const store = useSettingsStore.getState() as any;")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
