const fs = require('fs');

// Fix TrackingSettings.tsx
let tsFile = fs.readFileSync('src/components/views/settings/TrackingSettings.tsx', 'utf8');
tsFile = tsFile.replace(/import \{ useSettingsStore \} from '\.\.\/\.\.\/\.\.\/store\/trackerStore';/g, "import { useSettingsStore } from '../../../store/settingsStore';");
tsFile = tsFile.replace(/import \{ useTrackerStore \} from '\.\.\/\.\.\/\.\.\/store\/trackerStore';/g, "import { useSettingsStore } from '../../../store/settingsStore';\nimport { useTrackerStore } from '../../../store/trackerStore';");
tsFile = tsFile.replace(/const store = useTrackerStore\(useShallow/g, 'const trackerStore = useTrackerStore();\n  const store = useSettingsStore(useShallow');
tsFile = tsFile.replace(/clearSessionCache: state\.clearSessionCache,\s*/g, '');
tsFile = tsFile.replace(/clearSession: state\.clearSession,\s*/g, '');
tsFile = tsFile.replace(/store\.clearSession/g, 'trackerStore.clearSession');
fs.writeFileSync('src/components/views/settings/TrackingSettings.tsx', tsFile);

// Fix CompanionSettings.tsx
let csFile = fs.readFileSync('src/components/views/settings/CompanionSettings.tsx', 'utf8');
csFile = csFile.replace(/"settings\.bobEnableDesc"/g, "'settings.descCompanion'"); 
fs.writeFileSync('src/components/views/settings/CompanionSettings.tsx', csFile);

// Fix ChangelogModal.tsx
let clFile = fs.readFileSync('src/components/ui/ChangelogModal.tsx', 'utf8');
clFile = clFile.replace(/import \{ useTrackerStore \} from '\.\.\/\.\.\/store\/trackerStore';/, "import { useSettingsStore } from '../../store/settingsStore';");
clFile = clFile.replace(/useTrackerStore/g, 'useSettingsStore');
fs.writeFileSync('src/components/ui/ChangelogModal.tsx', clFile);

console.log("Fixed tracking, companion, and changelog components.");
