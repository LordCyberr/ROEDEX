import os

file_path = "src/components/overlay/CompanionGuideOverlay.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    c = f.read()

if "react-i18next" not in c:
    c = c.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { useTranslation } from 'react-i18next';")

if "const { t } = useTranslation();" not in c:
    c = c.replace("const { \n    tutorialStep,", "const { t } = useTranslation();\n  const { \n    tutorialStep,")

# Update duplicate bookmark id
c = c.replace("id: 'tutorial-bookmark', \n    text: \"See your bookmark?", "id: 'tutorial-bookmark-remove', \n    text: \"See your bookmark?")

# Update text usages in jsx
c = c.replace("{currentStepData?.text}", "{currentStepData ? t('tutorial.' + currentStepData.id, currentStepData.text) : ''}")
c = c.replace("MOBS KILLED:", "{t('tutorial.mobs_killed', 'MOBS KILLED:')}")
c = c.replace("Step {tutorialStep} / {steps.length}", "{t('tutorial.step_label', 'Step')} {tutorialStep} / {steps.length}")
c = c.replace(">\\n                    Previous", ">\\n                    {t('tutorial.previous_btn', 'Previous')}")
c = c.replace(">\\n                  Skip", ">\\n                  {t('tutorial.skip_btn', 'Skip')}")
c = c.replace(">\\n                      Next", ">\\n                      {t('tutorial.next_btn', 'Next')}")
c = c.replace("AWAITING INPUT...", "{t('tutorial.awaiting_input', 'AWAITING INPUT...')}")

# Let's also do a fallback for missing values since the user might not translate right away.
# i18next usually returns the key if missing, so the defaultValue handles it if configured.
# Wait, t(key, defaultValue) works in i18next!

with open(file_path, "w", encoding="utf-8") as f:
    f.write(c)

print("Done")
