const fs = require('fs');

const tsContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const typeIndex = tsContent.indexOf('export type TranslationKey');
const typesCode = tsContent.substring(typeIndex);
let objCode = tsContent.substring(0, typeIndex);
objCode = objCode.replace('export const translations =', 'return');
objCode = objCode.replace(/as const;/g, '');
const getObj = new Function(objCode);
const translations = getObj();

translations.en.quests = { upcomingFeature: "Upcoming Feature" };
if (translations.es) translations.es.quests = { upcomingFeature: "Próxima Función" };
if (translations.ko) translations.ko.quests = { upcomingFeature: "예정된 기능" };

let newTypesCode = typesCode;
if (!newTypesCode.includes('| `quests.${keyof typeof translations.en.quests}`')) {
    newTypesCode = newTypesCode.replace('| string;', '| `quests.${keyof typeof translations.en.quests}`\n  | string;');
}

const newObjCode = `export const translations = ${JSON.stringify(translations, null, 2)} as const;\n\n`;

fs.writeFileSync('src/i18n/translations.ts', newObjCode + newTypesCode);
console.log('Successfully added quests to translations.ts');
