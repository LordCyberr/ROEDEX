const fs = require('fs');

let tsContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// Find where "export type TranslationKey = " starts
const typeIndex = tsContent.indexOf('export type TranslationKey');
const typesCode = tsContent.substring(typeIndex);

// Everything before that is the translations object
let objCode = tsContent.substring(0, typeIndex);

// Make it evaluable
objCode = objCode.replace('export const translations =', 'return');
objCode = objCode.replace(/as const;/g, '');

const getObj = new Function(objCode);
const translations = getObj();

const en = translations.en || {};
const es = translations.es || {};
const ko = translations.ko || {};

const missing = {
  en: {
    sessionTab: {
      finishRun: "Finish Run",
      startNewRun: "Start New Run",
      resetLoot: "Reset Loot",
      viewPastRuns: "View Past Runs",
      totalWorth: "Total Worth"
    },
    tabHover: {
      global: "Global Data",
      favorites: "Favorites",
      session: "Session & Loot",
      npcs: "NPCs & Players",
      tracking: "Tracking & Zones",
      loot: "Chest Loot",
      settings: "Settings"
    }
  },
  es: {
    sessionTab: {
      finishRun: "Finalizar Ejecución",
      startNewRun: "Iniciar Nueva Ejecución",
      resetLoot: "Restablecer Botín",
      viewPastRuns: "Ver Ejecuciones Anteriores",
      totalWorth: "Valor Total"
    },
    tabHover: {
      global: "Datos Globales",
      favorites: "Favoritos",
      session: "Sesión y Botín",
      npcs: "NPCs y Jugadores",
      tracking: "Rastreo y Zonas",
      loot: "Botín de Cofre",
      settings: "Ajustes"
    }
  },
  ko: {
    sessionTab: {
      finishRun: "실행 종료",
      startNewRun: "새 실행 시작",
      resetLoot: "전리품 초기화",
      viewPastRuns: "이전 실행 보기",
      totalWorth: "총 가치"
    },
    tabHover: {
      global: "글로벌 데이터",
      favorites: "즐겨찾기",
      session: "세션 및 전리품",
      npcs: "NPC 및 플레이어",
      tracking: "추적 및 구역",
      loot: "상자 전리품",
      settings: "설정"
    }
  }
};

function mergeObj(target, source) {
  if (!source) return;
  for (const [key, val] of Object.entries(source)) {
    if (!target[key]) {
      target[key] = {};
    }
    for (const [subKey, subVal] of Object.entries(val)) {
      if (!target[key][subKey]) {
        target[key][subKey] = subVal;
      }
    }
  }
}

mergeObj(en, missing.en);
mergeObj(es, missing.es);
mergeObj(ko, missing.ko);

const newObjCode = `export const translations = ${JSON.stringify({en, es, ko}, null, 2)} as const;\n\n`;

fs.writeFileSync('src/i18n/translations.ts', newObjCode + typesCode);

console.log('Successfully added missing sessionTab and tabHover keys!');
