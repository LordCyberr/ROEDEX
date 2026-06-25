const fs = require('fs');

let c = fs.readFileSync('scripts/strictTranslationsInjector.cjs', 'utf8');

const additionalKeys = `
      borderSettings: "BORDER SETTINGS",
      alertsAndAnchor: "ALERTS & ANCHOR",
      uiDesign: "UI DESIGN",
      positionAnimation: "POSITION & ANIMATION",
      eventTriggers: "EVENT TRIGGERS",
      customImageUrl: "Custom Image URL",
      globalDataTable: "Global Data Table",
      supportDevelopment: "SUPPORT DEVELOPMENT",
      creditsAndAcknowledgements: "CREDITS & ACKNOWLEDGEMENTS",
      leadDeveloper: "Lead Developer & Creator",
      guidanceContributions: "Guidance & Contributions",
`;

c = c.replace('dangerZoneDesc: "These actions are permanent and will completely wipe your locally saved data. This simulates a fresh install.",', 
  'dangerZoneDesc: "These actions are permanent and will completely wipe your locally saved data. This simulates a fresh install.",\n' + additionalKeys);

fs.writeFileSync('scripts/strictTranslationsInjector.cjs', c);
