const fs = require('fs');

const en = {
  general: {
    themeDensity: 'THEME & DENSITY',
    uiTheme: 'UI Theme',
    displayDensity: 'Display Density',
    layoutOpacity: 'LAYOUT & OPACITY',
    verticalLayout: 'Vertical Layout',
    activeOpacity: 'Active Opacity',
    idleOpacity: 'Idle Opacity',
    minimizedState: 'MINIMIZED STATE',
    minimizedOrbSize: 'Minimized Orb Size',
    minimizedIcon: 'Minimized Icon',
    snappingRadius: 'Snapping Radius',
    compactMode: 'Compact Mode',
    layoutOptions: {
      vertical: 'Vertical',
      horizontal: 'Horizontal',
      grid: 'Grid'
    }
  },
  tracking: {
    displayMode: 'DISPLAY MODE',
    viewMode: 'View Mode',
    viewOptions: { session: 'Session', profile: 'Profile' },
    globalDataTable: 'GLOBAL DATA TABLE',
    showDistance: 'Show Distance Column',
    showCounts: 'Show Counts (Alive/Dead)',
    showTimers: 'Show Respawn Timers',
    raritySort: 'Rarity Sort (When Distance Off)',
    rarityOptions: { mythic: 'Mythic -> ...', common: 'Common -> ...' },
    tooltipLimit: 'Upcoming Respawns Tooltip Limit',
    tooltipOptions: { show3: 'Show 3', show5: 'Show 5', show10: 'Show 10', showAll: 'Show All' },
    dataManagement: 'DATA MANAGEMENT',
    resetLoot: 'Reset Loot Session',
    clearCache: 'Clear Session Cache'
  },
  overlay: {
    enableWeapon: 'Enable Weapon Overlay',
    enableArmor: 'Enable Armor Overlay',
    lockPosition: 'Lock Position',
    displayAppearance: 'DISPLAY & APPEARANCE',
    layout: 'Layout',
    layoutOptions: { vertical: 'Vertical Stack', horizontal: 'Horizontal Row' },
    style: 'Style',
    styleOptions: {
      bar: 'Bar Only',
      text_percent: 'Text (Percentage)',
      text_durability: 'Text (Durability)',
      bar_percent: 'Bar + Percentage',
      bar_durability: 'Bar + Durability'
    },
    enableAnimations: 'Enable Animations',
    width: 'Width',
    height: 'Height (Bar)',
    scale: 'Scale',
    opacity: 'Opacity',
    bgRadius: 'Background Radius',
    bgBlur: 'Background Blur',
    borderSettings: 'BORDER SETTINGS',
    borderThickness: 'Border Thickness',
    dynamicColor: 'Dynamic Color (Match Health)',
    alertsAnchor: 'ALERTS & ANCHOR',
    enableAlerts: 'Enable Alerts',
    alertThreshold: 'Alert Threshold',
    anchorPosition: 'Anchor Position',
    anchorOptions: {
      topLeft: 'Top Left', topRight: 'Top Right', bottomLeft: 'Bottom Left', bottomRight: 'Bottom Right', custom: 'Custom Dragged'
    }
  },
  notifications: {
    toastNotifications: 'TOAST NOTIFICATIONS',
    enableToasts: 'Enable Toasts',
    toastPosition: 'Toast Position',
    toastPositionOptions: {
      topLeft: 'Top Left', topCenter: 'Top Center', topRight: 'Top Right',
      bottomLeft: 'Bottom Left', bottomCenter: 'Bottom Center', bottomRight: 'Bottom Right'
    },
    toastDuration: 'Toast Duration',
    soundAlerts: 'SOUND ALERTS',
    enableSounds: 'Enable Sounds',
    volume: 'Volume',
    uiPopups: 'UI POPUPS',
    showLevelUp: 'Show Level Up Popups',
    showRareDrop: 'Show Rare Drop Popups'
  },
  companion: {
    personalityBehavior: 'PERSONALITY & BEHAVIOR',
    chatFrequency: 'Chat Frequency',
    frequencyOptions: { silent: 'Silent', rare: 'Rare', normal: 'Normal', frequent: 'Frequent', nonstop: 'Non-stop' },
    personalityMode: 'Personality Mode',
    modeOptions: { helpful: 'Helpful', sarcastic: 'Sarcastic', aggressive: 'Aggressive', mystical: 'Mystical' },
    showFaceCam: 'Show Face Cam',
    enableVoiceLines: 'Enable Voice Lines'
  },
  about: {
    version: 'v0.0.1 • Open Source',
    desc: 'ROEDEX is a high-performance tracking suite built exclusively for the community. Designed from the ground up to be seamless, beautiful, and completely free. Our mission is to provide you with the most advanced set of tools to optimize your runs, track rare drops, and conquer your adventures.',
    viewChangelogs: 'View Project Changelogs',
    readMore: 'Read More ➔',
    supportDev: 'Support Development',
    supportDesc: 'ROEDEX is an open-source project maintained by the community. If you would like to support ongoing development and server costs, you can do so via the addresses below. Contributions are strictly optional but greatly appreciated.',
    networkNote: '(Note: Please verify the network before sending any crypto)',
    youtube: 'YouTube',
    x: 'X',
    github: 'GitHub',
    creditsTitle: 'Credits & Acknowledgements',
    leadDev: 'Lead Developer & Creator',
    guidance: 'Guidance & Contributions'
  },
  changelog: {
    whatsNew: "✨ What's New",
    fixesAndImprov: 'Fixes & Improvements'
  }
};

