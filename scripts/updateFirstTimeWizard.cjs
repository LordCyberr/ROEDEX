const fs = require('fs');
let text = fs.readFileSync('src/components/ui/FirstTimeWizard.tsx', 'utf8');

text = text.replace('System Language & Latency Test', '{t(\'wizard.systemLangTest\')}');
text = text.replace('Select your preferred language. Before proceeding, please hover the test block below for 5 seconds to calibrate the overlay response time.', '{t(\'wizard.langDesc\')}');
text = text.replace('{isHovering ? \'Calibrating... Hold steady.\' : \'Hover here for 5 seconds to test response time\'}', '{isHovering ? t(\'wizard.calibratingHold\') : t(\'wizard.hoverToTest\')}');
text = text.replace('Continue <ChevronRight size={16} />', '{t(\'wizard.continueBtn\')} <ChevronRight size={16} />');
text = text.replace('Select AI Companion', '{t(\'wizard.selectAiCompanion\')}');
text = text.replace('Choose the AI persona that will assist you. You can change this later in settings.', '{t(\'wizard.selectAiDesc\')}');
text = text.replace('Continue <ChevronRight size={16} />', '{t(\'wizard.continueBtn\')} <ChevronRight size={16} />');
text = text.replace('Ready to Explore', '{t(\'wizard.readyToExplore\')}');
text = text.replace('ROEDEX is now fully configured for your environment. ', '{t(\'wizard.readyDesc\')}');
text = text.replace('Finish Setup <Check size={18} />', '{t(\'wizard.finishSetup\')} <Check size={18} />');

fs.writeFileSync('src/components/ui/FirstTimeWizard.tsx', text);
console.log('FirstTimeWizard updated.');
