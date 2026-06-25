const fs = require('fs');

let text = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const newTranslations = {
  en: {
    ui: {
      mergeTabs: 'Merge All Popped-Out Tabs',
      toggleLayout: 'Toggle Layout',
      settings: 'Settings',
      resetSize: 'Reset Size',
      profile: 'Profile',
      session: 'Session',
      chest: 'Chest',
      popOutTab: 'Pop out tab',
      whatsNew: "What's New",
      tryAgain: 'Try Again',
      doubleTapToOpen: 'Double tap to open',
      copyAddress: 'Copy Address',
      mergeBack: 'Merge Back'
    },
    chestTab: {
      totalValueDesc: 'Total value of all items stored in your House Chest',
      includeRunesDesc: "Include your current Runes balance in the 'Total Worth' calculation",
      totalValue: 'Total Value'
    },
    settingsGroup: {
      previewAndSetup: 'Preview & Setup',
      appearance: 'Appearance',
      behavior: 'Behavior',
      positioning: 'Positioning',
      messageCategories: 'Message Categories',
      replayTutorial: 'Replay Onboarding Tutorial',
      resetHudTutorial: 'Reset HUD Tutorial'
    },
    debug: {
      avgParseDuration: 'Average duration to parse a WebSocket event',
      maxSpikeDuration: 'Max spike duration in parse processing',
      avgRenderDuration: 'Average duration for main overlay React render',
      exportDiagnostics: 'Export safe overlay diagnostics (no personal data) to JSON',
      wipeDataWarning: 'Wipes ALL extension data including settings and trackers. Only click if experiencing severe bugs.'
    },
    wizardNew: {
      restartIntro: 'Restart Intro',
      gotIt: "Got it, I'm ready!",
      welcomeMessage: 'Welcome to ROEDEX, your premium AI companion overlay. The system is fully synced and ready to boot. Would you like to initialize the onboarding sequence to explore your new toolkit?'
    }
  },
  es: {
    ui: {
      mergeTabs: 'Combinar todas las pestañas',
      toggleLayout: 'Alternar diseño',
      settings: 'Ajustes',
      resetSize: 'Restablecer tamaño',
      profile: 'Perfil',
      session: 'Sesión',
      chest: 'Cofre',
      popOutTab: 'Desplegar pestaña',
      whatsNew: 'Novedades',
      tryAgain: 'Intentar de nuevo',
      doubleTapToOpen: 'Doble toque para abrir',
      copyAddress: 'Copiar dirección',
      mergeBack: 'Volver a combinar'
    },
    chestTab: {
      totalValueDesc: 'Valor total de todos los artículos almacenados en tu cofre',
      includeRunesDesc: "Incluir el saldo actual de runas en el cálculo del 'Valor Total'",
      totalValue: 'Valor Total'
    },
    settingsGroup: {
      previewAndSetup: 'Vista previa y Configuración',
      appearance: 'Apariencia',
      behavior: 'Comportamiento',
      positioning: 'Posicionamiento',
      messageCategories: 'Categorías de mensajes',
      replayTutorial: 'Repetir Tutorial de Inicio',
      resetHudTutorial: 'Restablecer Tutorial del HUD'
    },
    debug: {
      avgParseDuration: 'Duración media de análisis de un evento de WebSocket',
      maxSpikeDuration: 'Duración máxima de pico en el proceso de análisis',
      avgRenderDuration: 'Duración media de renderizado de React',
      exportDiagnostics: 'Exportar diagnósticos seguros (sin datos personales) a JSON',
      wipeDataWarning: 'Borra TODOS los datos, incluyendo ajustes. Haz clic solo si experimentas errores graves.'
    },
    wizardNew: {
      restartIntro: 'Reiniciar Introducción',
      gotIt: "¡Entendido, estoy listo!",
      welcomeMessage: 'Bienvenido a ROEDEX, tu compañero de IA premium. El sistema está sincronizado y listo para arrancar. ¿Te gustaría inicializar la secuencia de incorporación para explorar tu nuevo kit de herramientas?'
    }
  },
  ru: {
    ui: {
      mergeTabs: 'Объединить все вкладки',
      toggleLayout: 'Переключить макет',
      settings: 'Настройки',
      resetSize: 'Сбросить размер',
      profile: 'Профиль',
      session: 'Сессия',
      chest: 'Сундук',
      popOutTab: 'Открепить вкладку',
      whatsNew: 'Что нового',
      tryAgain: 'Попробовать снова',
      doubleTapToOpen: 'Дважды нажмите, чтобы открыть',
      copyAddress: 'Скопировать адрес',
      mergeBack: 'Объединить обратно'
    },
    chestTab: {
      totalValueDesc: 'Общая стоимость всех предметов в вашем сундуке',
      includeRunesDesc: "Включить текущий баланс рун в расчет 'Общей стоимости'",
      totalValue: 'Общая стоимость'
    },
    settingsGroup: {
      previewAndSetup: 'Предпросмотр и настройка',
      appearance: 'Внешний вид',
      behavior: 'Поведение',
      positioning: 'Позиционирование',
      messageCategories: 'Категории сообщений',
      replayTutorial: 'Повторить обучение',
      resetHudTutorial: 'Сбросить обучение HUD'
    },
    debug: {
      avgParseDuration: 'Среднее время анализа события WebSocket',
      maxSpikeDuration: 'Макс. время скачка обработки анализа',
      avgRenderDuration: 'Среднее время рендера React',
      exportDiagnostics: 'Экспорт безопасной диагностики (без личных данных) в JSON',
      wipeDataWarning: 'Удаляет ВСЕ данные, включая настройки. Нажимайте только при серьезных ошибках.'
    },
    wizardNew: {
      restartIntro: 'Перезапустить интро',
      gotIt: "Понял, я готов!",
      welcomeMessage: 'Добро пожаловать в ROEDEX, ваш премиальный ИИ-компаньон. Система синхронизирована и готова к запуску. Хотите ли вы запустить процесс обучения, чтобы изучить ваш новый набор инструментов?'
    }
  },
  ko: {
    ui: {
      mergeTabs: '모든 팝아웃 탭 병합',
      toggleLayout: '레이아웃 전환',
      settings: '설정',
      resetSize: '크기 초기화',
      profile: '프로필',
      session: '세션',
      chest: '상자',
      popOutTab: '팝아웃 탭',
      whatsNew: '새로운 소식',
      tryAgain: '다시 시도',
      doubleTapToOpen: '두 번 탭하여 열기',
      copyAddress: '주소 복사',
      mergeBack: '다시 병합'
    },
    chestTab: {
      totalValueDesc: '집 상자에 보관된 모든 아이템의 총 가치',
      includeRunesDesc: "'총 가치' 계산에 현재 룬 잔액 포함",
      totalValue: '총 가치'
    },
    settingsGroup: {
      previewAndSetup: '미리보기 및 설정',
      appearance: '외관',
      behavior: '동작',
      positioning: '위치',
      messageCategories: '메시지 카테고리',
      replayTutorial: '온보딩 튜토리얼 다시 보기',
      resetHudTutorial: 'HUD 튜토리얼 초기화'
    },
    debug: {
      avgParseDuration: 'WebSocket 이벤트 구문 분석 평균 시간',
      maxSpikeDuration: '구문 분석 처리 중 최대 스파이크 지속 시간',
      avgRenderDuration: '메인 오버레이 React 렌더링 평균 시간',
      exportDiagnostics: '안전한 오버레이 진단(개인 데이터 없음)을 JSON으로 내보내기',
      wipeDataWarning: '설정 및 추적기를 포함한 모든 확장 데이터를 지웁니다. 심각한 버그가 발생한 경우에만 클릭하세요.'
    },
    wizardNew: {
      restartIntro: '인트로 다시 시작',
      gotIt: "알겠어요, 준비됐습니다!",
      welcomeMessage: '프리미엄 AI 동반자 오버레이 ROEDEX에 오신 것을 환영합니다. 시스템이 완전히 동기화되었으며 부팅할 준비가 되었습니다. 새로운 도구 모음을 탐색하기 위해 온보딩 시퀀스를 초기화하시겠습니까?'
    }
  }
};

