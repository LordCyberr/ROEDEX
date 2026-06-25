const fs = require('fs');
const path = require('path');

const uiSliceProps = new Set([
  'isChangelogOpen', 'setIsChangelogOpen', 'isDebugPanelOpen', 'toggleDebugPanel', 'debugStats', 'updateDebugStats',
  'profilerMetrics', 'updateProfilerMetrics', 'activeCompanion', 'setActiveCompanion', 'poppedOutWindows', 'popOutTab',
  'mergeTab', 'mergeAllTabs', 'updatePoppedOutWindow', 'currentNpcDialogue', 'setCurrentNpcDialogue', 'language',
  'setLanguage', 'firstTimeWizardCompleted', 'setFirstTimeWizardCompleted', 'isLifetimeStatsOpen', 'setIsLifetimeStatsOpen',
  'isRunHistoryOpen', 'setIsRunHistoryOpen', 'activeTab', 'setActiveTab', 'tabDimensions', 'setTabDimensions',
  'collapsedCategories', 'toggleCategory', 'collapsedSidebarZones', 'toggleSidebarZone', 'isMinimized', 'setIsMinimized',
  'layoutMode', 'setLayoutMode', 'verticalGroupingMode', 'setVerticalGroupingMode', 'overlayPosition', 'setOverlayPosition',
  'orbPosition', 'setOrbPosition', 'companionPosition', 'setCompanionPosition', 'developerMode', 'setDeveloperMode',
  'autoMinimizeOnChest', 'setAutoMinimizeOnChest', 'isUILocked', 'setIsUILocked', 'displayDensity', 'setDisplayDensity',
  'displayMode', 'setDisplayMode', 'minimalChestHud', 'setMinimalChestHud', 'minimalChestHudLocked', 'setMinimalChestHudLocked',
  'minimalChestTutorialSeen', 'setMinimalChestTutorialSeen', 'chestWidgetPositions', 'setChestWidgetPosition', 'categoryOrder',
  'setCategoryOrder', 'activeOpacity', 'setActiveOpacity', 'idleOpacity', 'setIdleOpacity', 'lootOpacity', 'setLootOpacity',
  'notificationSettings', 'updateNotificationSettings', 'weaponUISettings', 'updateWeaponUISettings', 'armorUISettings',
  'updateArmorUISettings', 'tableSettings', 'updateTableSettings', 'orbSize', 'setOrbSize', 'orbBorderThickness',
  'setOrbBorderThickness', 'favorites', 'toggleFavorite', 'theme', 'setTheme', 'minimizedIcon', 'minimizedIconUrl',
  'setMinimizedIconUrl', 'setMinimizedIcon', 'globalScale', 'setGlobalScale', 'minimizeHotkey', 'toggleLayoutHotkey',
  'resetSizeHotkey', 'lockUiHotkey', 'setMinimizeHotkey', 'setToggleLayoutHotkey', 'setResetSizeHotkey', 'setLockUiHotkey'
]);

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      callback(dirPath);
    }
  });
}

function processFile(filePath) {
  if (filePath.includes('store\\') || filePath.includes('store/')) return;
  if (filePath.includes('__tests__')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Extremely naive regex approach - works mostly
  // Replace: const { isMinimized } = useTrackerStore();
  const destructureRegex = /const\s+\{\s*([^}]+)\s*\}\s*=\s*useTrackerStore\(\)/g;
  content = content.replace(destructureRegex, (match, innerProps) => {
    const props = innerProps.split(',').map(p => p.trim()).filter(Boolean);
    const uiProps = [];
    const gameProps = [];
    props.forEach(p => {
      const propName = p.split(':')[0].trim();
      if (uiSliceProps.has(propName)) {
        uiProps.push(p);
      } else {
        gameProps.push(p);
      }
    });

    if (uiProps.length > 0) {
      if (gameProps.length > 0) {
        return `const { ${gameProps.join(', ')} } = useTrackerStore();\n  const { ${uiProps.join(', ')} } = useSettingsStore()`;
      } else {
        return `const { ${uiProps.join(', ')} } = useSettingsStore()`;
      }
    }
    return match;
  });

  // Replace selector syntax: useTrackerStore((state) => state.isMinimized)
  // We'll replace useTrackerStore with useSettingsStore if any ui property is mentioned nearby
  // This is a bit unsafe but often works.
  const selectorRegex = /useTrackerStore\([^)]*\)/g;
  content = content.replace(selectorRegex, (match) => {
    let isUI = false;
    for (const prop of uiSliceProps) {
      if (match.includes(`.${prop}`) || match.includes(prop)) {
        isUI = true;
        break;
      }
    }
    if (isUI) {
      return match.replace('useTrackerStore', 'useSettingsStore');
    }
    return match;
  });

  // Replace getState usage: useTrackerStore.getState().developerMode
  const getStateRegex = /useTrackerStore\.getState\(\)\.(\w+)/g;
  content = content.replace(getStateRegex, (match, prop) => {
    if (uiSliceProps.has(prop)) {
      return `useSettingsStore.getState().${prop}`;
    }
    return match;
  });

  // Replace setState usage: useTrackerStore.setState({ isMinimized: true })
  // We only handle basic objects.
  const setStateRegex = /useTrackerStore\.setState\(\{\s*(\w+)\s*:/g;
  content = content.replace(setStateRegex, (match, prop) => {
    if (uiSliceProps.has(prop)) {
      return `useSettingsStore.setState({ ${prop}:`;
    }
    return match;
  });

  if (content !== originalContent) {
    // Determine path depth for imports
    // Naively append the import to the top
    const depth = (filePath.match(/\\|\//g) || []).length - 1; // Assuming src is at depth 1
    // Let's just find the existing useTrackerStore import and add useSettingsStore
    const importRegex = /import\s+\{([^}]*useTrackerStore[^}]*)\}\s+from\s+['"]([^'"]+)['"];/;
    const match = importRegex.exec(content);
    if (match) {
       const settingsPath = match[2].replace('trackerStore', 'settingsStore');
       const newImport = `import { useSettingsStore } from '${settingsPath}';\n`;
       content = content.replace(match[0], match[0] + '\n' + newImport);
    }
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

walkDir('src', processFile);
console.log("Refactoring via regex complete.");
