const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'c:\\Users\\Administrator\\Desktop\\ROEDEX\\src\\i18n\\companionTranslations.ts',
  'c:\\Users\\Administrator\\Desktop\\ROEDEX\\src\\core\\companion\\BobCompanion.ts'
];

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace Philbert -> Filburt
    content = content.replace(/Philbert/g, 'Filburt');
    // Replace philbert -> filburt
    content = content.replace(/philbert/g, 'filburt');
    // Replace PHILBERT -> FILBURT
    content = content.replace(/PHILBERT/g, 'FILBURT');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