['en', 'es', 'ru', 'ko'].forEach(lang => {
  // We need to inject the new objects inside the specific language object
  // Find where `"stats": {` is for that language, and inject right before it.
  
  const searchPattern = new RegExp('(\"' + lang + '\": {[\\s\\S]*?)\"stats\": {');
  
  const match = text.match(searchPattern);
  if (match) {
    let injection = '';
    
    // Add ui
    injection += '"ui": {\n';
    for (const [k, v] of Object.entries(newTranslations[lang].ui)) {
      injection += `      "${k}": "${v.replace(/"/g, '\\"')}",\n`;
    }
    injection += '    },\n    ';

    // Add chestTab
    injection += '"chestTab": {\n';
    for (const [k, v] of Object.entries(newTranslations[lang].chestTab)) {
      injection += `      "${k}": "${v.replace(/"/g, '\\"')}",\n`;
    }
    injection += '    },\n    ';
    
    // Add settingsGroup
    injection += '"settingsGroup": {\n';
    for (const [k, v] of Object.entries(newTranslations[lang].settingsGroup)) {
      injection += `      "${k}": "${v.replace(/"/g, '\\"')}",\n`;
    }
    injection += '    },\n    ';

    // Add debug
    injection += '"debug": {\n';
    for (const [k, v] of Object.entries(newTranslations[lang].debug)) {
      injection += `      "${k}": "${v.replace(/"/g, '\\"')}",\n`;
    }
    injection += '    },\n    ';
    
    text = text.replace(match[0], match[1] + injection + '"stats": {');
    
    // For wizardNew, we append to existing wizard object
    for (const [k, v] of Object.entries(newTranslations[lang].wizardNew)) {
      const wizardSearch = new RegExp('(\"' + lang + '\": {[\\s\\S]*?\"wizard\": {\\n)');
      const wMatch = text.match(wizardSearch);
      if (wMatch) {
         text = text.replace(wMatch[0], wMatch[1] + `      "${k}": "${v.replace(/"/g, '\\"')}",\n`);
      }
    }
  }
});

fs.writeFileSync('src/i18n/translations.ts', text);
console.log('Deep translations updated in translations.ts');
