const fs = require('fs');

let c = fs.readFileSync('src/components/overlay/MinimizedOrb.tsx', 'utf8');

c = c.replace(/export const MinimizedOrb: React.FC[^=]*= \(\{ constraintsRef \}\) => \{/, 'export const MinimizedOrb: React.FC<{ constraintsRef?: any }> = ({ constraintsRef }) => {\n  const { t } = useTranslation();');

c = c.replace(/>\s*Double tap to open\s*<\/div>/, '>{t(\'ui.doubleTapToOpen\')}\n        </div>');

if (!c.includes('useTranslation')) {
    const lines = c.split('\n');
    let lastImport = 0;
    for(let i=0; i<lines.length; i++) if(lines[i].startsWith('import ')) lastImport = i;
    lines.splice(lastImport + 1, 0, "import { useTranslation } from '../../hooks/useTranslation';");
    c = lines.join('\n');
}

fs.writeFileSync('src/components/overlay/MinimizedOrb.tsx', c);
console.log('Fixed MinimizedOrb.tsx');
