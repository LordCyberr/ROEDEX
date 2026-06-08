import re

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

zones = """
    npcZones: {
      guild: 'Guild',
      mine: 'Mine',
      pond: 'Pond',
      marketplace: 'Marketplace',
      tavern: 'Tavern',
      alchemist: 'Alchemist',
      blacksmith: 'Blacksmith',
      eastTown: 'East Town'
    },
"""

locations = """
    npcLocations: {
      floor1Chest: '1st floor near chest',
      floor1Room1: '1st floor, 1st room',
      entrance: 'At the entrance',
      outsideRight: 'Outside, right side',
      outsideCave: 'Outside the cave/mine',
      nearPond: 'Near the pond',
      outsideMarket: 'Outside the Marketplace',
      entranceGuitar: 'At the entrance, playing guitar',
      bottomArmWrestling: 'Bottom right, watching arm wrestling',
      topFireplace: 'Top right, near fireplace',
      topLeftTable: 'Top left, sitting at a table',
      outsideBench: 'Outside, sitting on the bench',
      outsideRoaming: 'Outside, roaming around',
      insideAlchemist: 'Inside Alchemist shop',
      outsideAlchemist: 'Outside Alchemist shop',
      insideBlacksmith: 'Inside Blacksmith shop',
      outsideBlacksmith: 'Outside Blacksmith shop',
      nextGuild: 'Next to Guild',
      eastGate: 'Near the East gate'
    }
"""

es_zones = """
    npcZones: {
      guild: 'Gremio',
      mine: 'Mina',
      pond: 'Estanque',
      marketplace: 'Mercado',
      tavern: 'Taberna',
      alchemist: 'Alquimista',
      blacksmith: 'Herrero',
      eastTown: 'Pueblo Este'
    },
"""

es_locations = """
    npcLocations: {
      floor1Chest: '1er piso cerca del cofre',
      floor1Room1: '1er piso, 1ra habitación',
      entrance: 'En la entrada',
      outsideRight: 'Afuera, lado derecho',
      outsideCave: 'Afuera de la cueva/mina',
      nearPond: 'Cerca del estanque',
      outsideMarket: 'Afuera del Mercado',
      entranceGuitar: 'En la entrada, tocando guitarra',
      bottomArmWrestling: 'Abajo a la derecha, viendo las vencidas',
      topFireplace: 'Arriba a la derecha, cerca de la chimenea',
      topLeftTable: 'Arriba a la izquierda, en una mesa',
      outsideBench: 'Afuera, sentado en el banco',
      outsideRoaming: 'Afuera, deambulando',
      insideAlchemist: 'Dentro de la tienda del Alquimista',
      outsideAlchemist: 'Afuera de la tienda del Alquimista',
      insideBlacksmith: 'Dentro de la Herrería',
      outsideBlacksmith: 'Afuera de la Herrería',
      nextGuild: 'Junto al Gremio',
      eastGate: 'Cerca de la puerta Este'
    }
"""

ru_zones = """
    npcZones: {
      guild: 'Гильдия',
      mine: 'Шахта',
      pond: 'Пруд',
      marketplace: 'Рынок',
      tavern: 'Таверна',
      alchemist: 'Алхимик',
      blacksmith: 'Кузнец',
      eastTown: 'Восточный город'
    },
"""

ru_locations = """
    npcLocations: {
      floor1Chest: '1-й этаж возле сундука',
      floor1Room1: '1-й этаж, 1-я комната',
      entrance: 'У входа',
      outsideRight: 'Снаружи, правая сторона',
      outsideCave: 'Снаружи пещеры/шахты',
      nearPond: 'Возле пруда',
      outsideMarket: 'Снаружи рынка',
      entranceGuitar: 'У входа, играет на гитаре',
      bottomArmWrestling: 'Внизу справа, смотрит армрестлинг',
      topFireplace: 'Вверху справа, у камина',
      topLeftTable: 'Вверху слева, сидит за столом',
      outsideBench: 'Снаружи, сидит на скамейке',
      outsideRoaming: 'Снаружи, бродит вокруг',
      insideAlchemist: 'Внутри лавки Алхимика',
      outsideAlchemist: 'Снаружи лавки Алхимика',
      insideBlacksmith: 'В кузнице',
      outsideBlacksmith: 'Снаружи кузницы',
      nextGuild: 'Рядом с гильдией',
      eastGate: 'У восточных ворот'
    }
"""

