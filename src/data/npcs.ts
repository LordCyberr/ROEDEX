export interface NPCInfo {
  name: string;
  zone: string;
  location: string;
}

export const KNOWN_NPCS_DATA: NPCInfo[] = [
  // GUILD
  { name: 'Noctan', zone: 'npcZones.guild', location: 'npcLocations.floor1Room1' },
  { name: 'Karen', zone: 'npcZones.guild', location: 'npcLocations.floor1Chest' },
  { name: 'Seren', zone: 'npcZones.guild', location: 'npcLocations.entrance' },
  // Right side of GUILD
  { name: 'Rhea', zone: 'npcZones.guild', location: 'npcLocations.outsideRight' },
  { name: 'Corin', zone: 'npcZones.guild', location: 'npcLocations.outsideRight' },
  { name: 'Aelin', zone: 'npcZones.guild', location: 'npcLocations.outsideRight' },
  // Outside cave/mine
  { name: 'Lenden', zone: 'npcZones.mine', location: 'npcLocations.outsideCave' },
  { name: 'Bram', zone: 'npcZones.mine', location: 'npcLocations.outsideCave' },
  { name: 'Toma', zone: 'npcZones.mine', location: 'npcLocations.outsideCave' },
  // Near the pond
  { name: 'Eldric', zone: 'npcZones.pond', location: 'npcLocations.nearPond' },
  // Marketplace
  { name: 'Filburt', zone: 'npcZones.marketplace', location: 'npcLocations.centerMarket' },
  { name: 'Tessa', zone: 'npcZones.marketplace', location: 'npcLocations.outsideMarket' },
  // Tavern
  { name: 'Mira', zone: 'npcZones.tavern', location: 'npcLocations.entranceGuitar' },
  { name: 'Halvar', zone: 'npcZones.tavern', location: 'npcLocations.bottomArmWrestling' },
  { name: 'Rurik', zone: 'npcZones.tavern', location: 'npcLocations.bottomArmWrestling2' },
  { name: 'Erik', zone: 'npcZones.tavern', location: 'npcLocations.bottomArmWrestling2' },
  { name: 'Adrian', zone: 'npcZones.tavern', location: 'npcLocations.playingPool' },
  { name: 'Leona', zone: 'npcZones.tavern', location: 'npcLocations.playingPool' },
  { name: 'Simon', zone: 'npcZones.tavern', location: 'npcLocations.drinkingBar' },
  { name: 'Rusk', zone: 'npcZones.tavern', location: 'npcLocations.bartender' },
  { name: 'Pellin', zone: 'npcZones.tavern', location: 'npcLocations.sleepingTable' },
  { name: 'Elin', zone: 'npcZones.tavern', location: 'npcLocations.topLeftTable' },
  { name: 'Livia', zone: 'npcZones.tavern', location: 'npcLocations.topLeftTable' },
  // Outside of Tavern
  { name: 'Thomel', zone: 'npcZones.tavern', location: 'npcLocations.outsideBench' },
  { name: 'Agnes', zone: 'npcZones.tavern', location: 'npcLocations.outsideBench' },
  { name: 'Garrick', zone: 'npcZones.tavern', location: 'npcLocations.outsideBench' },
  { name: 'Mirael', zone: 'npcZones.tavern', location: 'npcLocations.outsideRoaming' },
  // Alchemist
  { name: 'Nori', zone: 'npcZones.alchemist', location: 'npcLocations.insideAlchemist' },
  { name: 'Emil', zone: 'npcZones.alchemist', location: 'npcLocations.outsideAlchemist' },
  // Blacksmith
  { name: 'Rava', zone: 'npcZones.blacksmith', location: 'npcLocations.atCounter' },
  { name: 'Sela', zone: 'npcZones.blacksmith', location: 'npcLocations.repairingTools' },
  { name: 'Freya', zone: 'npcZones.blacksmith', location: 'npcLocations.outsideBlacksmith' },
  // East town
  { name: 'Callen', zone: 'npcZones.eastTown', location: 'npcLocations.eastTownArea' },
  { name: 'Niva', zone: 'npcZones.eastTown', location: 'npcLocations.eastTownArea' },
  { name: 'Lila', zone: 'npcZones.eastTown', location: 'npcLocations.hidingPillar1' },
  { name: 'Finn', zone: 'npcZones.eastTown', location: 'npcLocations.hidingPillar2' },
];

export const KNOWN_NPCS = KNOWN_NPCS_DATA.map(npc => npc.name);
