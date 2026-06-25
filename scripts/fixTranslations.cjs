const fs = require('fs');

let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// The objects to inject for developerMode and companions
const injections = {
  en: {
    dev: `      developerMode: 'Developer Mode',
      devModeEnabled: 'Developer mode enabled',
      devModeWarning: 'Advanced settings have been unlocked.',
      devModeDesc: 'Enables experimental features and advanced debugging tools.',
      dangerZone: 'DANGER ZONE',
      wipeDatabaseDesc: 'This will completely wipe all collected data, settings, and session history.',
      hardResetConfirm: 'Are you sure? This cannot be undone.',
      hardResetDatabase: 'Hard Reset Database'`,
    comp: `    companions: {
      bob: { name: 'Bob', description: 'The Optimistic Explorer. Loves finding new loot and going on adventures.' },
      kaya: { name: 'Kaya', description: 'The Fiery Oni. Always looking for a fight and massive boss drops!' },
      lia: { name: 'Lia', description: 'The Analytical AI. Focuses purely on data, efficiency, and perfection.' },
      crash: { name: 'Crash', description: 'The Chaotic Glitch. Error 404: Logic not found. Highly unpredictable.' }
    }`
  },
  es: {
    dev: `      developerMode: 'Modo Desarrollador',
      devModeEnabled: 'Modo desarrollador activado',
      devModeWarning: 'Se han desbloqueado configuraciones avanzadas.',
      devModeDesc: 'Activa características experimentales y herramientas de depuración avanzadas.',
      dangerZone: 'ZONA DE PELIGRO',
      wipeDatabaseDesc: 'Esto borrará completamente todos los datos recopilados, ajustes y el historial de sesiones.',
      hardResetConfirm: '¿Estás seguro? Esto no se puede deshacer.',
      hardResetDatabase: 'Restablecimiento Completo'`,
    comp: `    companions: {
      bob: { name: 'Bob', description: 'El Explorador Optimista. Le encanta encontrar nuevo botín y vivir aventuras.' },
      kaya: { name: 'Kaya', description: 'La Oni Ardiente. ¡Siempre buscando pelea y enormes botines!' },
      lia: { name: 'Lia', description: 'La IA Analítica. Se centra puramente en datos, eficiencia y perfección.' },
      crash: { name: 'Crash', description: 'El Fallo Caótico. Error 404: Lógica no encontrada. Altamente impredecible.' }
    }`
  },
  ru: {
    dev: `      developerMode: 'Режим разработчика',
      devModeEnabled: 'Режим разработчика включен',
      devModeWarning: 'Расширенные настройки разблокированы.',
      devModeDesc: 'Включает экспериментальные функции и расширенные инструменты отладки.',
      dangerZone: 'ОПАСНАЯ ЗОНА',
      wipeDatabaseDesc: 'Это полностью удалит все собранные данные, настройки и историю сессий.',
      hardResetConfirm: 'Вы уверены? Это действие необратимо.',
      hardResetDatabase: 'Полный сброс базы данных'`,
    comp: `    companions: {
      bob: { name: 'Боб', description: 'Оптимистичный исследователь. Любит находить новый лут и отправляться в приключения.' },
      kaya: { name: 'Кайя', description: 'Пылкая Они. Всегда ищет битвы и огромный лут с боссов!' },
      lia: { name: 'Лия', description: 'Аналитический ИИ. Сосредоточена исключительно на данных, эффективности и совершенстве.' },
      crash: { name: 'Крэш', description: 'Хаотичный сбой. Ошибка 404: Логика не найдена. Крайне непредсказуем.' }
    }`
  },
  ko: {
    dev: `      developerMode: '개발자 모드',
      devModeEnabled: '개발자 모드 활성화됨',
      devModeWarning: '고급 기능이 잠금 해제되었습니다.',
      devModeDesc: '실험적 기능 및 고급 디버그 도구를 활성화합니다.',
      dangerZone: '위험 구역',
      wipeDatabaseDesc: '수집된 모든 데이터, 설정 및 세션 기록을 완전히 삭제합니다.',
      hardResetConfirm: '확실합니까? 이 작업은 실행 취소할 수 없습니다.',
      hardResetDatabase: '데이터베이스 초기화'`,
    comp: `    companions: {
      bob: { name: '밥', description: '낙관적인 탐험가. 새로운 전리품을 찾고 모험을 떠나는 것을 좋아합니다.' },
      kaya: { name: '카야', description: '불같은 오니. 항상 싸움과 엄청난 보스 전리품을 찾습니다!' },
      lia: { name: '리아', description: '분석적인 AI. 오로지 데이터, 효율성 및 완벽에 중점을 둡니다.' },
      crash: { name: '크래쉬', description: '혼돈의 글리치. 오류 404: 논리를 찾을 수 없습니다. 매우 예측 불가능합니다.' }
    }`
  }
};

for (const lang of ['en', 'es', 'ru', 'ko']) {
  const aiCompRegex = new RegExp("aiCompanion: '.*?'\\r?\\n\\s*\\}", "g");
  if (!content.includes("developerMode:")) {
    content = content.replace(aiCompRegex, (match) => {
      return match.replace('}', ',\\n' + injections[lang].dev + '\\n    }');
    });
  }
}

const startGuides = {
  en: "'start': 'Start Interactive Guide'",
  es: "'start': 'Iniciar Guía Interactiva'",
  ru: "'start': 'Начать интерактивное руководство'",
  ko: "'start': '인터랙티브 가이드 시작'"
};

for (const lang of ['en', 'es', 'ru', 'ko']) {
  const guideStr = startGuides[lang];
  if (!content.includes("kaya: { name:")) {
    const guideRegex = new RegExp(guideStr + "\\r?\\n\\s*\\}", "g");
    content = content.replace(guideRegex, guideStr + '\\n    },\\n' + injections[lang].comp);
  }
}

if (!content.includes("| `companions.")) {
  const unionTarget = / \| \`welcome\.\$\{keyof typeof translations\.en\.welcome\}\`;/g;
  content = content.replace(unionTarget, " | `welcome.${keyof typeof translations.en.welcome}`\\n  | `companions.${keyof typeof translations.en.companions.bob}`\\n  | `companions.${keyof typeof translations.en.companions}`;");
}

fs.writeFileSync('src/i18n/translations.ts', content, 'utf8');
