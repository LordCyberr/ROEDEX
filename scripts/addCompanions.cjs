const fs = require('fs');

const FILE_PATH = 'src/i18n/translations.ts';
let content = fs.readFileSync(FILE_PATH, 'utf8');

const companionsEN = `
    companions: {
      bob: { name: 'Bob', description: 'The Optimistic Explorer. Loves finding new loot and going on adventures.' },
      kaya: { name: 'Kaya', description: 'The Fiery Oni. Always looking for a fight and massive boss drops!' },
      lia: { name: 'Lia', description: 'The Analytical AI. Focuses purely on data, efficiency, and perfection.' },
      crash: { name: 'Crash', description: 'The Chaotic Glitch. Error 404: Logic not found. Highly unpredictable.' }
    }`;

const companionsES = `
    companions: {
      bob: { name: 'Bob', description: 'El Explorador Optimista. Le encanta encontrar nuevo botín y vivir aventuras.' },
      kaya: { name: 'Kaya', description: 'La Oni Ardiente. ¡Siempre buscando pelea y enormes botines!' },
      lia: { name: 'Lia', description: 'La IA Analítica. Se centra puramente en datos, eficiencia y perfección.' },
      crash: { name: 'Crash', description: 'El Fallo Caótico. Error 404: Lógica no encontrada. Altamente impredecible.' }
    }`;

const companionsRU = `
    companions: {
      bob: { name: 'Боб', description: 'Оптимистичный исследователь. Любит находить новый лут и отправляться в приключения.' },
      kaya: { name: 'Кайя', description: 'Пылкая Они. Всегда ищет битвы и огромный лут с боссов!' },
      lia: { name: 'Лия', description: 'Аналитический ИИ. Сосредоточена исключительно на данных, эффективности и совершенстве.' },
      crash: { name: 'Крэш', description: 'Хаотичный сбой. Ошибка 404: Логика не найдена. Крайне непредсказуем.' }
    }`;

const companionsKO = `
    companions: {
      bob: { name: '밥', description: '낙관적인 탐험가. 새로운 전리품을 찾고 모험을 떠나는 것을 좋아합니다.' },
      kaya: { name: '카야', 고description: '불같은 오니. 항상 싸움과 엄청난 보스 전리품을 찾습니다!' },
      lia: { name: '리아', description: '분석적인 AI. 오로지 데이터, 효율성 및 완벽에 중점을 둡니다.' },
      crash: { name: '크래쉬', description: '혼돈의 글리치. 오류 404: 논리를 찾을 수 없습니다. 매우 예측 불가능합니다.' }
    }`;

content = content.replace(/'start': 'Start Interactive Guide'\r?\n\s*\}/, "'start': 'Start Interactive Guide'\n    }," + companionsEN);
content = content.replace(/'start': 'Iniciar Guía Interactiva'\r?\n\s*\}/, "'start': 'Iniciar Guía Interactiva'\n    }," + companionsES);
content = content.replace(/'start': 'Начать интерактивное руководство'\r?\n\s*\}/, "'start': 'Начать интерактивное руководство'\n    }," + companionsRU);
content = content.replace(/'start': '인터랙티브 가이드 시작'\r?\n\s*\}/, "'start': '인터랙티브 가이드 시작'\n    }," + companionsKO);

if (!content.includes("| `companions.")) {
  const typeStr = " | `welcome.${keyof typeof translations.en.welcome}`;";
  const newTypeStr = " | `welcome.${keyof typeof translations.en.welcome}`\n  | `companions.${keyof typeof translations.en.companions}`;";
  content = content.replace(typeStr, newTypeStr);
}

fs.writeFileSync(FILE_PATH, content, 'utf8');
console.log('Successfully added companions to translations!');
