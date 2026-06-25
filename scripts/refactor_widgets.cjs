const fs = require('fs');
const path = require('path');

const uiSliceProperties = [
  'isChangelogOpen', 'setIsChangelogOpen', 'isDebugPanelOpen', 'toggleDebugPanel',
  'debugStats', 'updateDebugStats', 'firstTimeWizardCompleted', 'setFirstTimeWizardCompleted',
  'isLifetimeStatsOpen', 'setIsLifetimeStatsOpen', 'isRunHistoryOpen', 'setIsRunHistoryOpen',
  'profilerMetrics', 'updateProfilerMetrics', 'activeCompanion', 'setActiveCompanion',
  'poppedOutWindows', 'popOutTab', 'mergeTab', 'mergeAllTabs', 'updatePoppedOutWindow',
  'currentNpcDialogue', 'setCurrentNpcDialogue', 'language', 'setLanguage',
  'activeTab', 'setActiveTab', 'tabDimensions', 'collapsedCategories', 'toggleCategory',
  'collapsedSidebarZones', 'toggleSidebarZone', 'isMinimized', 'setIsMinimized',
  'globalScale', 'minimizeHotkey', 'toggleLayoutHotkey', 'resetSizeHotkey', 'lockUiHotkey',
  'setMinimizeHotkey', 'setToggleLayoutHotkey', 'setResetSizeHotkey', 'setLockUiHotkey',
  'layoutMode', 'setLayoutMode', 'verticalGroupingMode', 'setVerticalGroupingMode',
  'setTabDimensions', 'setGlobalScale', 'overlayPosition', 'setOverlayPosition',
  'orbPosition', 'setOrbPosition', 'companionPosition', 'setCompanionPosition',
  'developerMode', 'setDeveloperMode', 'autoMinimizeOnChest', 'setAutoMinimizeOnChest',
  'isUILocked', 'setIsUILocked', 'displayMode', 'setDisplayMode', 'theme', 'setTheme',
  'notificationSettings', 'updateNotificationSettings', 'notifications', 'addNotification',
  'removeNotification', 'clearNotifications', 'companionMessages', 'addBobMessage',
  'clearBobMessages', 'removeBobMessage', 'tableSettings', 'updateTableSettings',
  'weaponUISettings', 'updateWeaponUISettings', 'armorUISettings', 'updateArmorUISettings'
];

const filesToProcess = [
  'src/components/views/TrackingView.tsx',
  'src/components/widgets/ArmorUI.tsx',
  'src/components/widgets/CompanionOverlay.tsx',
  'src/components/widgets/DebugPanel.tsx',
  'src/components/widgets/EfficiencyHUD.tsx',
  'src/components/widgets/NotificationToaster.tsx',
  'src/components/widgets/WeaponUI.tsx'
];

filesToProcess.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Add import if not present
  if (!content.includes('useSettingsStore')) {
    content = content.replace(
      "import { useTrackerStore }",
      "import { useTrackerStore }\nimport { useSettingsStore } from '../../store/settingsStore';\n// REPLACE_ME"
    ).replace(
        "import { useTrackerStore }",
        "import { useTrackerStore }\nimport { useSettingsStore } from '../../../store/settingsStore';\n// REPLACE_ME"
    );
  }

  // Handle useTrackerStore(useShallow(...)) or useTrackerStore(state => ...)
  // This requires AST manipulation or careful regex. For now, since these are React components,
  // we can use ts-morph. Let's do it via node script.
});
