const fs = require('fs');

let content = fs.readFileSync('src/components/ui/FirstTimeWizard.tsx', 'utf8');

if (!content.includes('useTranslation')) {
  content = content.replace("import { CompanionId } from '../../data/companions';", 
    "import { CompanionId } from '../../data/companions';\nimport { useTranslation } from '../../hooks/useTranslation';");
  
  content = content.replace("const [step, setStep] = useState(1);", 
    "const { t } = useTranslation();\n  const [step, setStep] = useState(1);");
}

content = content.replace(/>ROEDEX Initialization</g, ">{t('wizard.init')}<");
content = content.replace(/>System Language & Latency Test</g, ">{t('wizard.sysLangTest')}<");
content = content.replace(/>Select your preferred language. Before proceeding, please hover the test block below for 5 seconds to calibrate the overlay response time.</g, ">{t('wizard.sysLangDesc')}<");
content = content.replace(/>Calibration Complete!</g, ">{t('wizard.calibrationComplete')}<");
content = content.replace(/>Continue</g, ">{t('wizard.continue')}<");
content = content.replace(/>Select AI Companion</g, ">{t('wizard.selectCompanion')}<");
content = content.replace(/>Choose the AI persona that will assist you. You can change this later in settings.</g, ">{t('wizard.companionDesc')}<");
content = content.replace(/>Ready to Explore</g, ">{t('wizard.ready')}<");
content = content.replace(/>ROEDEX is now fully configured for your environment.</g, ">{t('wizard.fullyConfigured')}<");
content = content.replace(/>Quick Starting Guide:</g, ">{t('wizard.quickGuide')}<");
content = content.replace(/>Use the</g, ">{t('wizard.guide1_start')}<");
content = content.replace(/>Sidebar \/ Header Tabs</g, ">{t('wizard.guide1_mid')}<");
content = content.replace(/>to navigate between modules.</g, ">{t('wizard.guide1_end')}<");
content = content.replace(/>Toggle the</g, ">{t('wizard.guide2_start')}<");
content = content.replace(/>Lock icon</g, ">{t('wizard.guide2_mid')}<");
content = content.replace(/>to enable or disable click-through mode.</g, ">{t('wizard.guide2_end')}<");
content = content.replace(/>Your</g, ">{t('wizard.guide3_start')}<");
content = content.replace(/>AI Companion</g, ">{t('wizard.guide3_mid')}<");
content = content.replace(/>will pop up to guide you through specific menus.</g, ">{t('wizard.guide3_end')}<");
content = content.replace(/>Remember to pop-out windows if you have multiple monitors!</g, ">{t('wizard.guide4')}<");
content = content.replace(/>Finish Setup</g, ">{t('wizard.finishSetup')}<");

fs.writeFileSync('src/components/ui/FirstTimeWizard.tsx', content, 'utf8');
console.log("FirstTimeWizard updated.");
