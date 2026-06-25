const fs = require('fs');
let text = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const newStats = {
  en: {
    combat: 'COMBAT',
    mining: 'MINING',
    logging: 'LOGGING',
    plants: 'PLANTS',
    mobDrops: 'MOB DROPS',
    searchEntries: 'Search entries...',
    clearHistory: 'CLEAR HISTORY',
    runes: 'RUNES',
    lootWorth: 'LOOT WORTH',
    inventoryEmpty: 'Inventory is empty',
    noLoot: 'No loot gathered yet',
    openStatsWindow: 'Open Stats Window'
  },
  es: {
    combat: 'COMBATE',
    mining: 'MINERÍA',
    logging: 'TALA',
    plants: 'PLANTAS',
    mobDrops: 'BOTÍN DE MONSTRUOS',
    searchEntries: 'Buscar entradas...',
    clearHistory: 'BORRAR HISTORIAL',
    runes: 'RUNAS',
    lootWorth: 'VALOR DEL BOTÍN',
    inventoryEmpty: 'El inventario está vacío',
    noLoot: 'Aún no se ha recolectado botín',
    openStatsWindow: 'Abrir Ventana de Estadísticas'
  },
  ru: {
    combat: 'БОЙ',
    mining: 'ДОБЫЧА',
    logging: 'ЛЕСОЗАГОТОВКА',
    plants: 'РАСТЕНИЯ',
    mobDrops: 'ДРОП С МОБОВ',
    searchEntries: 'Поиск записей...',
    clearHistory: 'ОЧИСТИТЬ ИСТОРИЮ',
    runes: 'РУНЫ',
    lootWorth: 'СТОИМОСТЬ ЛУТА',
    inventoryEmpty: 'Инвентарь пуст',
    noLoot: 'Лут пока не собран',
    openStatsWindow: 'Открыть окно статистики'
  },
  ko: {
    combat: '전투',
    mining: '채광',
    logging: '벌목',
    plants: '식물',
    mobDrops: '몹 드롭',
    searchEntries: '항목 검색...',
    clearHistory: '기록 지우기',
    runes: '룬',
    lootWorth: '전리품 가치',
    inventoryEmpty: '인벤토리가 비어 있습니다',
    noLoot: '아직 수집된 전리품이 없습니다',
    openStatsWindow: '통계 창 열기'
  }
};

['en', 'es', 'ru', 'ko'].forEach(lang => {
  const marker = '"' + lang + '": {\n';
  const statsString = '    "stats": ' + JSON.stringify(newStats[lang], null, 4).split('\n').join('\n    ') + ',\n';
  text = text.replace(marker, marker + statsString);
});

fs.writeFileSync('src/i18n/translations.ts', text);
console.log('Translations updated.');
