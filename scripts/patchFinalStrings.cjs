const fs = require('fs');

async function translateText(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const json = await res.json();
    return json[0].map(x => x[0]).join('');
  } catch (e) {
    return text;
  }
}

async function run() {
  let tsContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');
  const typeIndex = tsContent.indexOf('export type TranslationKey');
  const typesCode = tsContent.substring(typeIndex);
  let objCode = tsContent.substring(0, typeIndex).replace('export const translations =', 'return').replace(/as const;/g, '');
  const translations = new Function(objCode)();

  const finalStrings = {
    focusHighlight: {
      minimalHud: 'Minimal HUD Setup',
      dragBackpack: 'Drag the Backpack Value',
      placeBackpack: 'and place it above your inventory on the left side.',
      dragChest: 'Drag the Chest Value',
      placeChest: 'and place it above the house chest on the right side.',
      dragRedX: "Drag the Red 'X' Zone",
      placeRedX: "directly over the game's X button. Click it to close the chest!"
    },
    lifetimeStats: {
      title: 'Lifetime Statistics',
      noRecords: 'No records found.'
    },
    overlayContainer: {
      poppedOut: 'This tab is popped out'
    },
    wizard: {
      step: 'Setup Wizard - Step',
      of: 'of',
      useThe: 'Use the',
      toNavigate: 'to navigate between modules.',
      toggleThe: 'Toggle the',
      toEnable: 'to enable or disable click-through mode.',
      your: 'Your',
      willPopUp: 'will pop up to guide you through specific menus.'
    },
    sessionTab: {
      finishRun: 'Finish Run',
      startNewRun: 'Start New Run',
      totalWorth: 'Total Worth'
    },
    errorBoundary: {
      componentCrashed: 'Component Crashed'
    }
  };

  const en = translations.en;
  const es = translations.es || {};
  const ru = translations.ru || {};
  const ko = translations.ko || {};

  for (const [category, strings] of Object.entries(finalStrings)) {
    if (!en[category]) en[category] = {};
    if (!es[category]) es[category] = {};
    if (!ru[category]) ru[category] = {};
    if (!ko[category]) ko[category] = {};

    for (const [key, text] of Object.entries(strings)) {
      en[category][key] = text;
      es[category][key] = await translateText(text, 'es');
      ru[category][key] = await translateText(text, 'ru');
      ko[category][key] = await translateText(text, 'ko');
      await new Promise(r => setTimeout(r, 150));
    }
  }

  const newObjCode = `export const translations = ${JSON.stringify({en, es, ru, ko}, null, 2)} as const;\n\n`;
  fs.writeFileSync('src/i18n/translations.ts', newObjCode + typesCode);

  // FocusHighlight.tsx
  let fh = fs.readFileSync('src/components/overlay/FocusHighlight.tsx', 'utf8');
  if (!fh.includes('useTranslation')) {
    fh = fh.replace("import React from 'react';", "import React from 'react';\nimport { useTranslation } from '../../hooks/useTranslation';");
  }
  fh = fh.replace('export const FocusHighlight: React.FC = () => {', 'export const FocusHighlight: React.FC = () => {\n  const { t } = useTranslation();');
  fh = fh.replace('Minimal HUD Setup', "{t('focusHighlight.minimalHud')}");
  fh = fh.replace('Drag the Backpack Value', "{t('focusHighlight.dragBackpack')}");
  fh = fh.replace('and place it above your inventory on the left side.', "{t('focusHighlight.placeBackpack')}");
  fh = fh.replace('Drag the Chest Value', "{t('focusHighlight.dragChest')}");
  fh = fh.replace('and place it above the house chest on the right side.', "{t('focusHighlight.placeChest')}");
  fh = fh.replace("Drag the Red 'X' Zone", "{t('focusHighlight.dragRedX')}");
  fh = fh.replace("directly over the game's X button. Click it to close the chest!", "{t('focusHighlight.placeRedX')}");
  fs.writeFileSync('src/components/overlay/FocusHighlight.tsx', fh, 'utf8');

  // LifetimeStatsWindow.tsx
  let lsw = fs.readFileSync('src/components/overlay/LifetimeStatsWindow.tsx', 'utf8');
  if (!lsw.includes('useTranslation')) {
    lsw = lsw.replace("import { Search, Trophy, History } from 'lucide-react';", "import { Search, Trophy, History } from 'lucide-react';\nimport { useTranslation } from '../../hooks/useTranslation';");
  }
  if (!lsw.includes('const { t } = useTranslation();')) {
    lsw = lsw.replace("const [searchQuery, setSearchQuery] = useState('');", "const { t } = useTranslation();\n  const [searchQuery, setSearchQuery] = useState('');");
  }
  lsw = lsw.replace('>Lifetime Statistics<', ">{t('lifetimeStats.title')}<");
  lsw = lsw.replace('>No records found.<', ">{t('lifetimeStats.noRecords')}<");
  fs.writeFileSync('src/components/overlay/LifetimeStatsWindow.tsx', lsw, 'utf8');

  // OverlayContainer.tsx
  let oc = fs.readFileSync('src/components/overlay/OverlayContainer.tsx', 'utf8');
  if (!oc.includes('useTranslation')) {
    oc = oc.replace("import { useTrackingOverlaySettings } from '../../hooks/useTrackingOverlaySettings';", "import { useTrackingOverlaySettings } from '../../hooks/useTrackingOverlaySettings';\nimport { useTranslation } from '../../hooks/useTranslation';");
  }
  if (!oc.includes('const { t } = useTranslation();')) {
    oc = oc.replace('const OverlayContent = memo(({ isCompact }: { isCompact: boolean }) => {', "const OverlayContent = memo(({ isCompact }: { isCompact: boolean }) => {\n  const { t } = useTranslation();");
  }
  oc = oc.replace('>This tab is popped out<', ">{t('overlayContainer.poppedOut')}<");
  fs.writeFileSync('src/components/overlay/OverlayContainer.tsx', oc, 'utf8');

  // FirstTimeWizard.tsx
  let ftw = fs.readFileSync('src/components/ui/FirstTimeWizard.tsx', 'utf8');
  if (!ftw.includes('useTranslation')) {
    ftw = ftw.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { useTranslation } from '../../hooks/useTranslation';");
  }
  if (!ftw.includes('const { t } = useTranslation();')) {
    ftw = ftw.replace('export const FirstTimeWizard = () => {', "export const FirstTimeWizard = () => {\n  const { t } = useTranslation();");
  }
  ftw = ftw.replace('Setup Wizard - Step {step} of 3', "{t('wizard.step')} {step} {t('wizard.of')} 3");
  ftw = ftw.replace('Use the', "{t('wizard.useThe')}");
  ftw = ftw.replace('to navigate between modules.', "{t('wizard.toNavigate')}");
  ftw = ftw.replace('Toggle the', "{t('wizard.toggleThe')}");
  ftw = ftw.replace('to enable or disable click-through mode.', "{t('wizard.toEnable')}");
  ftw = ftw.replace('Your', "{t('wizard.your')}");
  ftw = ftw.replace('will pop up to guide you through specific menus.', "{t('wizard.willPopUp')}");
  fs.writeFileSync('src/components/ui/FirstTimeWizard.tsx', ftw, 'utf8');

  // SessionTab.tsx
  let st = fs.readFileSync('src/components/views/loot/SessionTab.tsx', 'utf8');
  if (!st.includes('useTranslation')) {
    st = st.replace("import { Play, Square, Diamond } from 'lucide-react';", "import { Play, Square, Diamond } from 'lucide-react';\nimport { useTranslation } from '../../../hooks/useTranslation';");
  }
  if (!st.includes('const { t } = useTranslation();')) {
    st = st.replace('export const SessionTab: React.FC<{ isHorizontal: boolean; compactHeightClass: string }> = ({ isHorizontal, compactHeightClass }) => {', "export const SessionTab: React.FC<{ isHorizontal: boolean; compactHeightClass: string }> = ({ isHorizontal, compactHeightClass }) => {\n  const { t } = useTranslation();");
  }
  st = st.replace('> Finish Run<', "> {t('sessionTab.finishRun')}<");
  st = st.replace('> Start New Run<', "> {t('sessionTab.startNewRun')}<");
  st = st.replace('> Total Worth<', "> {t('sessionTab.totalWorth')}<");
  fs.writeFileSync('src/components/views/loot/SessionTab.tsx', st, 'utf8');

  // ErrorBoundary.tsx
  let eb = fs.readFileSync('src/components/widgets/ErrorBoundary.tsx', 'utf8');
  eb = eb.replace('Component Crashed', "{translations.en.errorBoundary.componentCrashed}");
  if (!eb.includes('import { translations }')) {
    eb = eb.replace("import React, { Component, ErrorInfo, ReactNode } from 'react';", "import React, { Component, ErrorInfo, ReactNode } from 'react';\nimport { translations } from '../../i18n/translations';");
  }
  fs.writeFileSync('src/components/widgets/ErrorBoundary.tsx', eb, 'utf8');

  console.log('Finished translating final strings!');
}

run();
