const fs = require('fs');
const path = require('path');
const dir = 'src/components/views/settings';
fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/=t\(/g, '={t(');
  c = c.replace(/Desc'\)/g, "Desc')}");
  c = c.replace(/Voice'\)/g, "Voice')}");
  c = c.replace(/behavior'\)/g, "behavior')}");
  c = c.replace(/appearance'\)/g, "appearance')}");
  c = c.replace(/personality'\)/g, "personality')}");
  fs.writeFileSync(p, c);
  console.log('Fixed', f);
});
