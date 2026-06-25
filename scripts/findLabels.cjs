const fs = require('fs');
const path = require('path');

const dir = 'src/components/views/settings/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const matches = content.match(/label=\"[^\"]+\"/g) || [];
  const textNodes = content.match(/>[^<]+<\/div>/g) || [];
  console.log('--- ' + file + ' ---');
  console.log(matches.join(', '));
  // console.log(textNodes.filter(t => t.length > 5).join(', '));
}
