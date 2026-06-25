const fs = require('fs');
let text = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const newWizard = {
  en: {
    calibratingHold: 'Calibrating... Hold steady.',
    hoverToTest: 'Hover here for 5 seconds to test response time',
    continueBtn: 'Continue',
    systemLangTest: 'System Language & Latency Test',
    langDesc: 'Select your preferred language. Before proceeding, please hover the test block below for 5 seconds to calibrate the overlay response time.',
    selectAiCompanion: 'Select AI Companion',
    selectAiDesc: 'Choose the AI persona that will assist you. You can change this later in settings.',
    readyToExplore: 'Ready to Explore',
    readyDesc: 'ROEDEX is now fully configured for your environment.',
    finishSetup: 'Finish Setup'
  },
  es: {
    calibratingHold: 'Calibrando... Mantente firme.',
    hoverToTest: 'Pasa el cursor aquí durante 5 segundos para probar',
    continueBtn: 'Continuar',
    systemLangTest: 'Prueba de Idioma y Latencia del Sistema',
    langDesc: 'Selecciona tu idioma preferido. Antes de continuar, pasa el cursor sobre el bloque de prueba a continuación durante 5 segundos para calibrar el tiempo de respuesta.',
    selectAiCompanion: 'Selecciona el Compañero de IA',
    selectAiDesc: 'Elige la persona de IA que te asistirá. Puedes cambiar esto más adelante en la configuración.',
    readyToExplore: 'Listo para Explorar',
    readyDesc: 'ROEDEX ahora está completamente configurado para tu entorno.',
    finishSetup: 'Finalizar Configuración'
  },
  ru: {
    calibratingHold: 'Калибровка... Не двигайтесь.',
    hoverToTest: 'Наведите курсор сюда на 5 секунд для проверки',
    continueBtn: 'Продолжить',
    systemLangTest: 'Тест языка системы и задержки',
    langDesc: 'Выберите предпочитаемый язык. Перед тем как продолжить, наведите курсор на тестовый блок ниже на 5 секунд, чтобы откалибровать время отклика оверлея.',
    selectAiCompanion: 'Выберите ИИ-Компаньона',
    selectAiDesc: 'Выберите ИИ, который будет вам помогать. Вы можете изменить это позже в настройках.',
    readyToExplore: 'Готово к исследованию',
    readyDesc: 'ROEDEX теперь полностью настроен для вашей среды.',
    finishSetup: 'Завершить настройку'
  },
  ko: {
    calibratingHold: '보정 중... 계속 유지하세요.',
    hoverToTest: '응답 시간을 테스트하려면 여기를 5초 동안 가리키세요',
    continueBtn: '계속하기',
    systemLangTest: '시스템 언어 및 지연 시간 테스트',
    langDesc: '선호하는 언어를 선택하세요. 계속하기 전에 오버레이 응답 시간을 보정하기 위해 아래 테스트 블록 위로 5초 동안 마우스를 올려 놓으세요.',
    selectAiCompanion: 'AI 동반자 선택',
    selectAiDesc: '당신을 도울 AI 페르소나를 선택하세요. 나중에 설정에서 변경할 수 있습니다.',
    readyToExplore: '탐색 준비 완료',
    readyDesc: 'ROEDEX가 이제 귀하의 환경에 맞게 완전히 구성되었습니다.',
    finishSetup: '설정 완료'
  }
};

['en', 'es', 'ru', 'ko'].forEach(lang => {
  for (const [key, val] of Object.entries(newWizard[lang])) {
    const searchString = '"wizard": {\n';
    const replaceString = '"wizard": {\n      "' + key + '": "' + val + '",\n';
    text = text.replace(searchString, replaceString);
  }
});

fs.writeFileSync('src/i18n/translations.ts', text);
console.log('Translations updated.');
