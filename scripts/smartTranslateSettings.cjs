const fs = require('fs');

const newTranslations = {
  compactMode: { en: "Compact Mode", es: "Modo Compacto", ru: "Компактный режим", ko: "컴팩트 모드" },
  standardMode: { en: "Standard Mode", es: "Modo Estándar", ru: "Стандартный режим", ko: "표준 모드" },
  groupedByZone: { en: "Grouped by Zone", es: "Agrupado por Zona", ru: "Сгруппировано по зоне", ko: "지역별 그룹화" },
  simpleTitles: { en: "Simple Titles", es: "Títulos Simples", ru: "Простые заголовки", ko: "간단한 제목" },
  globalUiScale: { en: "Global UI Scale (4K/2K Displays)", es: "Escala de UI Global", ru: "Глобальный масштаб UI", ko: "글로벌 UI 비율" },
  customImageUrl: { en: "Custom Image URL", es: "URL de Imagen Personalizada", ru: "Свой URL изображения", ko: "사용자 지정 이미지 URL" },
  orbBorderThickness: { en: "Orb Border Thickness", es: "Grosor de Borde del Orbe", ru: "Толщина границы сферы", ko: "구슬 테두리 두께" },
  autoMinimizeChest: { en: "Auto-Minimize on Chest Open", es: "Auto-Minimizar al Abrir Cofre", ru: "Авто-сворачивание при открытии сундука", ko: "상자 열 때 자동 최소화" },
  minimizeHotkey: { en: "Minimize Hotkey", es: "Tecla de Minimizar", ru: "Горячая клавиша сворачивания", ko: "최소화 단축키" },
  toggleLayoutHotkey: { en: "Layout Hotkey", es: "Tecla de Diseño", ru: "Горячая клавиша макета", ko: "레이아웃 단축키" },
  resetSizeHotkey: { en: "Reset Hotkey", es: "Tecla de Reinicio", ru: "Горячая клавиша сброса", ko: "재설정 단축키" },
  lockUiHotkey: { en: "Lock Overlay Hotkey", es: "Tecla para Bloquear", ru: "Горячая клавиша блокировки", ko: "오버레이 잠금 단축키" },

  enableWeaponOverlay: { en: "Enable Weapon Overlay", es: "Habilitar Superposición de Armas", ru: "Включить оверлей оружия", ko: "무기 오버레이 활성화" },
  enableArmorOverlay: { en: "Enable Armor Overlay", es: "Habilitar Superposición de Armadura", ru: "Включить оверлей брони", ko: "방어구 오버레이 활성화" },
  lockPosition: { en: "Lock Position", es: "Bloquear Posición", ru: "Заблокировать позицию", ko: "위치 잠금" },
  displayAppearance: { en: "DISPLAY & APPEARANCE", es: "PANTALLA Y APARIENCIA", ru: "ОТОБРАЖЕНИЕ И ВНЕШНИЙ ВИД", ko: "디스플레이 및 외관" },
  layout: { en: "Layout", es: "Diseño", ru: "Макет", ko: "레이아웃" },
  horizontal: { en: "Horizontal", es: "Horizontal", ru: "Горизонтально", ko: "가로" },
  vertical: { en: "Vertical", es: "Vertical", ru: "Вертикально", ko: "세로" },
  style: { en: "Style", es: "Estilo", ru: "Стиль", ko: "스타일" },
  barOnly: { en: "Bar Only", es: "Solo Barra", ru: "Только полоса", ko: "바만" },
  textPercent: { en: "Text (Percentage)", es: "Texto (Porcentaje)", ru: "Текст (Процент)", ko: "텍스트 (백분율)" },
  textDurability: { en: "Text (Durability)", es: "Texto (Durabilidad)", ru: "Текст (Прочность)", ko: "텍스트 (내구도)" },
  barPercent: { en: "Bar + Percentage", es: "Barra + Porcentaje", ru: "Полоса + Процент", ko: "바 + 백분율" },
  barDurability: { en: "Bar + Durability", es: "Barra + Durabilidad", ru: "Полоса + Прочность", ko: "바 + 내구도" },
  enableAnimations: { en: "Enable Animations", es: "Habilitar Animaciones", ru: "Включить анимации", ko: "애니메이션 활성화" },
  width: { en: "Width", es: "Ancho", ru: "Ширина", ko: "너비" },
  heightBar: { en: "Height (Bar)", es: "Altura (Barra)", ru: "Высота (Полоса)", ko: "높이 (바)" },
  scale: { en: "Scale", es: "Escala", ru: "Масштаб", ko: "비율" },
  opacity: { en: "Opacity", es: "Opacidad", ru: "Непрозрачность", ko: "불투명도" },
  bgRadius: { en: "Background Radius", es: "Radio del Fondo", ru: "Радиус фона", ko: "배경 반경" },
  bgBlur: { en: "Background Blur", es: "Desenfoque del Fondo", ru: "Размытие фона", ko: "배경 흐림" },
  borderSettings: { en: "BORDER SETTINGS", es: "CONFIGURACIÓN DE BORDE", ru: "НАСТРОЙКИ ГРАНИЦЫ", ko: "테두리 설정" },
  borderThickness: { en: "Border Thickness", es: "Grosor del Borde", ru: "Толщина границы", ko: "테두리 두께" },
  dynamicColor: { en: "Dynamic Color (Match Health)", es: "Color Dinámico (Según Salud)", ru: "Динамичный цвет", ko: "동적 색상 (체력 비례)" },
  alertsAnchor: { en: "ALERTS & ANCHOR", es: "ALERTAS Y ANCLAJE", ru: "ОПОВЕЩЕНИЯ И ЯКОРЬ", ko: "알림 및 앵커" },
  enableAlerts: { en: "Enable Alerts", es: "Habilitar Alertas", ru: "Включить оповещения", ko: "알림 활성화" },
  alertThreshold: { en: "Alert Threshold", es: "Umbral de Alerta", ru: "Порог оповещения", ko: "알림 임계값" },
  anchorPosition: { en: "Anchor Position", es: "Posición de Anclaje", ru: "Позиция якоря", ko: "앵커 위치" },
  topLeft: { en: "Top Left", es: "Arriba Izquierda", ru: "Сверху слева", ko: "상단 왼쪽" },
  topRight: { en: "Top Right", es: "Arriba Derecha", ru: "Сверху справа", ko: "상단 오른쪽" },
  bottomLeft: { en: "Bottom Left", es: "Abajo Izquierda", ru: "Снизу слева", ko: "하단 왼쪽" },
  bottomRight: { en: "Bottom Right", es: "Abajo Derecha", ru: "Снизу справа", ko: "하단 오른쪽" },
  customDragged: { en: "Custom Dragged", es: "Arrastrado Personalizado", ru: "Пользовательская позиция", ko: "사용자 드래그" },

  session: { en: "Session", es: "Sesión", ru: "Сессия", ko: "세션" },
  profile: { en: "Profile", es: "Perfil", ru: "Профиль", ko: "프로필" },
  currentZone: { en: "Current Zone", es: "Zona Actual", ru: "Текущая зона", ko: "현재 지역" },
  minimalChestHud: { en: "MINIMAL CHEST HUD", es: "HUD MINIMALISTA DE COFRES", ru: "МИНИМАЛИСТИЧНЫЙ HUD СУНДУКОВ", ko: "최소 상자 HUD" },
  enableMinimalChestHud: { en: "Enable Minimal Chest HUD", es: "Habilitar HUD Minimalista", ru: "Включить минималистичный HUD", ko: "최소 상자 HUD 활성화" },
  lockMinimalChest: { en: "Lock Minimal Chest", es: "Bloquear Cofre Minimalista", ru: "Заблокировать сундук", ko: "최소 상자 잠금" },
  globalDataTable: { en: "GLOBAL DATA TABLE", es: "TABLA DE DATOS GLOBALES", ru: "ТАБЛИЦА ГЛОБАЛЬНЫХ ДАННЫХ", ko: "글로벌 데이터 테이블" },
  showDistanceColumn: { en: "Show Distance Column", es: "Mostrar Columna de Distancia", ru: "Показать колонку дистанции", ko: "거리 기둥 표시" },
  showCountsAliveDead: { en: "Show Counts (Alive/Dead)", es: "Mostrar Conteos (Vivo/Muerto)", ru: "Показать счетчики", ko: "수 표시 (생존/사망)" },
  showRespawnTimers: { en: "Show Respawn Timers", es: "Mostrar Temporizadores", ru: "Показать таймеры респауна", ko: "리스폰 타이머 표시" },
  raritySort: { en: "Rarity Sort (When Distance Off)", es: "Ordenar por Rareza", ru: "Сортировка по редкости", ko: "희귀도 정렬" },
  rarityAlpha: { en: "Rarity Alpha (Opacity)", es: "Opacidad de Rareza", ru: "Непрозрачность редкости", ko: "희귀도 투명도" },
  upcomingRespawnsLimit: { en: "Upcoming Respawns Tooltip Limit", es: "Límite de Tooltip", ru: "Лимит подсказок респауна", ko: "다가오는 리스폰 툴팁 제한" },
  show3: { en: "Show 3", es: "Mostrar 3", ru: "Показать 3", ko: "3개 표시" },
  show5: { en: "Show 5", es: "Mostrar 5", ru: "Показать 5", ko: "5개 표시" },
  show10: { en: "Show 10", es: "Mostrar 10", ru: "Показать 10", ko: "10개 표시" },
  showAll: { en: "Show All", es: "Mostrar Todos", ru: "Показать все", ko: "모두 표시" },
  resetHudTutorial: { en: "Reset HUD Tutorial", es: "Reiniciar Tutorial HUD", ru: "Сбросить обучение HUD", ko: "HUD 튜토리얼 재설정" },
  
  toastNotifications: { en: "TOAST NOTIFICATIONS", es: "NOTIFICACIONES TOAST", ru: "ВСПЛЫВАЮЩИЕ УВЕДОМЛЕНИЯ", ko: "토스트 알림" },
  enableToasts: { en: "Enable Toasts", es: "Habilitar Toasts", ru: "Включить Toasts", ko: "토스트 활성화" },
  toastPosition: { en: "Toast Position", es: "Posición del Toast", ru: "Позиция Toast", ko: "토스트 위치" },
  toastDuration: { en: "Toast Duration", es: "Duración del Toast", ru: "Длительность Toast", ko: "토스트 지속 시간" },
  soundAlerts: { en: "SOUND ALERTS", es: "ALERTAS DE SONIDO", ru: "ЗВУКОВЫЕ ОПОВЕЩЕНИЯ", ko: "소리 알림" },
  enableSounds: { en: "Enable Sounds", es: "Habilitar Sonidos", ru: "Включить звуки", ko: "소리 활성화" },
  volume: { en: "Volume", es: "Volumen", ru: "Громкость", ko: "볼륨" },
  uiPopups: { en: "UI POPUPS", es: "VENTANAS EMERGENTES UI", ru: "ВСПЛЫВАЮЩИЕ ОКНА UI", ko: "UI 팝업" },
  showLevelUp: { en: "Show Level Up Popups", es: "Mostrar Popups de Subida de Nivel", ru: "Показать окно повышения уровня", ko: "레벨업 팝업 표시" },
  topCenter: { en: "Top Center", es: "Arriba Centro", ru: "Сверху по центру", ko: "상단 중앙" },
  bottomCenter: { en: "Bottom Center", es: "Abajo Centro", ru: "Снизу по центру", ko: '하단 중앙' },
  
  viewChangelog: { en: "View Project Changelogs", es: "Ver Registros de Cambios", ru: "Смотреть журнал изменений", ko: "프로젝트 변경 로그 보기" },
  readMore: { en: "Read More", es: "Leer Más", ru: "Читать далее", ko: "더 읽기" },
  supportDevelopment: { en: "Support Development", es: "Apoyar el Desarrollo", ru: "Поддержать разработку", ko: "개발 지원" },
  donationDesc: { en: "ROEDEX is an open-source project maintained by the community. If you would like to support ongoing development and server costs, you can do so via the addresses below. Contributions are strictly optional but greatly appreciated.", es: "ROEDEX es un proyecto de código abierto mantenido por la comunidad. Si deseas apoyar...", ru: "ROEDEX — это проект с открытым исходным кодом...", ko: "ROEDEX는 커뮤니티에서 유지 관리하는 오픈 소스 프로젝트입니다..." },
  verifyNetwork: { en: "Note: Please verify the network before sending any crypto", es: "Nota: Por favor, verifica la red antes de enviar", ru: "Примечание: пожалуйста, проверьте сеть перед отправкой", ko: "참고: 암호화폐를 보내기 전에 네트워크를 확인하십시오" },
  credits: { en: "Credits & Acknowledgements", es: "Créditos y Agradecimientos", ru: "Благодарности", ko: "크레딧 및 감사" },
  dev: { en: "Lead Developer & Creator", es: "Desarrollador Principal y Creador", ru: "Ведущий разработчик и создатель", ko: "수석 개발자 및 제작자" },
  
  // Now the missing ones from UI:
  pressAnyKey: { en: "PRESS ANY KEY...", es: "PRESIONA CUALQUIER TECLA...", ru: "НАЖМИТЕ ЛЮБУЮ КЛАВИШУ...", ko: "아무 키나 누르세요..." },
  themeDark: { en: "Dark Mode (Default)", es: "Modo Oscuro", ru: "Темный режим", ko: "다크 모드" },
  themeBob: { en: "Bob's Adventure (Premium)", es: "Aventura de Bob (Premium)", ru: "Приключение Боба (Премиум)", ko: "밥의 모험 (프리미엄)" },
  themeKaya: { en: "Kaya's Flame (Premium)", es: "Llama de Kaya (Premium)", ru: "Пламя Кайи (Премиум)", ko: "카야의 불꽃 (프리미엄)" },
  themeLia: { en: "Lia's Magic (Premium)", es: "Magia de Lia (Premium)", ru: "Магия Лии (Премиум)", ko: "리아의 마법 (프리미엄)" },
  themeCrash: { en: "Crash's Resolve (Premium)", es: "Resolución de Crash (Premium)", ru: "Решимость Крэша (Премиум)", ko: "크래쉬의 결의 (프리미엄)" },
  themeAbstract: { en: "Abstract Chain (Premium)", es: "Cadena Abstracta (Premium)", ru: "Абстрактная цепь (Премиум)", ko: "추상적인 체인 (프리미엄)" },
  themeObsidian: { en: "Obsidian Gold (Premium)", es: "Oro Obsidiana (Premium)", ru: "Обсидиановое Золото (Премиум)", ko: "흑요석 골드 (프리미엄)" },
  themeCyberpunk: { en: "Neon Cyberpunk (Premium)", es: "Cyberpunk Neón (Premium)", ru: "Неоновый Киберпанк (Премиум)", ko: "네온 사이버펑크 (프리미엄)" },
  themeHologram: { en: "Holographic Blue (Premium)", es: "Azul Holográfico (Premium)", ru: "Голографический Синий (Премиум)", ko: "홀로그램 블루 (프리미엄)" },
  themeAmethyst: { en: "Amethyst Violet (Premium)", es: "Violeta Amatista (Premium)", ru: "Аметистовый Фиолетовый (Премиум)", ko: "자수정 바이올렛 (프리미엄)" },
  themeRuby: { en: "Ruby Glass (Premium)", es: "Cristal Rubí (Premium)", ru: "Рубиновое стекло (Премиум)", ko: "루비 글래스 (프리미엄)" },
  themeOcean: { en: "Ocean Blue", es: "Azul Océano", ru: "Океанский Синий", ko: "오션 블루" },
  themeCrimson: { en: "Crimson Red", es: "Rojo Carmesí", ru: "Багрово-красный", ko: "크림슨 레드" },
  themeMidnight: { en: "Midnight Black", es: "Negro Medianoche", ru: "Полуночно-черный", ko: "미드나잇 블랙" },
  themeTokyo: { en: "Tokyo Night", es: "Noche de Tokio", ru: "Токийская Ночь", ko: "도쿄 나이트" },
  themeLight: { en: "Light Mode", es: "Modo Claro", ru: "Светлый режим", ko: "라이트 모드" },
  
  iconPulse: { en: "Tracking Pulse", es: "Pulso de Rastreo", ru: "Импульс отслеживания", ko: "추적 펄스" },
  iconLightning: { en: "Lightning", es: "Rayo", ru: "Молния", ko: "번개" },
  iconSword: { en: "Sword", es: "Espada", ru: "Меч", ko: "검" },
  iconPickaxe: { en: "Pickaxe", es: "Pico", ru: "Кирка", ko: "곡괭이" },
  iconShield: { en: "Shield", es: "Escudo", ru: "Щит", ko: "방패" },
  iconRoedex: { en: "ROEDEX", es: "ROEDEX", ru: "ROEDEX", ko: "ROEDEX" },
  iconRx: { en: "RX", es: "RX", ru: "RX", ko: "RX" },
  
  behavior: { en: "BEHAVIOR", es: "COMPORTAMIENTO", ru: "ПОВЕДЕНИЕ", ko: "행동" },
  bobEnableDesc: { en: "Turns the on-screen companion on or off entirely.", es: "Activa o desactiva el compañero.", ru: "Включает или выключает компаньона.", ko: "화면 동반자를 완전히 켜거나 끕니다." },
  bobChattyDesc: { en: 'How often Bob makes comments. Spammy = reacts to everything.', es: 'Con qué frecuencia hace comentarios.', ru: 'Как часто Боб делает комментарии.', ko: '밥이 코멘트를 하는 빈도입니다.' },
  bobVoiceDesc: { en: 'Which TTS voice Bob uses. Requires Enable Sounds in Notifications.', es: 'Qué voz usa.', ru: 'Каким голосом говорит Боб.', ko: '밥이 사용하는 음성입니다.' },
  bobPitchDesc: { en: 'Adjust the vocal pitch (high/low) of the selected voice.', es: 'Ajustar el tono vocal.', ru: 'Отрегулируйте высоту тона.', ko: '보컬 피치를 조정합니다.' },
  bobSpeedDesc: { en: 'Adjust how fast Bob speaks.', es: 'Ajustar la velocidad.', ru: 'Отрегулируйте скорость.', ko: '말하는 속도를 조절합니다.' },
  companionPositionDesc: { en: 'Where Bob renders on the screen.', es: 'Dónde aparece.', ru: 'Где находится компаньон.', ko: '화면에 렌더링되는 위치.' },
  chatSpammy: { en: 'Spammy', es: 'Spam', ru: 'Спам', ko: '스팸성' },
  chatNormal: { en: 'Normal', es: 'Normal', ru: 'Обычный', ko: '보통' },
  chatQuiet: { en: 'Quiet', es: 'Silencioso', ru: 'Тихий', ko: '조용함' },
  voiceRobot: { en: 'Robotic (Default)', es: 'Robótico', ru: 'Роботизированный', ko: '로봇 음성' },
  voiceDeep: { en: 'Deep Male', es: 'Masculino Profundo', ru: 'Низкий мужской', ko: '깊은 남성 음성' },
  voiceHigh: { en: 'High Female', es: 'Femenino Alto', ru: 'Высокий женский', ko: '높은 여성 음성' },
  voiceChipmunk: { en: 'Chipmunk', es: 'Ardilla', ru: 'Бурундук', ko: '다람쥐 음성' },
  personality: { en: 'PERSONALITY & VOICE', es: 'PERSONALIDAD Y VOZ', ru: 'ХАРАКТЕР И ГОЛОС', ko: '성격 및 목소리' },
  appearance: { en: 'APPEARANCE', es: 'APARIENCIA', ru: 'ВНЕШНИЙ ВИД', ko: '외관' },
  developerMode: { en: 'Developer Mode', es: 'Modo Desarrollador', ru: 'Режим разработчика', ko: '개발자 모드' },
  devModeEnabled: { en: 'Developer mode enabled', es: 'Modo desarrollador activado', ru: 'Режим разработчика включен', ko: '개발자 모드 활성화됨' },
  devModeWarning: { en: 'Advanced settings have been unlocked.', es: 'Configuraciones avanzadas desbloqueadas.', ru: 'Расширенные настройки разблокированы.', ko: '고급 설정이 잠금 해제되었습니다.' },
  devModeDesc: { en: 'Enables experimental features and advanced debugging tools.', es: 'Habilita características experimentales.', ru: 'Включает экспериментальные функции.', ko: '실험적 기능을 활성화합니다.' },
  dangerZone: { en: 'DANGER ZONE', es: 'ZONA DE PELIGRO', ru: 'ОПАСНАЯ ЗОНА', ko: '위험 구역' },
  wipeDatabaseDesc: { en: 'This will completely wipe all collected data, settings, and session history.', es: 'Borra todos los datos.', ru: 'Удаляет все данные.', ko: '모든 데이터를 삭제합니다.' },
  hardResetConfirm: { en: 'Are you sure? This cannot be undone.', es: '¿Estás seguro?', ru: 'Вы уверены?', ko: '확실합니까?' },
  hardResetDatabase: { en: 'Hard Reset Database', es: 'Restablecimiento Completo', ru: 'Полный сброс', ko: '하드 리셋' }
};

let fileContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');

for (const lang of ['en', 'es', 'ru', 'ko']) {
  const langRegex = new RegExp(`^\\s*${lang}:\\s*\\{[\\s\\S]*?^\\s*settings:\\s*\\{`, 'm');
  const match = fileContent.match(langRegex);
  
  if (match) {
    let blockStartIndex = match.index + match[0].length;
    let braceCount = 1;
    let endIndex = blockStartIndex;
    
    for (let i = blockStartIndex; i < fileContent.length; i++) {
        if (fileContent[i] === '{') braceCount++;
        else if (fileContent[i] === '}') braceCount--;
        
        if (braceCount === 0) {
            endIndex = i;
            break;
        }
    }
    
    let settingsBlock = fileContent.slice(blockStartIndex, endIndex);
    
    let injection = '';
    for (const [key, transObj] of Object.entries(newTranslations)) {
      if (!settingsBlock.includes(`${key}:`)) {
        injection += `      ${key}: "${transObj[lang].replace(/"/g, '\\"')}",\n`;
      }
    }
    
    if (injection) {
        fileContent = fileContent.slice(0, blockStartIndex) + '\n' + injection + fileContent.slice(blockStartIndex);
    }
  }
}

fs.writeFileSync('src/i18n/translations.ts', fileContent);
console.log('Smartly injected translations into translations.ts');
