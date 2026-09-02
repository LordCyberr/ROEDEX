const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const filePath = path.join(__dirname, '..', 'src', 'i18n', 'translations.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Parse TS to JS object
const result = ts.transpileModule(content, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const moduleObj = { exports: {} };
const fn = new Function('module', 'exports', result.outputText);
fn(moduleObj, moduleObj.exports);

const translations = moduleObj.exports.translations;

// Spanish translations for missing keys
const esAdditions = {
  settings: {
    cryptoWallets: 'Direcciones de Cripto'
  },
  stats: {
    drawerTitle: 'Estadísticas Rápidas de Rendimiento',
    quickStats: 'Estadísticas Rápidas de Rendimiento',
    activeSession: 'sesión activa',
    topLoot: 'Mejores Caídas de la Sesión',
    noLootYet: 'Aún no se han recolectado objetos en esta sesión.'
  }
};

// Korean translations for missing keys
const koAdditions = {
  tabs: {
    players: '온라인 플레이어'
  },
  settings: {
    cryptoWallets: '암호화폐 주소'
  },
  categories: {
    blacksmith: '대장장이'
  },
  stats: {
    drawerTitle: '빠른 성능 통계',
    quickStats: '빠른 성능 통계',
    activeSession: '활성 세션',
    topLoot: '세션 최고 전리품',
    noLootYet: '이 세션에서 수집된 아이템이 아직 없습니다.'
  },
  ui: {
    required: '필요 항목',
    reward: '보상',
    recipe: '제작법',
    craftingRecipe: '제작 레시피',
    selectAQuestToViewDetails: '퀘스트를 선택하여 상세 정보 보기',
    noAvailableQuests: '수락 가능한 퀘스트 없음',
    noActiveQuests: '진행 중인 퀘스트 없음',
    noPlayersNearby: '주변에 플레이어 없음',
    interceptorDrops: '인터셉터 드롭',
    export: '내보내기',
    copyLogs: '로그 복사',
    factoryReset: '공장 초기화',
    dragMode: '드래그 모드'
  },
  search: {
    placeholder: '아이템, 거래소 목록, 탭 검색... (Ctrl+K)',
    empty: '아이템, 탭, 거래소 검색어를 입력하세요...',
    noResults: '검색 결과가 없습니다',
    categories: {
      chest: '상자 인벤토리',
      market: '거래소 목록',
      tab: '탐색 탭'
    }
  },
  market: {
    analytics: {
      title: '거래소 분석 및 동향',
      item: '아이템',
      floorPrice: '최저가',
      avg7d: '7일 평균',
      change7d: '7일 변동률(%)',
      change30d: '30일 변동률(%)',
      volume: '거래량'
    }
  },
  chest: {
    settings: {
      itemsPerPage: '페이지당 아이템 수',
      all: '전체'
    }
  },
  itemCard: {
    resellValue: '최저가 / 재판매가',
    unpriced: 'N/A',
    trend7d: '7일 동향',
    dropSources: '드롭 출처'
  }
};

function deepMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

deepMerge(translations.es, esAdditions);
deepMerge(translations.ko, koAdditions);

// Ensure every key in EN is copied to ES and KO if still missing (fallback to EN value)
function fillMissingFromEn(base, target) {
  for (const key in base) {
    if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
      if (!target[key]) target[key] = {};
      fillMissingFromEn(base[key], target[key]);
    } else {
      if (target[key] === undefined) {
        target[key] = base[key];
      }
    }
  }
}

fillMissingFromEn(translations.en, translations.es);
fillMissingFromEn(translations.en, translations.ko);

const newContent = `export const translations = ${JSON.stringify(translations, null, 2)} as const;\n\nexport type TranslationKey = \n  | \`tabs.\${keyof typeof translations.en.tabs}\`\n  | \`settings.\${keyof typeof translations.en.settings}\`\n  | \`columns.\${keyof typeof translations.en.columns}\`\n  | \`categories.\${keyof typeof translations.en.categories}\`\n  | \`misc.\${keyof typeof translations.en.misc}\`\n  | \`npcZones.\${keyof typeof translations.en.npcZones}\`\n  | \`npcLocations.\${keyof typeof translations.en.npcLocations}\`\n  | \`bootSequence.\${keyof typeof translations.en.bootSequence}\`\n  | \`welcome.\${keyof typeof translations.en.welcome}\`\n  | \`tutorial.\${keyof typeof translations.en.tutorial}\`\n  | \`companions.\${keyof typeof translations.en.companions}\`\n  | \`quests.\${keyof typeof translations.en.quests}\`\n  | string;\n`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ Successfully synced translations.ts across all languages!');
