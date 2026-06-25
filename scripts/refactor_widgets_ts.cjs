const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

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

for (const filePath of filesToProcess) {
  const fullPath = path.join(process.cwd(), filePath);
  const sourceFile = project.addSourceFileAtPath(fullPath);

  let needsSettingsStore = false;

  // Find all variable declarations
  const varDeclarations = sourceFile.getVariableDeclarations();

  for (const varDecl of varDeclarations) {
    const initializer = varDecl.getInitializer();
    if (initializer && initializer.getText().startsWith('useTrackerStore')) {
        
        // It could be: const { a, b } = useTrackerStore(...)
        const nameNode = varDecl.getNameNode();
        if (nameNode.getKind() === SyntaxKind.ObjectBindingPattern) {
            const elements = nameNode.getElements();
            
            const trackerElements = [];
            const settingsElements = [];
            
            for (const el of elements) {
                const propName = el.getPropertyNameNode() ? el.getPropertyNameNode().getText() : el.getName();
                if (uiSliceProperties.includes(propName)) {
                    settingsElements.push(el.getText());
                } else {
                    trackerElements.push(el.getText());
                }
            }
            
            if (settingsElements.length > 0) {
                needsSettingsStore = true;
                
                // If we also have a useShallow function inside useTrackerStore
                const callExpr = initializer.asKind(SyntaxKind.CallExpression);
                let useShallowArgs = null;
                let stateMapText = null;
                
                if (callExpr) {
                    const args = callExpr.getArguments();
                    if (args.length > 0 && args[0].getKind() === SyntaxKind.CallExpression && args[0].getText().startsWith('useShallow')) {
                        const shallowCall = args[0].asKind(SyntaxKind.CallExpression);
                        const shallowArgs = shallowCall.getArguments();
                        if (shallowArgs.length > 0) {
                            const arrowFunc = shallowArgs[0].asKind(SyntaxKind.ArrowFunction);
                            if (arrowFunc) {
                                const body = arrowFunc.getBody();
                                if (body.getKind() === SyntaxKind.ParenthesizedExpression) {
                                    const objLit = body.getExpressionIfKind(SyntaxKind.ObjectLiteralExpression);
                                    if (objLit) {
                                        const props = objLit.getProperties();
                                        const trackerProps = [];
                                        const settingsProps = [];
                                        
                                        for (const p of props) {
                                            if (p.getKind() === SyntaxKind.PropertyAssignment) {
                                                const pName = p.getName();
                                                if (uiSliceProperties.includes(pName)) {
                                                    settingsProps.push(p.getText());
                                                } else {
                                                    trackerProps.push(p.getText());
                                                }
                                            }
                                        }
                                        
                                        // Now we split the whole declaration
                                        const statement = varDecl.getStatement();
                                        const index = statement.getChildIndex();
                                        
                                        if (trackerElements.length > 0) {
                                            // Keep tracker store but update it
                                            varDecl.replaceWithText(`{ ${trackerElements.join(', ')} } = useTrackerStore(useShallow((state) => ({\n    ${trackerProps.join(',\n    ')}\n  })))`);
                                            // Insert settings store
                                            sourceFile.insertStatements(index + 1, `const { ${settingsElements.join(', ')} } = useSettingsStore(useShallow((state) => ({\n    ${settingsProps.join(',\n    ')}\n  })));`);
                                        } else {
                                            // Replace entirely with settings store
                                            varDecl.replaceWithText(`{ ${settingsElements.join(', ')} } = useSettingsStore(useShallow((state) => ({\n    ${settingsProps.join(',\n    ')}\n  })))`);
                                        }
                                    }
                                }
                            }
                        }
                    } else if (args.length > 0 && args[0].getKind() === SyntaxKind.ArrowFunction) {
                        // useTrackerStore(state => state.xxx) pattern
                        // Actually, if it's ObjectBindingPattern without useShallow, it might just be useTrackerStore()
                        if (args.length === 0) {
                             const statement = varDecl.getStatement();
                             const index = statement.getChildIndex();
                             
                             if (trackerElements.length > 0) {
                                varDecl.replaceWithText(`{ ${trackerElements.join(', ')} } = useTrackerStore()`);
                                sourceFile.insertStatements(index + 1, `const { ${settingsElements.join(', ')} } = useSettingsStore();`);
                             } else {
                                varDecl.replaceWithText(`{ ${settingsElements.join(', ')} } = useSettingsStore()`);
                             }
                        }
                    }
                }
            }
        }
    }
  }

  if (needsSettingsStore) {
    const importDecs = sourceFile.getImportDeclarations();
    let hasSettingsImport = false;
    for (const imp of importDecs) {
      if (imp.getModuleSpecifierValue().includes('settingsStore')) {
        hasSettingsImport = true;
      }
    }
    
    if (!hasSettingsImport) {
      // Find trackerStore import to place it after
      let trackerImportIndex = 0;
      for (let i = 0; i < importDecs.length; i++) {
        if (importDecs[i].getModuleSpecifierValue().includes('trackerStore')) {
          trackerImportIndex = importDecs[i].getChildIndex();
          break;
        }
      }
      
      let relativePath = '../../store/settingsStore'; // Default for views
      if (filePath.includes('widgets')) relativePath = '../../store/settingsStore';
      
      sourceFile.insertStatements(trackerImportIndex + 1, `import { useSettingsStore } from '${relativePath}';`);
    }
  }

  sourceFile.saveSync();
  console.log(`Refactored ${filePath}`);
}
