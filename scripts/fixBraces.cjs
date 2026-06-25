const fs = require('fs');
const path = require('path');
const dir = 'src/components/views/settings';
fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  let originalContent = c;
  c = c.replace(/\}\}<\/div>/g, '}</div>');
  c = c.replace(/\}\}<\/p>/g, '}</p>');
  c = c.replace(/\}\}<\/span>/g, '}</span>');
  if (c !== originalContent) {
    fs.writeFileSync(p, c);
    console.log('Fixed braces in', f);
  }
});
