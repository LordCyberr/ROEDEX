const fs = require('fs');
let c = fs.readFileSync('scripts/strictTranslationsInjector.cjs', 'utf8');
c = c.replace('speechBubbleDuration: "Speech Bubble Duration (Seconds)",', 'speechBubbleDuration: "Speech Bubble Duration (Seconds)",\n      bubbleDistance: "Bubble Distance",\n      bubbleOffset: "Bubble Offset",\n      quickPreset: "Quick Preset",\n      showPreviewDummy: "Show Preview Dummy",');
fs.writeFileSync('scripts/strictTranslationsInjector.cjs', c);
