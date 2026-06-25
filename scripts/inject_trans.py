import re

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Add categories.respawns to EN
text = re.sub(r'(\"categories\": \{[^}]*\"bosses\": \"BOSSES\")', r'\1,\n      "respawns": "RESPAWNS"', text)
text = re.sub(r'(\"bosses\": \"BOSSES\"[^\n]*\n\s*\})', r'\1,\n    "tabHover": {\n      "global": "This is the Global Tab. It tracks every mob, resource, and item across the entire current zone.",\n      "favorites": "Your Favorites Tab. Any item you bookmark with the star icon will appear here for easy tracking.",\n      "session": "The Session Tab tracks your current farming run, including runestones per hour, XP, and items gathered.",\n      "npcs": "The NPC Tab shows the locations of all vendors, quest givers, and important characters.",\n      "tracking": "This is your main dashboard. We automatically detect your character\'s level, weapon durability, and map position. It updates the moment you swing a sword or take a step.",\n      "loot": "The Loot Tab shows everything you\'ve collected. The Session tab is for this current run, while Profile and Chest track your entire history.",\n      "settings": "The Settings Tab. Customize my appearance, notifications, and tweak how data is displayed."\n    }', text, count=1)

# ES
text = re.sub(r'(\"categories\": \{[^}]*\"bosses\": \"JEFES\")', r'\1,\n      "respawns": "REAPARICIONES"', text)
text = re.sub(r'(\"bosses\": \"JEFES\"[^\n]*\n\s*\})', r'\1,\n    "tabHover": {\n      "global": "Esta es la Pestaña Global. Rastrea cada enemigo, recurso y objeto en toda la zona actual.",\n      "favorites": "Tu Pestaña de Favoritos. Cualquier objeto que marques con la estrella aparecerá aquí para facilitar su seguimiento.",\n      "session": "La Pestaña de Sesión rastrea tu carrera de recolección actual, incluyendo runas por hora, experiencia y objetos reunidos.",\n      "npcs": "La Pestaña de PNJ muestra las ubicaciones de todos los vendedores, dadores de misiones y personajes importantes.",\n      "tracking": "Este es tu panel principal. Detectamos automáticamente el nivel de tu personaje, la durabilidad de tu arma y tu posición en el mapa. Se actualiza en el momento en que blandas una espada o des un paso.",\n      "loot": "La Pestaña de Botín muestra todo lo que has recolectado. La Pestaña de Sesión es para esta carrera, mientras que Perfil y Cofre rastrean todo tu historial.",\n      "settings": "La Pestaña de Configuración. Personaliza mi apariencia, notificaciones y ajusta cómo se muestran los datos."\n    }', text, count=1)

# RU
text = re.sub(r'(\"categories\": \{[^}]*\"bosses\": \"БОССЫ\")', r'\1,\n      "respawns": "ВОЗРОЖДЕНИЯ"', text)
text = re.sub(r'(\"bosses\": \"БОССЫ\"[^\n]*\n\s*\})', r'\1,\n    "tabHover": {\n      "global": "Это глобальная вкладка. Она отслеживает каждого моба, ресурс и предмет во всей текущей зоне.",\n      "favorites": "Ваша вкладка Избранное. Любой предмет, который вы добавите в закладки, появится здесь для удобного отслеживания.",\n      "session": "Вкладка Сессия отслеживает ваш текущий забег, включая руны в час, опыт и собранные предметы.",\n      "npcs": "Вкладка NPC показывает расположение всех торговцев, квестодателей и важных персонажей.",\n      "tracking": "Это ваша главная панель. Мы автоматически определяем уровень вашего персонажа, прочность оружия и позицию на карте. Она обновляется в момент взмаха мечом или шага.",\n      "loot": "Вкладка Добыча показывает все, что вы собрали. Вкладка Сессия для текущего забега, а Профиль и Сундук отслеживают всю вашу историю.",\n      "settings": "Вкладка Настроек. Настройте мой внешний вид, уведомления и то, как отображаются данные."\n    }', text, count=1)

# KO
text = re.sub(r'(\"categories\": \{[^}]*\"bosses\": \"보스\")', r'\1,\n      "respawns": "리스폰"', text)
text = re.sub(r'(\"bosses\": \"보스\"[^\n]*\n\s*\})', r'\1,\n    "tabHover": {\n      "global": "이것은 글로벌 탭입니다. 현재 구역 전체의 모든 몹, 자원, 아이템을 추적합니다.",\n      "favorites": "즐겨찾기 탭입니다. 별표 아이콘으로 북마크한 모든 아이템이 여기에 나타나 쉽게 추적할 수 있습니다.",\n      "session": "세션 탭은 시간당 룬, 경험치, 수집한 아이템을 포함하여 현재 파밍 런을 추적합니다.",\n      "npcs": "NPC 탭은 모든 상인, 퀘스트 제공자, 중요 캐릭터의 위치를 보여줍니다.",\n      "tracking": "메인 대시보드입니다. 캐릭터의 레벨, 무기 내구도, 지도 위치를 자동으로 감지합니다. 검을 휘두르거나 발걸음을 내딛는 순간 업데이트됩니다.",\n      "loot": "전리품 탭은 수집한 모든 것을 보여줍니다. 세션 탭은 이번 런을 위한 것이며, 프로필과 상자는 전체 기록을 추적합니다.",\n      "settings": "설정 탭입니다. 제 외형, 알림을 커스터마이징하고 데이터가 표시되는 방식을 조정하세요."\n    }', text, count=1)

with open('src/i18n/translations.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done!')