const es = {
  general: {
    themeDensity: 'TEMA Y DENSIDAD',
    uiTheme: 'Tema UI',
    displayDensity: 'Densidad de Pantalla',
    layoutOpacity: 'DISEÑO Y OPACIDAD',
    verticalLayout: 'Diseño Vertical',
    activeOpacity: 'Opacidad Activa',
    idleOpacity: 'Opacidad Inactiva',
    minimizedState: 'ESTADO MINIMIZADO',
    minimizedOrbSize: 'Tamaño del Orbe',
    minimizedIcon: 'Icono Minimizado',
    snappingRadius: 'Radio de Ajuste',
    compactMode: 'Modo Compacto',
    layoutOptions: { vertical: 'Vertical', horizontal: 'Horizontal', grid: 'Cuadrícula' }
  },
  tracking: {
    displayMode: 'MODO DE VISUALIZACIÓN',
    viewMode: 'Modo de Vista',
    viewOptions: { session: 'Sesión', profile: 'Perfil' },
    globalDataTable: 'TABLA DE DATOS GLOBALES',
    showDistance: 'Mostrar Columna de Distancia',
    showCounts: 'Mostrar Conteos (Vivo/Muerto)',
    showTimers: 'Mostrar Temporizadores',
    raritySort: 'Ordenar por Rareza (Sin Distancia)',
    rarityOptions: { mythic: 'Mítico -> ...', common: 'Común -> ...' },
    tooltipLimit: 'Límite de Tooltip de Reapariciones',
    tooltipOptions: { show3: 'Mostrar 3', show5: 'Mostrar 5', show10: 'Mostrar 10', showAll: 'Mostrar Todos' },
    dataManagement: 'GESTIÓN DE DATOS',
    resetLoot: 'Reiniciar Sesión de Botín',
    clearCache: 'Limpiar Caché de Sesión'
  },
  overlay: {
    enableWeapon: 'Habilitar Superposición de Armas',
    enableArmor: 'Habilitar Superposición de Armadura',
    lockPosition: 'Bloquear Posición',
    displayAppearance: 'PANTALLA Y APARIENCIA',
    layout: 'Diseño',
    layoutOptions: { vertical: 'Apilado Vertical', horizontal: 'Fila Horizontal' },
    style: 'Estilo',
    styleOptions: { bar: 'Solo Barra', text_percent: 'Texto (Porcentaje)', text_durability: 'Texto (Durabilidad)', bar_percent: 'Barra + Porcentaje', bar_durability: 'Barra + Durabilidad' },
    enableAnimations: 'Habilitar Animaciones',
    width: 'Ancho',
    height: 'Alto (Barra)',
    scale: 'Escala',
    opacity: 'Opacidad',
    bgRadius: 'Radio del Fondo',
    bgBlur: 'Desenfoque del Fondo',
    borderSettings: 'CONFIGURACIÓN DE BORDE',
    borderThickness: 'Grosor del Borde',
    dynamicColor: 'Color Dinámico (Según Salud)',
    alertsAnchor: 'ALERTAS Y ANCLAJE',
    enableAlerts: 'Habilitar Alertas',
    alertThreshold: 'Umbral de Alerta',
    anchorPosition: 'Posición de Anclaje',
    anchorOptions: { topLeft: 'Arriba Izquierda', topRight: 'Arriba Derecha', bottomLeft: 'Abajo Izquierda', bottomRight: 'Abajo Derecha', custom: 'Personalizado' }
  },
  notifications: {
    toastNotifications: 'NOTIFICACIONES TOAST',
    enableToasts: 'Habilitar Toasts',
    toastPosition: 'Posición de Toast',
    toastPositionOptions: { topLeft: 'Arriba Izquierda', topCenter: 'Arriba Centro', topRight: 'Arriba Derecha', bottomLeft: 'Abajo Izquierda', bottomCenter: 'Abajo Centro', bottomRight: 'Abajo Derecha' },
    toastDuration: 'Duración del Toast',
    soundAlerts: 'ALERTAS DE SONIDO',
    enableSounds: 'Habilitar Sonidos',
    volume: 'Volumen',
    uiPopups: 'VENTANAS EMERGENTES',
    showLevelUp: 'Mostrar Nivel Subido',
    showRareDrop: 'Mostrar Botín Raro'
  },
  companion: {
    personalityBehavior: 'PERSONALIDAD Y COMPORTAMIENTO',
    chatFrequency: 'Frecuencia de Chat',
    frequencyOptions: { silent: 'Silencio', rare: 'Raro', normal: 'Normal', frequent: 'Frecuente', nonstop: 'Sin Parar' },
    personalityMode: 'Modo de Personalidad',
    modeOptions: { helpful: 'Útil', sarcastic: 'Sarcástico', aggressive: 'Agresivo', mystical: 'Místico' },
    showFaceCam: 'Mostrar Cámara Facial',
    enableVoiceLines: 'Habilitar Líneas de Voz'
  },
  about: {
    version: 'v0.0.1 • Código Abierto',
    desc: 'ROEDEX es una suite de seguimiento de alto rendimiento construida exclusivamente para la comunidad. Diseñada desde cero para ser fluida, hermosa y completamente gratuita. Nuestra misión es brindarte el conjunto de herramientas más avanzado para optimizar tus partidas, rastrear botines raros y conquistar tus aventuras.',
    viewChangelogs: 'Ver Registros de Cambios',
    readMore: 'Leer Más ➔',
    supportDev: 'Apoyar el Desarrollo',
    supportDesc: 'ROEDEX es un proyecto de código abierto mantenido por la comunidad. Si deseas apoyar el desarrollo continuo y los costos del servidor, puedes hacerlo a través de las direcciones a continuación. Las contribuciones son estrictamente opcionales pero muy apreciadas.',
    networkNote: '(Nota: Verifica la red antes de enviar cualquier cripto)',
    youtube: 'YouTube',
    x: 'X',
    github: 'GitHub',
    creditsTitle: 'Créditos y Agradecimientos',
    leadDev: 'Desarrollador Principal y Creador',
    guidance: 'Orientación y Contribuciones'
  },
  changelog: {
    whatsNew: '✨ Novedades',
    fixesAndImprov: 'Correcciones y Mejoras'
  }
};

