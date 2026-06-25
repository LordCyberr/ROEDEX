const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'AdvancedSettings.tsx',
  'ArmorSettings.tsx',
  'NotificationSettings.tsx',
  'WeaponSettings.tsx'
];

for (const file of filesToPatch) {
  const filePath = path.join('src/components/views/settings', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('useTranslation')) {
    content = content.replace(
      "import React", 
      "import React from 'react';\nimport { useTranslation } from '../../../hooks/useTranslation';\n// import React"
    );
    
    // Replace the component definition to inject const { t } = useTranslation();
    const componentRegex = /export const [A-Za-z]+: React\.FC = \(\) => {/;
    content = content.replace(componentRegex, (match) => {
      return `${match}\n  const { t } = useTranslation();`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Injected useTranslation into ${file}`);
  }
}
