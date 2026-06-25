const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, '../src/i18n/translations.ts');
let content = fs.readFileSync(translationsPath, 'utf8');

const tutorialData = {
  en: {
    "step": "Step",
    "previous": "Previous",
    "skip": "Skip",
    "next": "Next",
    "awaitingInput": "AWAITING INPUT...",
    "skipTutorial": "Skip Tutorial",
    "restartIntro": "Restart Intro",
    "safeZoneWarning": "⚠️ YOU ARE IN A SAFE ZONE! PLEASE WALK OUTSIDE INTO THE WILD TO SEE DATA TO BOOKMARK!",
    "s1": "Welcome to ROEDEX! This tutorial will cover all overlay features in one go so you don't have to discover them on your own. Click 'NEXT' below to begin.",
    "s2": "This is the Global Tab. The header tracks Name, Distance, Alive & Dead counts, and Respawn Time for the current zone. Click 'NEXT' below to continue.",
    "s3": "Hover over the first item's respawn timer to see the respawn queue! Once you've seen it, click 'NEXT' below.",
    "s4": "Great! Now, click the category icon (like the sword, leaf, or pickaxe) next to an item in the list to bookmark it.",
    "s5": "Click the Favorites Tab (the star icon) at the top of the UI to view your bookmarks.",
    "s6": "See your bookmark? Now click the icon again to remove it from your favorites.",
    "s7": "Click the Session Tab up top. This tab tracks your Player Profile, Session Stats (record runs and run history), and Chest Loot.",
    "s8": "Click the NPC Tab. This shows you the locations of all vendors, quest givers, and important characters.",
    "s9": "Click the 'Alchemist' category row to expand it, then hover over the first NPC row.",
    "s10": "Click the Settings tab (the gear icon). Everything is customizable here, from layout colors to notification behavior.",
    "s11": "Scroll down and click on 'ABOUT ROEDEX' to expand the section. Click 'NEXT' below after expanding.",
    "s12": "Now click the 'Project Changelogs' button to read the latest updates.",
    "s13": "Great! Now close the changelog window by clicking the X in the top right corner.",
    "s14": "Let's go back to the Global Tab. Click the Pop-out icon in the top right of the UI to separate it into its own mini-overlay!",
    "s15": "Grab the header of the popped-out window and drag it. You can drag windows anywhere on your screen! Click 'NEXT' below when you're done.",
    "s16": "Click the 'Merge' button in the header (down arrow icon) to bring all popped-out windows back into the main view.",
    "s17": "Click the Layout button in the top right (panel icons) to switch to Horizontal View! It lets you see multiple pieces of info at a glance.",
    "s18": "Great! Now click it again to switch back to Vertical View.",
    "s19": "Click the minimize button (dash icon) to shrink the window into a tiny floating orb! (Double-click the orb to bring it back)",
    "s20": "Double-tap the orb to reopen the UI, then click the Lock button! When locked, the UI becomes click-through.",
    "s21": "Great! Now click the lock button again to UNLOCK the UI, and you're ready to start playing!"
  },
  es: {
    "step": "Paso",
    "previous": "Anterior",
    "skip": "Omitir",
    "next": "Siguiente",
    "awaitingInput": "ESPERANDO ENTRADA...",
    "skipTutorial": "Omitir Tutorial",
    "restartIntro": "Reiniciar Intro",
    "safeZoneWarning": "⚠️ ¡ESTÁS EN UNA ZONA SEGURA! ¡SAL AFUERA PARA VER DATOS QUE GUARDAR!",
    "s1": "¡Bienvenido a ROEDEX! Este tutorial cubrirá todas las características de la interfaz de una vez para que no tengas que descubrirlas por tu cuenta. Haz clic en 'SIGUIENTE' abajo para comenzar.",
    "s2": "Esta es la pestaña Global. El encabezado rastrea Nombre, Distancia, recuentos de Vivos y Muertos, y el Tiempo de Reaparición de la zona actual. Haz clic en 'SIGUIENTE' para continuar.",
    "s3": "¡Pasa el cursor sobre el temporizador de reaparición del primer elemento para ver la cola de reaparición! Una vez que lo hayas visto, haz clic en 'SIGUIENTE'.",
    "s4": "¡Genial! Ahora, haz clic en el icono de categoría (como la espada, hoja o pico) junto a un elemento de la lista para guardarlo en favoritos.",
    "s5": "Haz clic en la pestaña de Favoritos (el icono de estrella) en la parte superior para ver tus marcadores.",
    "s6": "¿Ves tu marcador? Ahora haz clic en el icono de nuevo para eliminarlo de tus favoritos.",
    "s7": "Haz clic en la pestaña de Sesión arriba. Esta pestaña rastrea tu Perfil de Jugador, Estadísticas de Sesión y Botín de Cofres.",
    "s8": "Haz clic en la pestaña de NPC. Esto te muestra las ubicaciones de todos los vendedores, dadores de misiones y personajes importantes.",
    "s9": "Haz clic en la categoría 'Alquimista' para expandirla, luego pasa el cursor sobre la primera fila de NPC.",
    "s10": "Haz clic en la pestaña de Configuración (el icono de engranaje). Todo es personalizable aquí, desde colores hasta el comportamiento de las notificaciones.",
    "s11": "Desplázate hacia abajo y haz clic en 'ACERCA DE ROEDEX' para expandir la sección. Haz clic en 'SIGUIENTE' después de expandirla.",
    "s12": "Ahora haz clic en el botón 'Registros de Cambios del Proyecto' para leer las últimas actualizaciones.",
    "s13": "¡Genial! Ahora cierra la ventana de registros de cambios haciendo clic en la X en la esquina superior derecha.",
    "s14": "Volvamos a la pestaña Global. ¡Haz clic en el icono de Ventana Emergente en la parte superior derecha para separarla en su propia mini-interfaz!",
    "s15": "Agarra el encabezado de la ventana emergente y arrástralo. ¡Puedes arrastrar ventanas a cualquier lugar de tu pantalla! Haz clic en 'SIGUIENTE' cuando termines.",
    "s16": "Haz clic en el botón 'Fusionar' en el encabezado (icono de flecha hacia abajo) para devolver todas las ventanas emergentes a la vista principal.",
    "s17": "¡Haz clic en el botón de Diseño (icono de paneles) para cambiar a la Vista Horizontal! Te permite ver múltiples piezas de información de un vistazo.",
    "s18": "¡Genial! Ahora haz clic de nuevo para volver a la Vista Vertical.",
    "s19": "¡Haz clic en el botón de minimizar (icono de guion) para encoger la ventana a un pequeño orbe flotante! (Haz doble clic en el orbe para traerlo de vuelta)",
    "s20": "¡Toca dos veces el orbe para reabrir la interfaz, luego haz clic en el botón de Bloqueo! Cuando está bloqueado, la interfaz permite hacer clics a través de ella.",
    "s21": "¡Genial! Ahora haz clic en el botón de bloqueo de nuevo para DESBLOQUEAR la interfaz, ¡y estás listo para empezar a jugar!"
  },
  ru: {
    "step": "Шаг",
    "previous": "Назад",
    "skip": "Пропустить",
    "next": "Далее",
    "awaitingInput": "ОЖИДАНИЕ ВВОДА...",
    "skipTutorial": "Пропустить Обучение",
    "restartIntro": "Перезапустить Интро",
    "safeZoneWarning": "⚠️ ВЫ В БЕЗОПАСНОЙ ЗОНЕ! ПОЖАЛУЙСТА, ВЫЙДИТЕ В ДИКУЮ ПРИРОДУ, ЧТОБЫ УВИДЕТЬ ДАННЫЕ ДЛЯ ЗАКЛАДОК!",
    "s1": "Добро пожаловать в ROEDEX! Это обучение охватит все функции интерфейса за один раз. Нажмите 'ДАЛЕЕ' ниже, чтобы начать.",
    "s2": "Это Глобальная вкладка. Заголовок отслеживает Имя, Дистанцию, количество Живых и Мертвых, и Время Возрождения. Нажмите 'ДАЛЕЕ'.",
    "s3": "Наведите курсор на таймер возрождения первого предмета, чтобы увидеть очередь возрождения! Затем нажмите 'ДАЛЕЕ'.",
    "s4": "Отлично! Теперь нажмите на значок категории рядом с предметом в списке, чтобы добавить его в закладки.",
    "s5": "Нажмите на вкладку Избранное (значок звезды) вверху, чтобы увидеть ваши закладки.",
    "s6": "Видите свою закладку? Теперь нажмите на значок снова, чтобы удалить ее из избранного.",
    "s7": "Нажмите на вкладку Сессия наверху. Эта вкладка отслеживает ваш Профиль, Статистику Сессии и Лут.",
    "s8": "Нажмите на вкладку NPC. Она показывает местоположение всех торговцев и важных персонажей.",
    "s9": "Нажмите на категорию 'Алхимик', чтобы развернуть ее, затем наведите курсор на первую строку NPC.",
    "s10": "Нажмите на вкладку Настройки (значок шестеренки). Здесь все настраивается: от цветов до уведомлений.",
    "s11": "Прокрутите вниз и нажмите 'О ROEDEX', чтобы развернуть раздел. Затем нажмите 'ДАЛЕЕ'.",
    "s12": "Теперь нажмите кнопку 'Журнал Изменений', чтобы прочитать последние обновления.",
    "s13": "Отлично! Теперь закройте окно журнала изменений, нажав X в правом верхнем углу.",
    "s14": "Вернемся к Глобальной вкладке. Нажмите значок всплывающего окна в правом верхнем углу, чтобы отделить ее в мини-оверлей!",
    "s15": "Возьмите заголовок всплывающего окна и перетащите его. Нажмите 'ДАЛЕЕ', когда закончите.",
    "s16": "Нажмите кнопку 'Объединить' в заголовке (значок стрелки вниз), чтобы вернуть все окна в главный вид.",
    "s17": "Нажмите кнопку Макета (значок панелей), чтобы переключиться на Горизонтальный Вид! Это позволяет видеть больше информации.",
    "s18": "Отлично! Теперь нажмите еще раз, чтобы вернуться к Вертикальному Виду.",
    "s19": "Нажмите кнопку свертывания (значок тире), чтобы сжать окно в парящую сферу! (Двойной клик вернет его)",
    "s20": "Дважды коснитесь сферы, чтобы открыть интерфейс, затем нажмите кнопку Блокировки! Когда он заблокирован, он становится прозрачным для кликов.",
    "s21": "Отлично! Теперь снова нажмите кнопку блокировки, чтобы РАЗБЛОКИРОВАТЬ интерфейс, и вы готовы к игре!"
  },
  ko: {
    "step": "단계",
    "previous": "이전",
    "skip": "건너뛰기",
    "next": "다음",
    "awaitingInput": "입력 대기 중...",
    "skipTutorial": "튜토리얼 건너뛰기",
    "restartIntro": "소개 다시 시작",
    "safeZoneWarning": "⚠️ 안전 구역입니다! 즐겨찾기할 데이터를 보려면 밖으로 나가주세요!",
    "s1": "ROEDEX에 오신 것을 환영합니다! 이 튜토리얼에서는 모든 오버레이 기능을 한 번에 다룹니다. 시작하려면 아래의 '다음'을 클릭하세요.",
    "s2": "이곳은 글로벌 탭입니다. 현재 지역의 이름, 거리, 생존 및 사망 수, 리스폰 시간을 추적합니다. '다음'을 클릭하세요.",
    "s3": "첫 번째 항목의 리스폰 타이머에 마우스를 올려 리스폰 대기열을 확인하세요! 확인 후 '다음'을 클릭하세요.",
    "s4": "좋습니다! 이제 목록의 항목 옆에 있는 카테고리 아이콘(검, 나뭇잎, 곡괭이 등)을 클릭하여 즐겨찾기에 추가하세요.",
    "s5": "UI 상단의 즐겨찾기 탭(별 아이콘)을 클릭하여 즐겨찾기를 확인하세요.",
    "s6": "즐겨찾기가 보이나요? 이제 아이콘을 다시 클릭하여 즐겨찾기에서 제거하세요.",
    "s7": "상단의 세션 탭을 클릭하세요. 이 탭은 플레이어 프로필, 세션 통계 및 상자 전리품을 추적합니다.",
    "s8": "NPC 탭을 클릭하세요. 모든 상인, 퀘스트 제공자 및 중요한 캐릭터의 위치를 보여줍니다.",
    "s9": "'연금술사' 카테고리 행을 클릭하여 확장한 다음 첫 번째 NPC 행에 마우스를 올리세요.",
    "s10": "설정 탭(톱니바퀴 아이콘)을 클릭하세요. 색상부터 알림 동작까지 모든 것을 여기서 사용자 정의할 수 있습니다.",
    "s11": "아래로 스크롤하여 'ROEDEX 정보'를 클릭하여 섹션을 확장하세요. 확장 후 '다음'을 클릭하세요.",
    "s12": "이제 '프로젝트 변경 로그' 버튼을 클릭하여 최신 업데이트를 읽어보세요.",
    "s13": "훌륭합니다! 이제 오른쪽 상단의 X를 클릭하여 변경 로그 창을 닫으세요.",
    "s14": "다시 글로벌 탭으로 돌아가 보겠습니다. 오른쪽 상단의 팝아웃 아이콘을 클릭하여 별도의 미니 오버레이로 분리하세요!",
    "s15": "팝아웃 창의 헤더를 잡고 드래그하세요. 창을 화면 어디로든 드래그할 수 있습니다! 완료되면 '다음'을 클릭하세요.",
    "s16": "헤더의 '병합' 버튼(아래쪽 화살표 아이콘)을 클릭하여 모든 팝아웃 창을 주 보기로 다시 가져오세요.",
    "s17": "오른쪽 상단의 레이아웃 버튼(패널 아이콘)을 클릭하여 가로 보기로 전환하세요! 한눈에 여러 정보를 볼 수 있습니다.",
    "s18": "좋습니다! 이제 다시 클릭하여 세로 보기로 전환하세요.",
    "s19": "최소화 버튼(대시 아이콘)을 클릭하여 창을 작은 떠다니는 오브로 축소하세요! (오브를 더블 클릭하면 다시 나타납니다)",
    "s20": "오브를 두 번 탭하여 UI를 다시 연 다음 잠금 버튼을 클릭하세요! 잠기면 UI를 클릭하여 통과할 수 있습니다.",
    "s21": "훌륭합니다! 이제 잠금 버튼을 다시 클릭하여 UI의 잠금을 해제하면 플레이할 준비가 된 것입니다!"
  }
};

const languages = ['en', 'es', 'ru', 'ko'];

languages.forEach(lang => {
  // Regex to find "errorBoundary": { ... } and insert "tutorial": { ... } before it
  const regex = new RegExp(`("${lang}":\\s*{[\\s\\S]*?)("errorBoundary":\\s*{)`);
  
  content = content.replace(regex, (match, p1, p2) => {
    return p1 + `"tutorial": ` + JSON.stringify(tutorialData[lang], null, 6) + `,\n    ` + p2;
  });
});

fs.writeFileSync(translationsPath, content, 'utf8');
console.log('Successfully injected tutorial translations!');
