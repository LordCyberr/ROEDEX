import os

file_path = "src/components/overlay/CompanionGuideOverlay.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    c = f.read()

# Replace the text rendering with t(`tutorial.s${tutorialStep}`)
c = c.replace("{currentStepData ? t('tutorial.' + currentStepData.id, currentStepData.text) : ''}", "{currentStepData ? (t(`tutorial.s${tutorialStep}` as any) || currentStepData.text) : ''}")

# Fix the button texts to map to the keys existing in translations.ts
c = c.replace("{t('tutorial.step_label', 'Step')}", "{t('tutorial.step' as any)}")
c = c.replace("{t('tutorial.previous_btn', 'Previous')}", "{t('tutorial.previous' as any)}")
c = c.replace("{t('tutorial.skip_btn', 'Skip')}", "{t('tutorial.skip' as any)}")
c = c.replace("{t('tutorial.next_btn', 'Next')}", "{t('tutorial.next' as any)}")
c = c.replace("{t('tutorial.awaiting_input', 'AWAITING INPUT...')}", "{t('tutorial.awaitingInput' as any)}")
c = c.replace("{t('tutorial.mobs_killed', 'MOBS KILLED:')}", "MOBS KILLED:")

# Also there's a skip tutorial button in the top right
c = c.replace(">\\n          Skip Tutorial", ">\\n          {t('tutorial.skipTutorial' as any)}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(c)

print("Done")
