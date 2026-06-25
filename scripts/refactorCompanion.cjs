const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

const replacements = [
  { search: /BobCompanion/g, replace: 'AICompanion' },
  { search: /BobOverlay/g, replace: 'CompanionOverlay' },
  { search: /BobSettings/g, replace: 'CompanionSettings' },
  { search: /bobTranslations/g, replace: 'companionTranslations' },
  { search: /bobMessages/g, replace: 'companionMessages' },
  { search: /bobPosition/g, replace: 'companionPosition' },
  { search: /setBobPosition/g, replace: 'setCompanionPosition' },
  { search: /bobMode/g, replace: 'companionMode' },
  { search: /bobDuration/g, replace: 'companionDuration' },
  { search: /bobBubbleTheme/g, replace: 'companionBubbleTheme' },
  { search: /bobIconScale/g, replace: 'companionIconScale' },
  { search: /bobTextScale/g, replace: 'companionTextScale' },
  { search: /bobBubbleDistance/g, replace: 'companionBubbleDistance' },
  { search: /bobBubbleOffsetY/g, replace: 'companionBubbleOffsetY' },
  { search: /bobMood/g, replace: 'companionMood' },
  { search: /'settings\.tabs\.bob'/g, replace: "'settings.tabs.companion'" },
  { search: /"settings\.tabs\.bob"/g, replace: '"settings.tabs.companion"' },
  { search: /settings\.tabs\.bob/g, replace: 'settings.tabs.companion' },
  { search: /Bob's Settings/g, replace: "Companion Settings" },
  { search: /Bob's Overlay/g, replace: "Companion Overlay" },
  { search: /placeholder_bob/g, replace: 'placeholder_companion' }
];

const filesToRename = [
  { 
    oldPath: path.join(srcDir, 'components/widgets/BobOverlay.tsx'),
    newPath: path.join(srcDir, 'components/widgets/CompanionOverlay.tsx')
  },
  { 
    oldPath: path.join(srcDir, 'core/companion/BobCompanion.ts'),
    newPath: path.join(srcDir, 'core/companion/AICompanion.ts')
  },
  { 
    oldPath: path.join(srcDir, 'components/views/settings/BobSettings.tsx'),
    newPath: path.join(srcDir, 'components/views/settings/CompanionSettings.tsx')
  },
  { 
    oldPath: path.join(srcDir, 'i18n/bobTranslations.ts'),
    newPath: path.join(srcDir, 'i18n/companionTranslations.ts')
  }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.json')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const req of replacements) {
        if (content.match(req.search)) {
          content = content.replace(req.search, req.replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated content in ${fullPath}`);
      }
    }
  }
}

// First, process content of all files
console.log('Processing file contents...');
processDirectory(srcDir);

// Second, rename the files
console.log('Renaming files...');
for (const req of filesToRename) {
  if (fs.existsSync(req.oldPath)) {
    // If the file exists in the git index, maybe we should just use fs.rename. We'll run it natively.
    fs.renameSync(req.oldPath, req.newPath);
    console.log(`Renamed ${req.oldPath} -> ${req.newPath}`);
  }
}

console.log('Done refactoring!');
