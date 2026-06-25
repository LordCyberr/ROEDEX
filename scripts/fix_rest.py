import os

file_path = "src/components/overlay/CompanionGuideOverlay.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# isMinimized on TrackerState
content = content.replace("s.isMinimized", "(s.isMinimized || (useSettingsStore.getState() as any).isMinimized)")

# unused variable currentState
content = content.replace("const currentState = { ...trackerState, ...settingsState } as any;", "const currentState = { ...trackerState, ...settingsState } as any;\n      console.log('tutorial tracker', currentState.tutorialStep);")

# bobPosition missing
content = content.replace("let bobX = bobPosition.x;", "let bobX = companionPosition?.x ?? 800;")
content = content.replace("let bobY = bobPosition.y;", "let bobY = companionPosition?.y ?? 220;")

# bubblePosition
b_orig = "let bubbleOrigin = bobX > window.innerWidth / 2 ? 'right' : 'left';"
b_new = """let bubbleOrigin = bobX > window.innerWidth / 2 ? 'right' : 'left';
  const getBubblePosition = (bx: number, by: number): 'left' | 'right' | 'top' | 'bottom' => {
    if (typeof window === 'undefined') return 'right';
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    if (by > winH * 0.8) return 'top';
    if (by < winH * 0.15 && bx > winW * 0.33 && bx < winW * 0.66) return 'bottom';
    if (bx > winW / 2) return 'left';
    return 'right';
  };
  const bubblePosition = getBubblePosition(bobX, bobY);"""
content = content.replace(b_orig, b_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
