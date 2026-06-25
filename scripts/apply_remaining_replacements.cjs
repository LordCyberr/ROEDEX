const fs = require('fs');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Add import if needed
    if (!content.includes('useTranslation')) {
        // Find last import
        const lines = content.split('\n');
        let lastImportIdx = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                lastImportIdx = i;
            }
        }
        lines.splice(lastImportIdx + 1, 0, "import { useTranslation } from '../../hooks/useTranslation';");
        content = lines.join('\n');
    }

    // Add const { t } = useTranslation(); if needed
    if (!content.includes('const { t } = useTranslation();')) {
        const componentMatch = content.match(/export const [A-Za-z0-9_]+: React\.FC[^=]*=\s*(?:\([^)]*\)\s*)?=>\s*\{/);
        if (componentMatch) {
            content = content.replace(componentMatch[0], componentMatch[0] + "\n  const { t } = useTranslation();");
        } else {
            const funcMatch = content.match(/export function [A-Za-z0-9_]+\([^)]*\)\s*\{/);
            if (funcMatch) {
                content = content.replace(funcMatch[0], funcMatch[0] + "\n  const { t } = useTranslation();");
            } else {
                const constMatch = content.match(/const [A-Za-z0-9_]+ = \([^)]*\)\s*=>\s*\{/);
                if (constMatch) {
                   content = content.replace(constMatch[0], constMatch[0] + "\n  const { t } = useTranslation();");
                }
            }
        }
    }

    replacements.forEach(r => {
        content = content.replace(r.search, r.replace);
    });
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Updated: ' + filePath);
    } else {
        console.log('No changes needed or matched: ' + filePath);
    }
}

replaceInFile('src/components/overlay/CompanionGuideOverlay.tsx', [
    { search: />\s*Restart Intro\s*<\/button>/g, replace: ">{t('wizard.restartIntro')}</button>" }
]);

replaceInFile('src/components/overlay/FocusHighlight.tsx', [
    { search: />\s*Got it, I'm ready!\s*<\/button>/g, replace: ">{t('wizard.gotIt')}</button>" }
]);

replaceInFile('src/components/views/settings/TrackingSettings.tsx', [
    { search: />\s*Reset HUD Tutorial\s*<\/button>/g, replace: ">{t('settingsGroup.resetHudTutorial')}</button>" }
]);

replaceInFile('src/components/ui/ChangelogModal.tsx', [
    { search: />✨<\/span>\s*What's New\s*<\/h2>/g, replace: ">✨</span> {t('ui.whatsNew')}\n              </h2>" }
]);

replaceInFile('src/components/overlay/OverlayContainer.tsx', [
    { search: />\s*Merge Back\s*<\/button>/g, replace: ">{t('ui.mergeBack')}\n          </button>" }
]);
