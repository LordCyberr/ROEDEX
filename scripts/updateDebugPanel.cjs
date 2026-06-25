const fs = require('fs');

let content = fs.readFileSync('src/components/widgets/DebugPanel.tsx', 'utf8');

if (!content.includes('useTranslation')) {
  content = content.replace("import { Play, Square } from 'lucide-react';", "import { Play, Square } from 'lucide-react';\nimport { useTranslation } from '../../hooks/useTranslation';");
  
  content = content.replace("const [isOpen, setIsOpen] = React.useState(false);", "const { t } = useTranslation();\n  const [isOpen, setIsOpen] = React.useState(false);");
}

content = content.replace(/>ROEDEX \/\/ DIAGNOSTICS</g, ">{t('debug.title')}<");
content = content.replace(/>NETWORK</g, ">{t('debug.network')}<");
content = content.replace(/>SOCKET STATUS:</g, ">{t('debug.socketStatus')}<");
content = content.replace(/>PACKETS\/SEC:</g, ">{t('debug.packetsSec')}<");
content = content.replace(/>SYSTEM USAGE</g, ">{t('debug.systemUsage')}<");
content = content.replace(/>FPS:</g, ">{t('debug.fps')}<");
content = content.replace(/>RAM \(JS HEAP\):</g, ">{t('debug.ram')}<");
content = content.replace(/>PARSE AVG:</g, ">{t('debug.parseAvg')}<");
content = content.replace(/>PARSE MAX:</g, ">{t('debug.parseMax')}<");
content = content.replace(/>RENDER AVG:</g, ">{t('debug.renderAvg')}<");
content = content.replace(/>STORE MEMORY</g, ">{t('debug.storeMemory')}<");
content = content.replace(/>PLAYERS IN ZONE:</g, ">{t('debug.playersInZone')}<");
content = content.replace(/>NODES TRACKED:</g, ">{t('debug.nodesTracked')}<");
content = content.replace(/>MOBS TRACKED:</g, ">{t('debug.mobsTracked')}<");
content = content.replace(/>MOCK UI TESTS</g, ">{t('debug.mockUiTests')}<");
content = content.replace(/>SPAWN TESSA</g, ">{t('debug.spawnTessa')}<");
content = content.replace(/>SPAWN FINN</g, ">{t('debug.spawnFinn')}<");
content = content.replace(/>OVERLAY POSITIONS</g, ">{t('debug.overlayPositions')}<");
content = content.replace(/>MAIN OVERLAY:</g, ">{t('debug.mainOverlay')}<");
content = content.replace(/>MINIMIZED ORB:</g, ">{t('debug.minimizedOrb')}<");
content = content.replace(/>COMPANION:</g, ">{t('debug.companion')}<");
content = content.replace(/>WEAPON UI:</g, ">{t('debug.weaponUi')}<");
content = content.replace(/>ARMOR UI:</g, ">{t('debug.armorUi')}<");
content = content.replace(/>EXPORT SAFE DEBUG REPORT</g, ">{t('debug.exportReport')}<");

fs.writeFileSync('src/components/widgets/DebugPanel.tsx', content, 'utf8');
console.log("DebugPanel updated.");
