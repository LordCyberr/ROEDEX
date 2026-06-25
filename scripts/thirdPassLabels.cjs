const fs = require('fs');
const path = require('path');

const valueToKeyMap = {
  'BORDER SETTINGS': 'borderSettings',
  'ALERTS & ANCHOR': 'alertsAndAnchor',
  'UI DESIGN': 'uiDesign',
  'POSITION & ANIMATION': 'positionAnimation',
  'EVENT TRIGGERS': 'eventTriggers',
  'Custom Image URL': 'customImageUrl',
  'Global Data Table': 'globalDataTable',
  'SUPPORT DEVELOPMENT': 'supportDevelopment',
  'CREDITS & ACKNOWLEDGEMENTS': 'creditsAndAcknowledgements',
  'Lead Developer & Creator': 'leadDeveloper',
  'Guidance & Contributions': 'guidanceContributions'
};

const dir = 'src/components/views/settings/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let changed = false;

  content = content.replace(/>([^<]+)<\/div>/g, (match, textString) => {
    const trimmed = textString.trim();
    const key = valueToKeyMap[trimmed];
    if (key) {
      changed = true;
      return `>{t('settings.${key}')}</div>`;
    }
    return match;
  });

  content = content.replace(/>([^<]+)<\/span>/g, (match, textString) => {
    const trimmed = textString.trim();
    const key = valueToKeyMap[trimmed];
    if (key) {
      changed = true;
      return `>{t('settings.${key}')}</span>`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
