const fs = require('fs');
const path = require('path');

const dir = 'src/components/views/settings';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix imports that were messed up by previous script
    content = content.replace(/import \{ useSettingsStore \} from '\.\.\/\.\.\/\.\.\/store\/trackerStore';/g, "import { useSettingsStore } from '../../../store/settingsStore';");
    content = content.replace(/import \{ useTrackerStore \} from '\.\.\/\.\.\/\.\.\/store\/trackerStore';/g, "import { useSettingsStore } from '../../../store/settingsStore';");
    content = content.replace(/useTrackerStore/g, "useSettingsStore");
    
    // TrackingSettings needs trackerStore for clearSession!
    if (file === 'TrackingSettings.tsx') {
      content = "import { useTrackerStore } from '../../../store/trackerStore';\n" + content;
      content = content.replace(/store\.clearSessionCache/g, 'trackerStore.clearSessionCache');
      content = content.replace(/store\.clearSession/g, 'trackerStore.clearSession');
      content = content.replace(/const store = useSettingsStore/g, 'const trackerStore = useTrackerStore();\n  const store = useSettingsStore');
    }

    // NotificationSettings needs trackerStore for notifications?
    // Wait, notifications are in settingsStore! UI Slice!
    // But my previous error said: `Property 'notifications' does not exist on type 'TrackerState'`
    // Because I was importing useSettingsStore from trackerStore!

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
