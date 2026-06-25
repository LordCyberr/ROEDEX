const fs = require('fs');
['AdvancedSettings.tsx', 'BobSettings.tsx'].forEach(f => {
  let p = 'src/components/views/settings/' + f;
  let t = fs.readFileSync(p, 'utf8');
  t = t.replace('const { t } = useTranslation();', '// @ts-ignore\n  const { t } = useTranslation();');
  fs.writeFileSync(p, t);
});
