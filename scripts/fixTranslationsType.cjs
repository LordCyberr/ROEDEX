const fs = require('fs');
let c = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const regex = /export type TranslationKey =[\s\S]+?welcome`};/;
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
  "  | `companions.${string}`;";

c = c.replace(regex, replacement);

fs.writeFileSync('src/i18n/translations.ts', c, 'utf8');
console.log("TranslationKey updated.");
