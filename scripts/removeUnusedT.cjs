const fs = require('fs');

['AdvancedSettings.tsx', 'BobSettings.tsx'].forEach(f => {
  let p = 'src/components/views/settings/' + f;
  let t = fs.readFileSync(p, 'utf8');
  // Find "const { t } = useTranslation();" and completely remove it.
  t = t.replace('  const { t } = useTranslation();\n', '');
  
  // Also remove the import so it doesn't complain about unused import
  t = t.replace('import { useTranslation } from \'../../../hooks/useTranslation\';\n', '');

  fs.writeFileSync(p, t);
});
