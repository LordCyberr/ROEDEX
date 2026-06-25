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
            }
        }
    }

    replacements.forEach(r => {
        content = content.replace(r.search, r.replace);
    });
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Updated: ' + filePath);
    }
}

// 1. Header.tsx
replaceInFile('src/components/layout/Header.tsx', [
    { search: /content="Merge All Popped-Out Tabs"/g, replace: "content={t('ui.mergeTabs')}" }
]);

// 2. SidebarNav.tsx
replaceInFile('src/components/layout/SidebarNav.tsx', [
    { search: /content="Toggle Layout"/g, replace: "content={t('ui.toggleLayout')}" },
    { search: /content="Settings"/g, replace: "content={t('ui.settings')}" }
]);

// 3. PoppedOutWindowComponent.tsx
replaceInFile('src/components/overlay/PoppedOutWindowComponent.tsx', [
    { search: /content="Reset Size"/g, replace: "content={t('ui.resetSize')}" }
]);

// 4. OverlayContainer.tsx
replaceInFile('src/components/overlay/OverlayContainer.tsx', [
    { search: />Merge Back</g, replace: ">{t('ui.mergeBack')}<" }
]);

// 5. MinimizedOrb.tsx
replaceInFile('src/components/overlay/MinimizedOrb.tsx', [
    { search: />Double tap to open</g, replace: ">{t('ui.doubleTapToOpen')}<" }
]);

// 6. ChestTab.tsx
replaceInFile('src/components/views/loot/ChestTab.tsx', [
    { search: /content="Total value of all items stored in your House Chest"/g, replace: "content={t('chestTab.totalValueDesc')}" },
    { search: /content="Include your current Runes balance in the 'Total Worth' calculation"/g, replace: "content={t('chestTab.includeRunesDesc')}" },
    { search: /content="Total Value"/g, replace: "content={t('chestTab.totalValue')}" }
]);

// 7. LootView.tsx
replaceInFile('src/components/views/LootView.tsx', [
    { search: /'Profile'/g, replace: "t('ui.profile')" },
    { search: /'Session'/g, replace: "t('ui.session')" },
    { search: /'Chest'/g, replace: "t('ui.chest')" },
    { search: /content="Pop out Profile tab"/g, replace: "content={`${t('ui.popOutTab')} - ${t('ui.profile')}`}" },
    { search: /content="Pop out Session tab"/g, replace: "content={`${t('ui.popOutTab')} - ${t('ui.session')}`}" },
    { search: /content="Pop out Chest tab"/g, replace: "content={`${t('ui.popOutTab')} - ${t('ui.chest')}`}" }
]);

// 8. AboutSettings.tsx
replaceInFile('src/components/views/settings/AboutSettings.tsx', [
    { search: /title="Copy Address"/g, replace: "title={t('ui.copyAddress')}" }
]);

// 9. CompanionSettings.tsx
replaceInFile('src/components/views/settings/CompanionSettings.tsx', [
    { search: /title="Preview & Setup"/g, replace: "title={t('settingsGroup.previewAndSetup')}" },
    { search: /title="Appearance"/g, replace: "title={t('settingsGroup.appearance')}" },
    { search: /title="Behavior"/g, replace: "title={t('settingsGroup.behavior')}" },
    { search: /title="Positioning"/g, replace: "title={t('settingsGroup.positioning')}" },
    { search: /title="Message Categories"/g, replace: "title={t('settingsGroup.messageCategories')}" },
    { search: />Replay Onboarding Tutorial</g, replace: ">{t('settingsGroup.replayTutorial')}<" }
]);

// 10. TrackingSettings.tsx
replaceInFile('src/components/views/settings/TrackingSettings.tsx', [
    { search: />Reset HUD Tutorial</g, replace: ">{t('settingsGroup.resetHudTutorial')}<" }
]);

// 11. DebugPanel.tsx
replaceInFile('src/components/widgets/DebugPanel.tsx', [
    { search: /content="Average duration to parse a WebSocket event"/g, replace: "content={t('debug.avgParseDuration')}" },
    { search: /content="Max spike duration in parse processing"/g, replace: "content={t('debug.maxSpikeDuration')}" },
    { search: /content="Average duration for main overlay React render"/g, replace: "content={t('debug.avgRenderDuration')}" },
    { search: /content="Export safe overlay diagnostics \(no personal data\) to JSON"/g, replace: "content={t('debug.exportDiagnostics')}" },
    { search: /content="Wipes ALL extension data including settings and trackers. Only click if experiencing severe bugs."/g, replace: "content={t('debug.wipeDataWarning')}" }
]);

// 12. ChangelogModal.tsx
replaceInFile('src/components/ui/ChangelogModal.tsx', [
    { search: />What's New</g, replace: ">{t('ui.whatsNew')}<" }
]);

// 13. ErrorBoundary.tsx
let ebContent = fs.readFileSync('src/components/widgets/ErrorBoundary.tsx', 'utf8');
ebContent = ebContent.replace(/>Try Again</g, ">{this.props.t ? this.props.t('ui.tryAgain') : 'Try Again'}<");
fs.writeFileSync('src/components/widgets/ErrorBoundary.tsx', ebContent);
console.log('Updated: src/components/widgets/ErrorBoundary.tsx');

// 14. CompanionGuideOverlay.tsx
replaceInFile('src/components/overlay/CompanionGuideOverlay.tsx', [
    { search: />Restart Intro</g, replace: ">{t('wizard.restartIntro')}<" }
]);

// 15. FocusHighlight.tsx
replaceInFile('src/components/overlay/FocusHighlight.tsx', [
    { search: />Got it, I'm ready!</g, replace: ">{t('wizard.gotIt')}<" }
]);

// 16. IntroPrompt.tsx
replaceInFile('src/components/overlay/IntroPrompt.tsx', [
    { search: />\s*Welcome to ROEDEX, your premium AI companion overlay. The system is fully synced and ready to boot. Would you like to initialize the onboarding sequence to explore your new toolkit\?\s*</g, replace: ">{t('wizard.welcomeMessage')}<" }
]);
