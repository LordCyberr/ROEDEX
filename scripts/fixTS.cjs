const fs = require('fs');

let tContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');

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

tContent = tContent.replace(/export type TranslationKey =[\s\S]+?welcome`\};?/, replacement);

fs.writeFileSync('src/i18n/translations.ts', tContent, 'utf8');

const filesToFix = [
  'src/components/views/loot/ChestTab.tsx',
  'src/components/views/loot/ProfileTab.tsx',
  'src/components/views/loot/SessionTab.tsx'
];

filesToFix.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/import \{ useTranslation \} from '\.\.\/\.\.\/hooks\/useTranslation';/g, "import { useTranslation } from '../../../hooks/useTranslation';");
  fs.writeFileSync(f, c, 'utf8');
});

// Fix DebugPanel and LootView 't' unused or missing
let dp = fs.readFileSync('src/components/widgets/DebugPanel.tsx', 'utf8');
if (!dp.includes('const { t } = useTranslation()')) {
  dp = dp.replace("export const DebugPanel = () => {", "export const DebugPanel = () => {\n  const { t } = useTranslation();");
  dp = dp.replace("export const DebugPanel: React.FC = () => {", "export const DebugPanel: React.FC = () => {\n  const { t } = useTranslation();");
}
fs.writeFileSync('src/components/widgets/DebugPanel.tsx', dp, 'utf8');

let lv = fs.readFileSync('src/components/views/LootView.tsx', 'utf8');
if (!lv.includes('t(')) {
  lv = lv.replace('const { t } = useTranslation();', ''); // remove unused
}
fs.writeFileSync('src/components/views/LootView.tsx', lv, 'utf8');

let eb = fs.readFileSync('src/components/widgets/ErrorBoundary.tsx', 'utf8');
eb = eb.replace("import { useTranslation } from '../../hooks/useTranslation';", "");
eb = eb.replace(">{t('errors.componentCrashed')}<", ">Component Crashed<");
eb = eb.replace(">{t('errors.tryAgain')}<", ">Try Again<");
fs.writeFileSync('src/components/widgets/ErrorBoundary.tsx', eb, 'utf8');
