const fs = require('fs');

const missingKeys = {
  en: {
    general: {
      themeDark: 'Dark Mode (Default)',
      themeBob: "Bob's Adventure (Premium)",
      standardMode: 'Standard Mode',
      globalScale: 'Global UI Scale (4K/2K Displays)',
      orbBorderThickness: 'Orb Border Thickness',
      behavior: 'BEHAVIOR',
      autoMinimizeChest: 'Auto-Minimize on Chest Open',
      minimizeHotkey: 'Minimize/Maximize Hotkey',
      layoutHotkey: 'Toggle Layout Hotkey',
      resetHotkey: 'Reset Size/Position Hotkey',
      lockHotkey: 'Lock/Unlock UI Hotkey'
    },
    tracking: {
      viewOptions: {
        currentZone: 'Current Zone'
      },
      minimalChestHud: 'Minimal Chest HUD',
      enableMinimalChest: 'Enable Minimal Chest HUD',
      lockMinimalChest: 'Lock Minimal Chest HUD',
      resetHudTutorial: 'Reset HUD Tutorial',
      rarityAlpha: 'Alphabetical Only'
    }
  },
  es: {
    general: {
      themeDark: 'Modo Oscuro (Por defecto)',
      themeBob: "Aventura de Bob (Premium)",
      standardMode: 'Modo Estándar',
      globalScale: 'Escala Global de UI',
      orbBorderThickness: 'Grosor del Borde del Orbe',
      behavior: 'COMPORTAMIENTO',
      autoMinimizeChest: 'Auto-Minimizar al Abrir Cofre',
      minimizeHotkey: 'Atajo Minimizar/Maximizar',
      layoutHotkey: 'Atajo Cambiar Diseño',
      resetHotkey: 'Atajo Restablecer Tamaño/Posición',
      lockHotkey: 'Atajo Bloquear/Desbloquear UI'
    },
    tracking: {
      viewOptions: {
        currentZone: 'Zona Actual'
      },
      minimalChestHud: 'HUD de Cofre Mínimo',
      enableMinimalChest: 'Habilitar HUD Mínimo',
      lockMinimalChest: 'Bloquear HUD Mínimo',
      resetHudTutorial: 'Restablecer Tutorial HUD',
      rarityAlpha: 'Solo Alfabético'
    }
  },
  ru: {
    general: {
      themeDark: 'Темный режим (По умолчанию)',
      themeBob: "Приключение Боба (Премиум)",
      standardMode: 'Стандартный режим',
      globalScale: 'Глобальный масштаб UI',
      orbBorderThickness: 'Толщина границы шара',
      behavior: 'ПОВЕДЕНИЕ',
      autoMinimizeChest: 'Авто-сворачивание при открытии сундука',
      minimizeHotkey: 'Горячая клавиша: Свернуть/Развернуть',
      layoutHotkey: 'Горячая клавиша: Сменить макет',
      resetHotkey: 'Горячая клавиша: Сброс размера/позиции',
      lockHotkey: 'Горячая клавиша: Блок/Разблок UI'
    },
    tracking: {
      viewOptions: {
        currentZone: 'Текущая зона'
      },
      minimalChestHud: 'Минималистичный HUD сундука',
      enableMinimalChest: 'Включить минималистичный HUD',
      lockMinimalChest: 'Заблокировать минималистичный HUD',
      resetHudTutorial: 'Сбросить обучение HUD',
      rarityAlpha: 'Только по алфавиту'
    }
  },
  ko: {
    general: {
      themeDark: '다크 모드 (기본)',
      themeBob: "밥의 모험 (프리미엄)",
      standardMode: '표준 모드',
      globalScale: '전역 UI 비율',
      orbBorderThickness: '오브 테두리 두께',
      behavior: '동작',
      autoMinimizeChest: '상자 열 때 자동 최소화',
      minimizeHotkey: '최소화/최대화 단축키',
      layoutHotkey: '레이아웃 전환 단축키',
      resetHotkey: '크기/위치 초기화 단축키',
      lockHotkey: 'UI 잠금/잠금 해제 단축키'
    },
    tracking: {
      viewOptions: {
        currentZone: '현재 지역'
      },
      minimalChestHud: '미니멀 상자 HUD',
      enableMinimalChest: '미니멀 상자 HUD 활성화',
      lockMinimalChest: '미니멀 상자 HUD 잠금',
      resetHudTutorial: 'HUD 튜토리얼 초기화',
      rarityAlpha: '알파벳 순서만'
    }
  }
};

let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

for (const lang of Object.keys(missingKeys)) {
  const data = missingKeys[lang];
  // We need to carefully inject these keys into the specific language's settingsUI object.
  // It's safer to read the file as a string, find the language block, and use a regex to insert.
  
  // Inject into general
  const generalRegex = new RegExp(`(${lang}: \\{[\\s\\S]*?settingsUI: \\{[\\s\\S]*?general: \\{)([\\s\\S]*?\\})`);
  content = content.replace(generalRegex, (match, p1, p2) => {
    let toInject = '';
    for (const [k, v] of Object.entries(data.general)) {
      toInject += `\n        ${k}: ${JSON.stringify(v)},`;
    }
    return p1 + toInject + p2;
  });

  // Inject into tracking
  const trackingRegex = new RegExp(`(${lang}: \\{[\\s\\S]*?settingsUI: \\{[\\s\\S]*?tracking: \\{)([\\s\\S]*?\\})`);
  content = content.replace(trackingRegex, (match, p1, p2) => {
    let toInject = '';
    for (const [k, v] of Object.entries(data.tracking)) {
      if (k !== 'viewOptions') {
        toInject += `\n        ${k}: ${JSON.stringify(v)},`;
      }
    }
    return p1 + toInject + p2;
  });

  // Inject into viewOptions inside tracking
  const viewOptionsRegex = new RegExp(`(${lang}: \\{[\\s\\S]*?settingsUI: \\{[\\s\\S]*?tracking: \\{[\\s\\S]*?viewOptions: \\{)([\\s\\S]*?\\})`);
  content = content.replace(viewOptionsRegex, (match, p1, p2) => {
    return p1 + `\n          currentZone: ${JSON.stringify(data.tracking.viewOptions.currentZone)},` + p2;
  });
}

fs.writeFileSync('src/i18n/translations.ts', content, 'utf8');
console.log('Successfully injected missing keys.');
