const fs = require('fs');

function addUseTranslation(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('useTranslation')) return content;
  
  // Find last import
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImportIndex);
  
  content = content.slice(0, endOfLastImport) + 
    "\nimport { useTranslation } from '../../hooks/useTranslation';" + 
    content.slice(endOfLastImport);
    
  // Find the component function start
  const functionMatch = content.match(/const [A-Za-z0-9_]+: React\.FC[^=]*= \([^)]*\) => {/);
  if (functionMatch) {
    const insertPos = functionMatch.index + functionMatch[0].length;
    content = content.slice(0, insertPos) + "\n  const { t } = useTranslation();" + content.slice(insertPos);
  } else {
    // try standard function
    const fnMatch = content.match(/export function [A-Za-z0-9_]+\([^)]*\) {/);
    if (fnMatch) {
      const insertPos = fnMatch.index + fnMatch[0].length;
      content = content.slice(0, insertPos) + "\n  const { t } = useTranslation();" + content.slice(insertPos);
    }
  }
  
  return content;
}

const fileUpdates = [
  {
    path: 'src/components/views/loot/ChestTab.tsx',
    replaces: [
      { find: '>Chest Worth<', replace: ">{t('loot.chestWorth')}<" },
      { find: '>Inventory Loot Value<', replace: ">{t('loot.inventoryLootValue')}<" },
      { find: '>Runes<', replace: ">{t('loot.runes')}<" },
      { find: '>Loot Value<', replace: ">{t('loot.lootValue')}<" },
      { find: '>Inventory is empty<', replace: ">{t('loot.inventoryEmpty')}<" },
      { find: '>Item<', replace: ">{t('loot.item')}<" },
      { find: '>Count<', replace: ">{t('loot.count')}<" },
      { find: '>Total<', replace: ">{t('loot.total')}<" }
    ]
  },
  {
    path: 'src/components/views/loot/ProfileTab.tsx',
    replaces: [
      { find: '>LVL<', replace: ">{t('loot.lvl')}<" },
      { find: '>Runes to Level Up<', replace: ">{t('loot.runesToLevel')}<" },
      { find: '>Lifetime Statistics<', replace: ">{t('loot.lifetimeStats')}<" },
      { find: '>View your entire ROEDEX history<', replace: ">{t('loot.viewHistory')}<" },
      { find: '>Open Stats Window<', replace: ">{t('loot.openStats')}<" }
    ]
  },
  {
    path: 'src/components/views/loot/SessionTab.tsx',
    replaces: [
      { find: '>Finish Run<', replace: ">{t('loot.finishRun')}<" },
      { find: '>Start New Run<', replace: ">{t('loot.startNewRun')}<" },
      { find: '>Total Worth<', replace: ">{t('loot.totalWorth')}<" },
      { find: '>No loot gathered yet<', replace: ">{t('loot.noLoot')}<" },
      { find: '>Item<', replace: ">{t('loot.item')}<" },
      { find: '>Count<', replace: ">{t('loot.count')}<" },
      { find: '>Total<', replace: ">{t('loot.total')}<" }
    ]
  },
  {
    path: 'src/components/views/LootView.tsx',
    replaces: [
      { find: '>Profile<', replace: ">{t('loot.profile')}<" },
      { find: '>Session<', replace: ">{t('loot.session')}<" },
      { find: '>Chest<', replace: ">{t('loot.chest')}<" }
    ]
  },
  {
    path: 'src/components/overlay/RunHistoryWindow.tsx',
    replaces: [
      { find: '>Past Runs<', replace: ">{t('overlay.pastRuns')}<" },
      { find: '>Clear History<', replace: ">{t('overlay.clearHistory')}<" },
      { find: '>Runes<', replace: ">{t('loot.runes')}<" },
      { find: '>Loot Worth<', replace: ">{t('loot.totalWorth')}<" },
      { find: '>No Past Runs<', replace: ">{t('overlay.noPastRuns')}<" },
      { find: '>Finish a run to save it to your history.<', replace: ">{t('overlay.finishToSave')}<" }
    ]
  },
  {
    path: 'src/components/widgets/MinimalChestHUD.tsx',
    replaces: [
      { find: '>Backpack Value<', replace: ">{t('overlay.backpackValue')}<" },
      { find: '>Chest Value<', replace: ">{t('overlay.chestValue')}<" }
    ]
  },
  {
    path: 'src/components/ui/CategoryTable.tsx',
    replaces: [
      { find: '>Respawns<', replace: ">{t('overlay.respawns')}<" }
    ]
  },
  {
    path: 'src/components/views/settings/AboutSettings.tsx',
    replaces: [
      { find: '>v0.0.1 • Open Source<', replace: ">{t('about.versionInfo')}<" },
      { find: '>ROEDEX is a high-performance tracking suite built exclusively for the community. Designed from the ground up to be seamless, beautiful, and completely free. Our mission is to provide you with the most advanced set of tools to optimize your runs, track rare drops, and conquer your adventures.<', replace: ">{t('about.desc')}<" },
      { find: '>View Project Changelogs<', replace: ">{t('about.viewChangelogs')}<" },
      { find: '>Read More ➔<', replace: ">{t('about.readMore')}<" },
      { find: '>Support Development<', replace: ">{t('about.supportDev')}<" },
      { find: '>ROEDEX is an open-source project maintained by the community. If you would like to support ongoing development and server costs, you can do so via the addresses below. Contributions are strictly optional but greatly appreciated.<', replace: ">{t('about.supportDesc')}<" },
      { find: '>(Note: Please verify the network before sending any crypto)<', replace: ">{t('about.cryptoNote')}<" },
      { find: '>YouTube<', replace: ">{t('about.youtube')}<" },
      { find: '>GitHub<', replace: ">{t('about.github')}<" },
      { find: '>Credits & Acknowledgements<', replace: ">{t('about.credits')}<" },
      { find: '>Lord Cyberr<', replace: ">{t('about.lordCyberr')}<" },
      { find: '>MrSnorch<', replace: ">{t('about.mrSnorch')}<" }
    ]
  },
  {
    path: 'src/components/views/settings/AdvancedSettings.tsx',
    replaces: [
      { find: '>Danger Zone<', replace: ">{t('settings.dangerZone')}<" },
      { find: '>Wiping the database will completely erase all custom layouts, preferences, lifetimes stats, and session data. It will simulate a fresh installation of the extension, allowing you to replay the full onboarding experience.<', replace: ">{t('settings.dangerZoneDesc')}<" },
      { find: '>HARD RESET DATABASE<', replace: ">{t('settings.hardReset')}<" }
    ]
  },
  {
    path: 'src/components/widgets/ErrorBoundary.tsx',
    replaces: [
      { find: '>Component Crashed<', replace: ">{t('errors.componentCrashed')}<" },
      { find: '>Try Again<', replace: ">{t('errors.tryAgain')}<" }
    ]
  },
  {
    path: 'src/components/ui/ChangelogModal.tsx',
    replaces: [
      { find: ">What's New<", replace: ">{t('errors.whatsNew')}<" },
      { find: '>Fixes & Improvements<', replace: ">{t('errors.fixesImprovements')}<" }
    ]
  }
];

for (const update of fileUpdates) {
  let content = addUseTranslation(update.path);
  for (const rep of update.replaces) {
    content = content.replace(new RegExp(rep.find.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), 'g'), rep.replace);
  }
  fs.writeFileSync(update.path, content, 'utf8');
  console.log(`Updated ${update.path}`);
}

