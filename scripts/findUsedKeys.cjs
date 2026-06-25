const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.ts') || dirFile.endsWith('.tsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const allFiles = walkSync('src');
const keysUsed = new Set();

const regex = /t\(['"]([a-zA-Z0-9_\.]+)['"]\)/g;

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    keysUsed.add(match[1]);
  }
});

// Now parse translations.ts for the `en:` object
// Since it's a TS file, we can just load it via a crude require if we compile it, or regex.
// Let's regex it to extract the keys.
const transContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// Find the en object:
const enMatch = transContent.match(/en:\s*\{([\s\S]*?)(?=\n\s*[a-z]{2,}:)/);
const definedKeys = new Set();

if (enMatch) {
  // Extract simple property names (ignoring nesting structure for a moment, or we can build the flat list)
  // Actually, translations.ts has nested objects like `tabs: { global: '...' }`
  // We need to parse it properly. Let's use a simpler approach.
  
  // Quick and dirty flat key extractor by counting braces.
}

// Let's just output all used keys so we can see what's being used vs what's in translations.ts
console.log("ALL USED KEYS:");
Array.from(keysUsed).sort().forEach(k => console.log(k));
