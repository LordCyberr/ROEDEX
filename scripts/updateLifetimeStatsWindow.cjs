const fs = require('fs');
let text = fs.readFileSync('src/components/overlay/LifetimeStatsWindow.tsx', 'utf8');

text = text.replace("useState<'combat' | 'mining' | 'logging' | 'plants' | 'mob drops'>('combat');", "useState<'combat' | 'mining' | 'logging' | 'plants' | 'mobDrops'>('combat');");
text = text.replace("'mob drops': { icon: Package", "mobDrops: { icon: Package");
text = text.replace(">{cat}\n                  </span>", ">{t(`stats.${cat}` as any)}\n                  </span>");
text = text.replace('placeholder="Search entries..."', "placeholder={t('stats.searchEntries') as string}");

fs.writeFileSync('src/components/overlay/LifetimeStatsWindow.tsx', text);
console.log('LifetimeStatsWindow updated.');