const ru = {
  general: {
    themeDensity: 'ТЕМА И ПЛОТНОСТЬ',
    uiTheme: 'Тема интерфейса',
    displayDensity: 'Плотность экрана',
    layoutOpacity: 'МАКЕТ И ПРОЗРАЧНОСТЬ',
    verticalLayout: 'Вертикальный макет',
    activeOpacity: 'Активная непрозрачность',
    idleOpacity: 'Фоновая непрозрачность',
    minimizedState: 'СВЕРНУТОЕ СОСТОЯНИЕ',
    minimizedOrbSize: 'Размер свернутого шара',
    minimizedIcon: 'Свернутая иконка',
    snappingRadius: 'Радиус привязки',
    compactMode: 'Компактный режим',
    layoutOptions: { vertical: 'Вертикально', horizontal: 'Горизонтально', grid: 'Сетка' }
  },
  tracking: {
    displayMode: 'РЕЖИМ ОТОБРАЖЕНИЯ',
    viewMode: 'Режим просмотра',
    viewOptions: { session: 'Сессия', profile: 'Профиль' },
    globalDataTable: 'ГЛОБАЛЬНАЯ ТАБЛИЦА',
    showDistance: 'Показывать дистанцию',
    showCounts: 'Показывать счет (Живые/Мертвые)',
    showTimers: 'Показывать таймеры',
    raritySort: 'Сортировка по редкости',
    rarityOptions: { mythic: 'Мифический -> ...', common: 'Обычный -> ...' },
    tooltipLimit: 'Лимит подсказок возрождения',
    tooltipOptions: { show3: 'Показать 3', show5: 'Показать 5', show10: 'Показать 10', showAll: 'Показать все' },
    dataManagement: 'УПРАВЛЕНИЕ ДАННЫМИ',
    resetLoot: 'Сбросить лут сессии',
    clearCache: 'Очистить кэш сессии'
  },
  overlay: {
    enableWeapon: 'Включить оверлей оружия',
    enableArmor: 'Включить оверлей брони',
    lockPosition: 'Заблокировать позицию',
    displayAppearance: 'ДИСПЛЕЙ И ВНЕШНИЙ ВИД',
    layout: 'Макет',
    layoutOptions: { vertical: 'Вертикальный', horizontal: 'Горизонтальный' },
    style: 'Стиль',
    styleOptions: { bar: 'Только полоса', text_percent: 'Текст (%)', text_durability: 'Текст (Прочность)', bar_percent: 'Полоса + %', bar_durability: 'Полоса + Прочность' },
    enableAnimations: 'Включить анимации',
    width: 'Ширина',
    height: 'Высота (полоса)',
    scale: 'Масштаб',
    opacity: 'Прозрачность',
    bgRadius: 'Радиус фона',
    bgBlur: 'Размытие фона',
    borderSettings: 'НАСТРОЙКИ ГРАНИЦ',
    borderThickness: 'Толщина границы',
    dynamicColor: 'Динамический цвет (по здоровью)',
    alertsAnchor: 'УВЕДОМЛЕНИЯ И ЯКОРЬ',
    enableAlerts: 'Включить уведомления',
    alertThreshold: 'Порог уведомления',
    anchorPosition: 'Позиция якоря',
    anchorOptions: { topLeft: 'Сверху слева', topRight: 'Сверху справа', bottomLeft: 'Снизу слева', bottomRight: 'Снизу справа', custom: 'Пользовательская' }
  },
  notifications: {
    toastNotifications: 'ВСПЛЫВАЮЩИЕ УВЕДОМЛЕНИЯ',
    enableToasts: 'Включить уведомления',
    toastPosition: 'Позиция',
    toastPositionOptions: { topLeft: 'Сверху слева', topCenter: 'Сверху по центру', topRight: 'Сверху справа', bottomLeft: 'Снизу слева', bottomCenter: 'Снизу по центру', bottomRight: 'Снизу справа' },
    toastDuration: 'Длительность',
    soundAlerts: 'ЗВУКОВЫЕ УВЕДОМЛЕНИЯ',
    enableSounds: 'Включить звуки',
    volume: 'Громкость',
    uiPopups: 'ВСПЛЫВАЮЩИЕ ОКНА',
    showLevelUp: 'Показывать повышение уровня',
    showRareDrop: 'Показывать редкий дроп'
  },
  companion: {
    personalityBehavior: 'ЛИЧНОСТЬ И ПОВЕДЕНИЕ',
    chatFrequency: 'Частота чата',
    frequencyOptions: { silent: 'Тихо', rare: 'Редко', normal: 'Нормально', frequent: 'Часто', nonstop: 'Без остановки' },
    personalityMode: 'Режим личности',
    modeOptions: { helpful: 'Полезный', sarcastic: 'Саркастичный', aggressive: 'Агрессивный', mystical: 'Мистический' },
    showFaceCam: 'Показывать лицо',
    enableVoiceLines: 'Включить озвучку'
  },
  about: {
    version: 'v0.0.1 • Открытый код',
    desc: 'ROEDEX — это высокопроизводительный набор инструментов для отслеживания, созданный исключительно для сообщества. Разработан с нуля, чтобы быть удобным, красивым и абсолютно бесплатным. Наша миссия — предоставить вам самые передовые инструменты для оптимизации игры.',
    viewChangelogs: 'Посмотреть список изменений',
    readMore: 'Читать далее ➔',
    supportDev: 'Поддержать разработку',
    supportDesc: 'ROEDEX — проект с открытым исходным кодом. Если вы хотите поддержать дальнейшую разработку и оплату серверов, вы можете сделать это через кошельки ниже. Взносы добровольны, но мы им очень рады.',
    networkNote: '(Примечание: пожалуйста, проверяйте сеть перед отправкой криптовалюты)',
    youtube: 'YouTube',
    x: 'X',
    github: 'GitHub',
    creditsTitle: 'Титры и благодарности',
    leadDev: 'Главный разработчик и создатель',
    guidance: 'Руководство и вклад'
  },
  changelog: {
    whatsNew: '✨ Что нового',
    fixesAndImprov: 'Исправления и улучшения'
  }
};

