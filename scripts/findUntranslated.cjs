const fs = require('fs');
const path = require('path');

const walk = (dir, filesList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, filesList);
    } else if (filePath.endsWith('.tsx')) {
      filesList.push(filePath);
    }
  }
  return filesList;
};

const components = walk('src/components');

console.log("Potential untranslated text nodes:");
for (const file of components) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find text nodes: >some text<
  // We want to avoid catching code or expressions like >{var}<
  const textMatches = content.match(/>([^<{}]+)</g);
  
  const untranslated = [];
  if (textMatches) {
    for (const match of textMatches) {
      // Remove > and <
      const text = match.slice(1, -1).trim();
      
      // Filter out empty, just numbers, symbols, or very short strings
      if (text.length > 2 && /[A-Za-z]/.test(text)) {
        // Exclude strings that look like typical non-text or are already handled
        if (!text.includes('px') && !text.includes('rem') && !text.includes('%') && text !== 'RX') {
          untranslated.push(text);
        }
      }
    }
  }

  // Also check for common hardcoded attributes like placeholder="some text", title="some text", label="some text"
  // Exclude those that have `{t(` inside them if they are wrapped in {} (but our regex checks for "..." so it won't have {t() )
  const attrMatches = content.match(/(placeholder|title|label)=\"([^\"]+)\"/g);
  if (attrMatches) {
    for (const match of attrMatches) {
      const val = match.split('="')[1].slice(0, -1);
      if (val.length > 2 && /[A-Za-z]/.test(val)) {
         untranslated.push(`${match.split('=')[0]}="${val}"`);
      }
    }
  }

  if (untranslated.length > 0) {
    // deduplicate
    const unique = [...new Set(untranslated)];
    console.log(`\n--- ${file} ---`);
    console.log(unique.join(' | '));
  }
}
