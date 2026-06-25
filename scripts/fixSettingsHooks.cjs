const fs = require('fs');
const path = require('path');

const dir = 'src/components/views/settings';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace useTrackerStore with useSettingsStore
    content = content.replace(/import \{ useTrackerStore \} from '\.\.\/\.\.\/\.\.\/store\/trackerStore';/g, "import { useSettingsStore } from '../../../store/settingsStore';");
    content = content.replace(/useTrackerStore/g, "useSettingsStore");
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
