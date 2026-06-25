const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, '..', 'src', 'i18n', 'translations.ts');

const newTranslations = {
  en: {
    bootSequence: {
      initializing: "INITIALIZING SYSTEM...",
      biometric: "BIOMETRIC SCAN ACCEPTED",
      welcome: "WELCOME",
      calibrating: "CALIBRATING TO",
      online: "ALL SYSTEMS ONLINE",
      skipStep: "SKIP (ENGLISH)",
      systemBoot: "SYSTEM BOOT",
      back: "BACK",
      chooseCompanion: "CHOOSE YOUR AI COMPANION",
      hoverToPreview: "HOVER TO PREVIEW. CLICK TO SELECT & BOOT HUD."
    },
    companions: {
      bob: {
        name: "BOB",
        description: "The Optimistic Explorer. Loves finding new loot and going on adventures.",
        quote: "So... what's our next move?"
      },
      kaya: {
        name: "KAYA",
        description: "The Fiery Oni. Always looking for a fight and massive loot drops!",
        quote: "This waiting around is boring. Let's find something to hit."
      },
      lia: {
        name: "LIA",
        description: "The Elf Mage. A mystical companion focused on magic and rare secrets.",
        quote: "The magical resonance here is quite peculiar..."
      },
      crash: {
        name: "CRASH",
        description: "The Orc Warrior. Brutal and loud, he loves smashing rocks and enemies alike!",
        quote: "Crash hungry. When we eat?"
      }
    },
    tutorial: {
      step1: "Welcome to ROEDEX! This tutorial will cover all overlay features in one go so you don't have to discover them on your own. Click 'NEXT' below to begin.",
      step2: "This is the Global Data tab. It shows all entities near you. Green means alive, red means dead. An orange timer means it's respawning soon!",
      step3: "To see the respawn queue in action, walk around and pick up the same resource or kill the same monster twice!",
      step4: "Hover over any timer to see the upcoming respawn queue. This helps you farm efficiently!",
      step5: "The Session & Loot tab tracks your XP per hour and Runestones per hour. Click 'Start Run' to begin tracking.",
      step6: "Too much clutter? Use this button to pop tabs out into their own floating windows. Try it out!",
      step7: "Use the Merge button to bring all floating windows back into the main view.",
      step8: "The Lock button makes the UI click-through, allowing you to play the game while the overlay stays visible. Double-tap the companion orb to show/hide the UI.",
      step9: "Go ahead, try locking the UI and clicking the game world behind it!",
      step10: "Make sure to unlock the UI when you want to interact with the tabs again.",
      step11: "You can customize settings, alerts, and more in the Settings tab.",
      step12: "That's it! You're ready to use the ROEDEX. Happy farming!",
      next: "NEXT",
      skip: "SKIP",
      finish: "FINISH",
      startRun: "START RUN",
      stopRun: "STOP RUN",
      reset: "RESET",
      step: "Step",
      previous: "Previous",
      awaitingInput: "AWAITING INPUT..."
    },
    changelog: {
      title: "Changelog",
      close: "Close"
    },
    debug: {
      title: "DEBUG MENU",
      fps: "FPS",
      memory: "Memory",
      ping: "Ping",
      version: "Version"
    }
  },
  es: {
    bootSequence: {
      initializing: "INICIALIZANDO SISTEMA...",
      biometric: "ESCANEO BIOMÉTRICO ACEPTADO",
      welcome: "BIENVENIDO",
      calibrating: "CALIBRANDO PARA",
      online: "TODOS LOS SISTEMAS EN LÍNEA",
      skipStep: "OMITIR (ESPAÑOL)",
      systemBoot: "ARRANQUE DEL SISTEMA",
      back: "VOLVER",
      chooseCompanion: "ELIGE TU COMPAÑERO DE IA",
      hoverToPreview: "PASA EL RATÓN PARA VISTA PREVIA. HAZ CLIC PARA SELECCIONAR E INICIAR HUD."
    },
    companions: {
      bob: {
        name: "BOB",
        description: "El Explorador Optimista. Le encanta encontrar nuevos botines e ir de aventuras.",
        quote: "Entonces... ¿cuál es nuestro próximo movimiento?"
      },
      kaya: {
        name: "KAYA",
        description: "La Oni Ardiente. ¡Siempre buscando pelea y grandes botines!",
        quote: "Esta espera es aburrida. Busquemos algo a lo que golpear."
      },
      lia: {
        name: "LIA",
        description: "La Maga Elfa. Una compañera mística centrada en la magia y los secretos raros.",
        quote: "La resonancia mágica aquí es bastante peculiar..."
      },
      crash: {
        name: "CRASH",
        description: "El Guerrero Orco. ¡Brutal y ruidoso, le encanta romper rocas y enemigos por igual!",
        quote: "Crash tiene hambre. ¿Cuándo comemos?"
      }
    },
    tutorial: {
      step1: "¡Bienvenido a ROEDEX! Este tutorial cubrirá todas las características de la interfaz de una sola vez. Haz clic en 'SIGUIENTE' a continuación para comenzar.",
      step2: "Esta es la pestaña de Datos Globales. Muestra todas las entidades cerca de ti. Verde significa vivo, rojo significa muerto. ¡Un temporizador naranja significa que reaparecerá pronto!",
      step3: "Para ver la cola de reaparición en acción, ¡camina y recoge el mismo recurso o mata al mismo monstruo dos veces!",
      step4: "Pasa el ratón sobre cualquier temporizador para ver la próxima cola de reaparición. ¡Esto te ayuda a cultivar de manera eficiente!",
      step5: "La pestaña Sesión y Botín rastrea tu EXP por hora y Piedras Rúnicas por hora. Haz clic en 'Iniciar carrera' para comenzar a rastrear.",
      step6: "¿Demasiado desorden? Usa este botón para sacar pestañas en sus propias ventanas flotantes. ¡Pruébalo!",
      step7: "Usa el botón Fusionar para devolver todas las ventanas flotantes a la vista principal.",
      step8: "El botón de bloqueo hace que la interfaz de usuario sea transparente a los clics, lo que te permite jugar mientras la superposición permanece visible. Toca dos veces el orbe del compañero para mostrar/ocultar la interfaz.",
      step9: "¡Adelante, intenta bloquear la interfaz y hacer clic en el mundo del juego detrás de ella!",
      step10: "Asegúrate de desbloquear la interfaz cuando quieras interactuar con las pestañas nuevamente.",
      step11: "Puedes personalizar la configuración, alertas y más en la pestaña Configuración.",
      step12: "¡Eso es todo! Estás listo para usar ROEDEX. ¡Feliz recolección!",
      next: "SIGUIENTE",
      skip: "OMITIR",
      finish: "TERMINAR",
      startRun: "INICIAR CARRERA",
      stopRun: "DETENER CARRERA",
      reset: "REINICIAR",
      step: "Paso",
      previous: "Anterior",
      awaitingInput: "ESPERANDO ENTRADA..."
    },
    changelog: {
      title: "Registro de cambios",
      close: "Cerrar"
    },
    debug: {
      title: "MENÚ DE DEPURACIÓN",
      fps: "FPS",
      memory: "Memoria",
      ping: "Ping",
      version: "Versión"
    }
  },
  ru: {
    bootSequence: {
      initializing: "ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ...",
      biometric: "БИОМЕТРИЧЕСКОЕ СКАНИРОВАНИЕ ПРИНЯТО",
      welcome: "ДОБРО ПОЖАЛОВАТЬ",
      calibrating: "КАЛИБРОВКА ДЛЯ",
      online: "ВСЕ СИСТЕМЫ В СЕТИ",
      skipStep: "ПРОПУСТИТЬ (РУССКИЙ)",
      systemBoot: "ЗАГРУЗКА СИСТЕМЫ",
      back: "НАЗАД",
      chooseCompanion: "ВЫБЕРИТЕ ИИ КОМПАНЬОНА",
      hoverToPreview: "НАВЕДИТЕ ДЛЯ ПРЕДПРОСМОТРА. КЛИКНИТЕ, ЧТОБЫ ВЫБРАТЬ И ЗАПУСТИТЬ HUD."
    },
    companions: {
      bob: {
        name: "БОБ",
        description: "Оптимистичный Исследователь. Любит находить новый лут и отправляться в приключения.",
        quote: "Итак... каков наш следующий шаг?"
      },
      kaya: {
        name: "КАЙЯ",
        description: "Огненная Они. Всегда ищет драку и огромные кучи лута!",
        quote: "Это ожидание утомляет. Давайте найдем кого-нибудь, кого можно ударить."
      },
      lia: {
        name: "ЛИЯ",
        description: "Эльф-Маг. Мистический компаньон, сосредоточенный на магии и редких секретах.",
        quote: "Магический резонанс здесь весьма специфичен..."
      },
      crash: {
        name: "КРАШ",
        description: "Орк-Воин. Жестокий и громкий, он любит крушить как камни, так и врагов!",
        quote: "Краш голоден. Когда мы едим?"
      }
    },
    tutorial: {
      step1: "Добро пожаловать в ROEDEX! Это руководство охватит все функции оверлея за один раз, чтобы вам не пришлось разбираться в них самостоятельно. Нажмите 'ДАЛЕЕ' ниже, чтобы начать.",
      step2: "Это вкладка Глобальных данных. Она показывает все сущности рядом с вами. Зеленый означает живой, красный - мертвый. Оранжевый таймер означает, что он скоро возродится!",
      step3: "Чтобы увидеть очередь возрождения в действии, походите и соберите один и тот же ресурс или убейте одного и того же монстра дважды!",
      step4: "Наведите курсор на любой таймер, чтобы увидеть предстоящую очередь возрождения. Это поможет вам эффективно фармить!",
      step5: "Вкладка Сессия и Лут отслеживает ваш опыт и рунные камни в час. Нажмите 'Начать забег', чтобы начать отслеживание.",
      step6: "Слишком много беспорядка? Используйте эту кнопку, чтобы вынести вкладки в отдельные плавающие окна. Попробуйте!",
      step7: "Используйте кнопку Объединить, чтобы вернуть все плавающие окна обратно в главный вид.",
      step8: "Кнопка блокировки делает интерфейс прозрачным для кликов, позволяя вам играть в игру, пока оверлей остается видимым. Дважды коснитесь сферы компаньона, чтобы показать/скрыть интерфейс.",
      step9: "Давайте, попробуйте заблокировать интерфейс и кликнуть по игровому миру за ним!",
      step10: "Не забудьте разблокировать интерфейс, когда захотите снова взаимодействовать со вкладками.",
      step11: "Вы можете настроить параметры, оповещения и многое другое на вкладке Настройки.",
      step12: "Вот и все! Вы готовы к использованию ROEDEX. Удачного фарма!",
      next: "ДАЛЕЕ",
      skip: "ПРОПУСТИТЬ",
      finish: "ЗАВЕРШИТЬ",
      startRun: "НАЧАТЬ ЗАБЕГ",
      stopRun: "ОСТАНОВИТЬ ЗАБЕГ",
      reset: "СБРОС",
      step: "Шаг",
      previous: "Назад",
      awaitingInput: "ОЖИДАНИЕ ВВОДА..."
    },
    changelog: {
      title: "Список изменений",
      close: "Закрыть"
    },
    debug: {
      title: "МЕНЮ ОТЛАДКИ",
      fps: "FPS",
      memory: "Память",
      ping: "Пинг",
      version: "Версия"
    }
  },
  ko: {
    bootSequence: {
      initializing: "시스템 초기화 중...",
      biometric: "생체 스캔 수락됨",
      welcome: "환영합니다",
      calibrating: "보정 중",
      online: "모든 시스템 온라인",
      skipStep: "건너뛰기 (한국어)",
      systemBoot: "시스템 부팅",
      back: "뒤로",
      chooseCompanion: "AI 동반자 선택",
      hoverToPreview: "미리 보려면 마우스를 올리세요. 선택 및 HUD를 시작하려면 클릭하세요."
    },
    companions: {
      bob: {
        name: "밥",
        description: "낙관적인 탐험가. 새로운 전리품을 찾고 모험을 떠나는 것을 좋아합니다.",
        quote: "그래서... 다음 계획은 뭐지?"
      },
      kaya: {
        name: "카야",
        description: "불같은 오니. 항상 싸움과 엄청난 전리품 드롭을 찾고 있습니다!",
        quote: "이 기다림은 지루해. 칠 것을 찾자."
      },
      lia: {
        name: "리아",
        description: "엘프 마법사. 마법과 희귀한 비밀에 초점을 맞춘 신비로운 동반자입니다.",
        quote: "이곳의 마법 공명은 꽤 특이하군요..."
      },
      crash: {
        name: "크래시",
        description: "오크 전사. 잔인하고 시끄러우며, 바위와 적을 부수는 것을 좋아합니다!",
        quote: "크래시 배고프다. 언제 먹어?"
      }
    },
    tutorial: {
      step1: "ROEDEX에 오신 것을 환영합니다! 이 튜토리얼에서는 오버레이 기능을 한 번에 다루므로 직접 알아낼 필요가 없습니다. 시작하려면 아래 '다음'을 클릭하세요.",
      step2: "이것은 글로벌 데이터 탭입니다. 근처의 모든 개체를 보여줍니다. 녹색은 살아있음을, 빨간색은 죽었음을 의미합니다. 주황색 타이머는 곧 다시 생성됨을 의미합니다!",
      step3: "재생성 대기열이 작동하는 것을 보려면 주변을 돌아다니며 동일한 자원을 줍거나 동일한 몬스터를 두 번 처치하세요!",
      step4: "타이머 위에 마우스를 올리면 다가오는 재생성 대기열을 볼 수 있습니다. 이것은 효율적으로 파밍하는 데 도움이 됩니다!",
      step5: "세션 및 전리품 탭은 시간당 XP와 시간당 룬스톤을 추적합니다. 추적을 시작하려면 '실행 시작'을 클릭하세요.",
      step6: "화면이 너무 복잡합니까? 이 버튼을 사용하여 탭을 독립된 부동 창으로 꺼냅니다. 사용해 보세요!",
      step7: "병합 버튼을 사용하여 모든 부동 창을 기본 보기로 다시 가져옵니다.",
      step8: "잠금 버튼을 사용하면 UI를 클릭하여 통과할 수 있으므로 오버레이가 표시된 상태에서 게임을 즐길 수 있습니다. 동반자 구체를 두 번 탭하여 UI를 표시하거나 숨깁니다.",
      step9: "자, UI를 잠그고 그 뒤에 있는 게임 세계를 클릭해 보세요!",
      step10: "탭과 다시 상호 작용하려면 UI의 잠금을 해제해야 합니다.",
      step11: "설정 탭에서 설정, 알림 등을 사용자 지정할 수 있습니다.",
      step12: "끝입니다! 이제 ROEDEX를 사용할 준비가 되었습니다. 즐거운 파밍 되세요!",
      next: "다음",
      skip: "건너뛰기",
      finish: "완료",
      startRun: "실행 시작",
      stopRun: "실행 중지",
      reset: "초기화",
      step: "단계",
      previous: "이전",
      awaitingInput: "입력 대기 중..."
    },
    changelog: {
      title: "변경 로그",
      close: "닫기"
    },
    debug: {
      title: "디버그 메뉴",
      fps: "FPS",
      memory: "메모리",
      ping: "핑",
      version: "버전"
    }
  }
};

