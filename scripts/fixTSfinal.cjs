const fs = require('fs');

let c = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const idx = c.indexOf('export type TranslationKey =');
if (idx !== -1) {
  const replacement = "export type TranslationKey = \n" +
    "  | `tabs.${keyof typeof translations.en.tabs}`\n" +
    "  | `settings.${keyof typeof translations.en.settings}`\n" +
    "  | `columns.${keyof typeof translations.en.columns}`\n" +
    "  | `categories.${keyof typeof translations.en.categories}`\n" +
    "  | `misc.${keyof typeof translations.en.misc}`\n" +
    "  | `npcZones.${keyof typeof translations.en.npcZones}`\n" +
    "  | `npcLocations.${keyof typeof translations.en.npcLocations}`\n" +
    "  | `bootSequence.${keyof typeof translations.en.bootSequence}`\n" +
    "  | `welcome.${keyof typeof translations.en.welcome}`\n" +
    "  | `wizard.${keyof typeof translations.en.wizard}`\n" +
    "  | `loot.${keyof typeof translations.en.loot}`\n" +
    "  | `overlay.${keyof typeof translations.en.overlay}`\n" +
    "  | `about.${keyof typeof translations.en.about}`\n" +
    "  | `debug.${keyof typeof translations.en.debug}`\n" +
    "  | `errors.${keyof typeof translations.en.errors}`\n" +
    "  | `companions.${string}`;\n";
    
  c = c.substring(0, idx) + replacement;
  fs.writeFileSync('src/i18n/translations.ts', c, 'utf8');
  console.log("TranslationKey updated.");
}

// Fix DebugPanel import
let dp = fs.readFileSync('src/components/widgets/DebugPanel.tsx', 'utf8');
if (!dp.includes('import { useTranslation }')) {
  dp = dp.replace("import { Play, Square } from 'lucide-react';", "import { Play, Square } from 'lucide-react';\nimport { useTranslation } from '../../hooks/useTranslation';");
  fs.writeFileSync('src/components/widgets/DebugPanel.tsx', dp, 'utf8');
}
