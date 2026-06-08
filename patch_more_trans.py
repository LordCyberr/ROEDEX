import re

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_en = """
      centerMarket: 'Center of Marketplace',
      bottomArmWrestling2: 'Bottom right, arm wrestling',
      playingPool: 'Playing pool at table 2',
      drinkingBar: 'Drinking at the bar',
      bartender: 'Bartender',
      sleepingTable: 'Top left, sleeping on a table',
      atCounter: 'At the counter',
      repairingTools: 'Repairing tools',
      eastTownArea: 'East Town area',
      hidingPillar1: 'Hiding behind the first pillar',
      hidingPillar2: 'Hiding behind the second pillar',
"""

new_es = """
      centerMarket: 'Centro del Mercado',
      bottomArmWrestling2: 'Abajo a la derecha, en vencidas',
      playingPool: 'Jugando billar en la mesa 2',
      drinkingBar: 'Bebiendo en la barra',
      bartender: 'Cantinero',
      sleepingTable: 'Arriba a la izquierda, durmiendo en una mesa',
      atCounter: 'En el mostrador',
      repairingTools: 'Reparando herramientas',
      eastTownArea: 'Área del Pueblo Este',
      hidingPillar1: 'Escondido detrás del primer pilar',
      hidingPillar2: 'Escondido detrás del segundo pilar',
"""

new_ru = """
      centerMarket: 'Центр рынка',
      bottomArmWrestling2: 'Внизу справа, армрестлинг',
      playingPool: 'Играет в бильярд за столом 2',
      drinkingBar: 'Пьет у барной стойки',
      bartender: 'Бармен',
      sleepingTable: 'Вверху слева, спит на столе',
      atCounter: 'За прилавком',
      repairingTools: 'Чинит инструменты',
      eastTownArea: 'Район Восточного города',
      hidingPillar1: 'Прячется за первой колонной',
      hidingPillar2: 'Прячется за второй колонной',
"""

new_ko = """
      centerMarket: '시장 중앙',
      bottomArmWrestling2: '오른쪽 아래, 팔씨름 중',
      playingPool: '2번 테이블에서 당구 중',
      drinkingBar: '바에서 술 마시는 중',
      bartender: '바텐더',
      sleepingTable: '왼쪽 위, 테이블에서 자는 중',
      atCounter: '카운터에 있음',
      repairingTools: '도구 수리 중',
      eastTownArea: '동쪽 마을 지역',
      hidingPillar1: '첫 번째 기둥 뒤에 숨음',
      hidingPillar2: '두 번째 기둥 뒤에 숨음',
"""

def append_to_locations(content, lang, new_locs):
    pattern = f"(    {lang}: {{.*?npcLocations: {{)(.*?)(    }})"
    def replacer(m):
        return m.group(1) + m.group(2).rstrip() + ",\n" + new_locs + m.group(3)
    return re.sub(pattern, replacer, content, flags=re.DOTALL)

content = append_to_locations(content, 'en', new_en)
content = append_to_locations(content, 'es', new_es)
content = append_to_locations(content, 'ru', new_ru)
content = append_to_locations(content, 'ko', new_ko)

with open('src/i18n/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/data/npcs.ts', 'r', encoding='utf-8') as f:
    npcs_content = f.read()

loc_map = {
    'Center of Marketplace': 'npcLocations.centerMarket',
    'Bottom right, arm wrestling': 'npcLocations.bottomArmWrestling2',
    'Playing pool at table 2': 'npcLocations.playingPool',
    'Drinking at the bar': 'npcLocations.drinkingBar',
    'Bartender': 'npcLocations.bartender',
    'Top left, sleeping on a table': 'npcLocations.sleepingTable',
    'At the counter': 'npcLocations.atCounter',
    'Repairing tools': 'npcLocations.repairingTools',
    'East Town area': 'npcLocations.eastTownArea',
    'Hiding behind the first pillar': 'npcLocations.hidingPillar1',
    'Hiding behind the second pillar': 'npcLocations.hidingPillar2'
}
for k, v in loc_map.items():
    npcs_content = npcs_content.replace(f"location: '{k}'", f"location: '{v}'")

with open('src/data/npcs.ts', 'w', encoding='utf-8') as f:
    f.write(npcs_content)