try {
  let content = fs.readFileSync(translationsPath, 'utf8');
  
  // Use a simple AST or regex approach to merge the keys into each language object
  for (const lang of Object.keys(newTranslations)) {
    const sectionStartRegex = new RegExp(`^\\s*${lang}:\\s*\\{`, 'm');
    const match = content.match(sectionStartRegex);
    
    if (match) {
      const insertionIndex = match.index + match[0].length;
      
      let insertion = `\n    bootSequence: ${JSON.stringify(newTranslations[lang].bootSequence, null, 6)},\n`;
      insertion += `    companions: ${JSON.stringify(newTranslations[lang].companions, null, 6)},\n`;
      insertion += `    tutorial: ${JSON.stringify(newTranslations[lang].tutorial, null, 6)},\n`;
      insertion += `    changelog: ${JSON.stringify(newTranslations[lang].changelog, null, 6)},\n`;
      insertion += `    debug: ${JSON.stringify(newTranslations[lang].debug, null, 6)},`;
      
      // Fix indentation for the injected JSON stringification
      insertion = insertion.replace(/\"([a-zA-Z0-9_]+)\":/g, "$1:");
      insertion = insertion.replace(/\n}/g, "\n    }");
      
      content = content.slice(0, insertionIndex) + insertion + content.slice(insertionIndex);
    }
  }

  fs.writeFileSync(translationsPath, content, 'utf8');
  console.log("Successfully updated translations.ts");
} catch (e) {
  console.error("Failed to update translations.ts", e);
}