ko_zones = """
    npcZones: {
      guild: '길드',
      mine: '광산',
      pond: '연못',
      marketplace: '시장',
      tavern: '선술집',
      alchemist: '연금술사',
      blacksmith: '대장장이',
      eastTown: '동쪽 마을'
    },
"""

ko_locations = """
    npcLocations: {
      floor1Chest: '1층 상자 근처',
      floor1Room1: '1층, 첫 번째 방',
      entrance: '입구',
      outsideRight: '밖, 오른쪽',
      outsideCave: '동굴/광산 밖',
      nearPond: '연못 근처',
      outsideMarket: '시장 밖',
      entranceGuitar: '입구, 기타 연주 중',
      bottomArmWrestling: '오른쪽 아래, 팔씨름 구경 중',
      topFireplace: '오른쪽 위, 벽난로 근처',
      topLeftTable: '왼쪽 위, 테이블에 앉음',
      outsideBench: '밖, 벤치에 앉음',
      outsideRoaming: '밖, 배회 중',
      insideAlchemist: '연금술사 상점 안',
      outsideAlchemist: '연금술사 상점 밖',
      insideBlacksmith: '대장간 안',
      outsideBlacksmith: '대장간 밖',
      nextGuild: '길드 옆',
      eastGate: '동쪽 문 근처'
    }
"""

def replace_lang(content, lang, zones_str, locs_str):
    pattern = f"(    {lang}: {{.*?)(    misc: {{.*?    }})(\n  }})"
    def replacer(m):
        return m.group(1) + m.group(2) + ",\n" + zones_str.strip('\n') + ",\n" + locs_str.strip('\n') + m.group(3)
    return re.sub(pattern, replacer, content, flags=re.DOTALL)

content = replace_lang(content, 'en', zones, locations)
content = replace_lang(content, 'es', es_zones, es_locations)
content = replace_lang(content, 'ru', ru_zones, ru_locations)
content = replace_lang(content, 'ko', ko_zones, ko_locations)

# Update types
type_str = "  | `misc.${keyof typeof translations.en.misc}`\n  | `npcZones.${keyof typeof translations.en.npcZones}`\n  | `npcLocations.${keyof typeof translations.en.npcLocations}`;"
content = content.replace("  | `misc.${keyof typeof translations.en.misc}`;", type_str)

with open('src/i18n/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/data/npcs.ts', 'r', encoding='utf-8') as f:
    npcs_content = f.read()

# Replace zones
zone_map = {
    'Guild': 'npcZones.guild',
    'Mine': 'npcZones.mine',
    'Pond': 'npcZones.pond',
    'Marketplace': 'npcZones.marketplace',
    'Tavern': 'npcZones.tavern',
    'Alchemist': 'npcZones.alchemist',
    'Blacksmith': 'npcZones.blacksmith',
    'East Town': 'npcZones.eastTown'
}
for k, v in zone_map.items():
    npcs_content = npcs_content.replace(f"zone: '{k}'", f"zone: '{v}'")

# Replace locations
loc_map = {
    '1st floor near chest': 'npcLocations.floor1Chest',
    '1st floor, 1st room': 'npcLocations.floor1Room1',
    'At the entrance': 'npcLocations.entrance',
    'Outside, right side': 'npcLocations.outsideRight',
    'Outside the cave/mine': 'npcLocations.outsideCave',
    'Near the pond': 'npcLocations.nearPond',
    'Outside the Marketplace': 'npcLocations.outsideMarket',
    'At the entrance, playing guitar': 'npcLocations.entranceGuitar',
    'Bottom right, watching arm wrestling': 'npcLocations.bottomArmWrestling',
    'Top right, near fireplace': 'npcLocations.topFireplace',
    'Top left, sitting at a table': 'npcLocations.topLeftTable',
    'Outside, sitting on the bench': 'npcLocations.outsideBench',
    'Outside, roaming around': 'npcLocations.outsideRoaming',
    'Inside Alchemist shop': 'npcLocations.insideAlchemist',
    'Outside Alchemist shop': 'npcLocations.outsideAlchemist',
    'Inside Blacksmith shop': 'npcLocations.insideBlacksmith',
    'Outside Blacksmith shop': 'npcLocations.outsideBlacksmith',
    'Next to Guild': 'npcLocations.nextGuild',
    'Near the East gate': 'npcLocations.eastGate'
}
for k, v in loc_map.items():
    npcs_content = npcs_content.replace(f"location: '{k}'", f"location: '{v}'")

with open('src/data/npcs.ts', 'w', encoding='utf-8') as f:
    f.write(npcs_content)
