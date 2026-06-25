const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const suspiciousLines = [];

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    lines.forEach((line, index) => {
      // Look for text between tags: > Some Text <
      // Or > Some Text {
      // Or } Some Text <
      const matches = line.match(/>([^<{]+)</g) || [];
      const matches2 = line.match(/>([^<]+)\{/g) || [];
      const matches3 = line.match(/\}([^<{]+)</g) || [];
      
      const allMatches = [...matches, ...matches2, ...matches3];
      
      for (let m of allMatches) {
        // clean up the match
        let text = m.replace(/[><{}]/g, '').trim();
        // Ignore single characters, numbers, symbols, etc.
        if (text.length > 1 && /[a-zA-Z]/.test(text) && !text.includes('t(')) {
          // Check if it's not a common ignored string
          if (!['ROEDEX', 'XP', 'HP', 'MP', 'UI', 'HUD', 'OK', 'N/A'].includes(text)) {
            suspiciousLines.push(`${filePath}:${index + 1}: ${text} (Line: ${line.trim()})`);
          }
        }
      }

      // Also look for placeholder="Something" or title="Something"
      const attrMatches = line.match(/(placeholder|title)="([^"]+)"/g) || [];
      for (let m of attrMatches) {
        if (!m.includes('t(')) {
          suspiciousLines.push(`${filePath}:${index + 1}: ${m} (Line: ${line.trim()})`);
        }
      }
    });
  }
});

fs.writeFileSync('untranslated_report.txt', suspiciousLines.join('\n'));
console.log(`Found ${suspiciousLines.length} potentially untranslated lines. Check untranslated_report.txt`);