const ko = {
  general: {
    themeDensity: '테마 및 밀도',
    uiTheme: 'UI 테마',
    displayDensity: '디스플레이 밀도',
    layoutOpacity: '레이아웃 및 투명도',
    verticalLayout: '수직 레이아웃',
    activeOpacity: '활성 투명도',
    idleOpacity: '대기 투명도',
    minimizedState: '최소화 상태',
    minimizedOrbSize: '최소화 오브 크기',
    minimizedIcon: '최소화 아이콘',
    snappingRadius: '스냅 반경',
    compactMode: '컴팩트 모드',
    layoutOptions: { vertical: '수직', horizontal: '수평', grid: '그리드' }
  },
  tracking: {
    displayMode: '표시 모드',
    viewMode: '보기 모드',
    viewOptions: { session: '세션', profile: '프로필' },
    globalDataTable: '글로벌 데이터 테이블',
    showDistance: '거리 열 표시',
    showCounts: '카운트 표시 (생존/사망)',
    showTimers: '리스폰 타이머 표시',
    raritySort: '희귀도 정렬 (거리 끄기 시)',
    rarityOptions: { mythic: '신화 -> ...', common: '일반 -> ...' },
    tooltipLimit: '다가오는 리스폰 툴팁 제한',
    tooltipOptions: { show3: '3개 표시', show5: '5개 표시', show10: '10개 표시', showAll: '모두 표시' },
    dataManagement: '데이터 관리',
    resetLoot: '전리품 세션 초기화',
    clearCache: '세션 캐시 지우기'
  },
  overlay: {
    enableWeapon: '무기 오버레이 활성화',
    enableArmor: '방어구 오버레이 활성화',
    lockPosition: '위치 고정',
    displayAppearance: '디스플레이 및 모양',
    layout: '레이아웃',
    layoutOptions: { vertical: '수직 스택', horizontal: '수평 행' },
    style: '스타일',
    styleOptions: { bar: '막대만', text_percent: '텍스트 (백분율)', text_durability: '텍스트 (내구도)', bar_percent: '막대 + 백분율', bar_durability: '막대 + 내구도' },
    enableAnimations: '애니메이션 활성화',
    width: '너비',
    height: '높이 (막대)',
    scale: '비율',
    opacity: '투명도',
    bgRadius: '배경 반경',
    bgBlur: '배경 흐림',
    borderSettings: '테두리 설정',
    borderThickness: '테두리 두께',
    dynamicColor: '동적 색상 (체력에 맞춤)',
    alertsAnchor: '알림 및 앵커',
    enableAlerts: '알림 활성화',
    alertThreshold: '알림 임계값',
    anchorPosition: '앵커 위치',
    anchorOptions: { topLeft: '좌측 상단', topRight: '우측 상단', bottomLeft: '좌측 하단', bottomRight: '우측 하단', custom: '사용자 지정' }
  },
  notifications: {
    toastNotifications: '토스트 알림',
    enableToasts: '토스트 활성화',
    toastPosition: '토스트 위치',
    toastPositionOptions: { topLeft: '좌측 상단', topCenter: '상단 중앙', topRight: '우측 상단', bottomLeft: '좌측 하단', bottomCenter: '하단 중앙', bottomRight: '우측 하단' },
    toastDuration: '토스트 지속 시간',
    soundAlerts: '소리 알림',
    enableSounds: '소리 활성화',
    volume: '볼륨',
    uiPopups: 'UI 팝업',
    showLevelUp: '레벨업 팝업 표시',
    showRareDrop: '희귀 전리품 팝업 표시'
  },
  companion: {
    personalityBehavior: '성격 및 행동',
    chatFrequency: '채팅 빈도',
    frequencyOptions: { silent: '조용함', rare: '드물게', normal: '보통', frequent: '자주', nonstop: '끊임없이' },
    personalityMode: '성격 모드',
    modeOptions: { helpful: '도움이 됨', sarcastic: '비꼬는', aggressive: '공격적인', mystical: '신비로운' },
    showFaceCam: '얼굴 캠 표시',
    enableVoiceLines: '음성 대사 활성화'
  },
  about: {
    version: 'v0.0.1 • 오픈 소스',
    desc: 'ROEDEX는 커뮤니티를 위해 독점적으로 구축된 고성능 추적 제품군입니다. 매끄럽고 아름다우며 완전히 무료로 사용할 수 있도록 처음부터 설계되었습니다. 우리의 임무는 모험을 정복하고 희귀한 전리품을 추적하며 실행을 최적화하는 가장 고급스러운 도구 세트를 제공하는 것입니다.',
    viewChangelogs: '프로젝트 변경 로그 보기',
    readMore: '더 읽기 ➔',
    supportDev: '개발 지원',
    supportDesc: 'ROEDEX는 커뮤니티에서 유지 관리하는 오픈 소스 프로젝트입니다. 지속적인 개발 및 서버 비용을 지원하고 싶으시다면 아래 주소를 통해 하실 수 있습니다. 기부는 엄격히 선택 사항이지만 큰 도움이 됩니다.',
    networkNote: '(참고: 암호화폐를 보내기 전에 네트워크를 확인하세요)',
    youtube: 'YouTube',
    x: 'X',
    github: 'GitHub',
    creditsTitle: '크레딧 및 감사의 말',
    leadDev: '수석 개발자 및 제작자',
    guidance: '안내 및 기여'
  },
  changelog: {
    whatsNew: '✨ 새로운 기능',
    fixesAndImprov: '수정 및 개선 사항'
  }
};

const injections = { en, es, ru, ko };

let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

for (const lang of Object.keys(injections)) {
  const jsonStr = JSON.stringify(injections[lang], null, 4).replace(/\\n/g, '\\n');
  const targetStr = `companions: {`;
  const regex = new RegExp(`^\\s*companions: \\{$`, 'm');
  
  if (content.includes(`settingsUI: {`) && content.includes(`${lang}: {`)) {
     // skip if already there
  } else {
    // Inject just before companions block
    const replacement = `settingsUI: ${jsonStr},\n    companions: {`;
    
    // We need to match the companions block for the specific language
    // The easiest way is to split by "lang: {" and replace the first "companions: {" inside that block
    const parts = content.split(`${lang}: {`);
    if (parts.length > 1) {
      parts[1] = parts[1].replace(/companions: \{/, replacement);
      content = parts.join(`${lang}: {`);
    }
  }
}

if (!content.includes('`settingsUI.')) {
  const unionTarget = / \| `companions\.\$\{keyof typeof translations\.en\.companions\.bob\}`/g;
  content = content.replace(unionTarget, 
`  | \`settingsUI.\${keyof typeof translations.en.settingsUI}\`
  | \`settingsUI.general.\${keyof typeof translations.en.settingsUI.general}\`
  | \`settingsUI.tracking.\${keyof typeof translations.en.settingsUI.tracking}\`
  | \`settingsUI.overlay.\${keyof typeof translations.en.settingsUI.overlay}\`
  | \`settingsUI.notifications.\${keyof typeof translations.en.settingsUI.notifications}\`
  | \`settingsUI.companion.\${keyof typeof translations.en.settingsUI.companion}\`
  | \`settingsUI.about.\${keyof typeof translations.en.settingsUI.about}\`
  | \`settingsUI.changelog.\${keyof typeof translations.en.settingsUI.changelog}\`
  | \`settingsUI.general.layoutOptions.\${keyof typeof translations.en.settingsUI.general.layoutOptions}\`
  | \`settingsUI.tracking.viewOptions.\${keyof typeof translations.en.settingsUI.tracking.viewOptions}\`
  | \`settingsUI.tracking.rarityOptions.\${keyof typeof translations.en.settingsUI.tracking.rarityOptions}\`
  | \`settingsUI.tracking.tooltipOptions.\${keyof typeof translations.en.settingsUI.tracking.tooltipOptions}\`
  | \`settingsUI.overlay.layoutOptions.\${keyof typeof translations.en.settingsUI.overlay.layoutOptions}\`
  | \`settingsUI.overlay.styleOptions.\${keyof typeof translations.en.settingsUI.overlay.styleOptions}\`
  | \`settingsUI.overlay.anchorOptions.\${keyof typeof translations.en.settingsUI.overlay.anchorOptions}\`
  | \`settingsUI.notifications.toastPositionOptions.\${keyof typeof translations.en.settingsUI.notifications.toastPositionOptions}\`
  | \`settingsUI.companion.frequencyOptions.\${keyof typeof translations.en.settingsUI.companion.frequencyOptions}\`
  | \`settingsUI.companion.modeOptions.\${keyof typeof translations.en.settingsUI.companion.modeOptions}\`
  | \`companions.\${keyof typeof translations.en.companions.bob}\``);
}

fs.writeFileSync('src/i18n/translations.ts', content, 'utf8');
console.log('Successfully injected settingsUI translations.');
