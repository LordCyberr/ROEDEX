export interface NPCInfo {
  name: string;
  zone: string;
  location: string;
  x?: number;
  y?: number;
  actualZone?: string;
  isShop?: boolean;
}

export const KNOWN_NPCS_DATA: NPCInfo[] = [
  // GUILD
  { name: 'Noctan', zone: 'npcZones.guild', location: 'npcLocations.floor1Room1', x: -165.16, y: 16.19 },
  { name: 'Karen', zone: 'npcZones.guild', location: 'npcLocations.floor1Chest', x: -156.98, y: 8.54 },
  { name: 'Seren', zone: 'npcZones.guild', location: 'npcLocations.entrance', x: -156.89, y: -2.45 },
  // Right side of GUILD
  { name: 'Rhea', zone: 'npcZones.guild', location: 'npcLocations.outsideRight', x: -48.64, y: 28.17, actualZone: 'Town' },
  { name: 'Corin', zone: 'npcZones.guild', location: 'npcLocations.outsideRight', x: -48.74, y: 27.36, actualZone: 'Town' },
  { name: 'Aelin', zone: 'npcZones.guild', location: 'npcLocations.outsideRight', x: -48.13, y: 25.20, actualZone: 'Town' },
  // Outside cave/mine
  { name: 'Lenden', zone: 'npcZones.mine', location: 'npcLocations.outsideCave', x: -7.84, y: 44.36, actualZone: 'Town' },
  { name: 'Bram', zone: 'npcZones.mine', location: 'npcLocations.outsideCave', x: -1.64, y: 57.33, actualZone: 'Town' },
  { name: 'Toma', zone: 'npcZones.mine', location: 'npcLocations.outsideCave', x: -9.74, y: 58.43, actualZone: 'Town' },
  // Near the pond
  { name: 'Eldric', zone: 'npcZones.pond', location: 'npcLocations.nearPond', x: 15.09, y: 40.90, actualZone: 'Town' },
  // Marketplace
  { name: 'Filburt', zone: 'npcZones.marketplace', location: 'npcLocations.centerMarket', x: -116.89, y: 51.60 },
  { name: 'Tessa', zone: 'npcZones.marketplace', location: 'npcLocations.outsideMarket', x: -1.27, y: 9.14, actualZone: 'Town' },
  { name: 'Ginne', zone: 'npcZones.marketplace', location: 'npcLocations.outsideMarket', x: -14.97, y: 10.27, actualZone: 'Town' },
  // Tavern
  { name: 'Mira', zone: 'npcZones.tavern', location: 'npcLocations.entranceGuitar', x: -156.74, y: 46.79 },
  { name: 'Halvar', zone: 'npcZones.tavern', location: 'npcLocations.bottomArmWrestling', x: -143.25, y: 46.61 },
  { name: 'Rurik', zone: 'npcZones.tavern', location: 'npcLocations.bottomArmWrestling2', x: -145.23, y: 43.58 },
  { name: 'Erik', zone: 'npcZones.tavern', location: 'npcLocations.bottomArmWrestling2', x: -140.81, y: 43.58 },
  { name: 'Adrian', zone: 'npcZones.tavern', location: 'npcLocations.playingPool', x: -148.08, y: 50.63 },
  { name: 'Leona', zone: 'npcZones.tavern', location: 'npcLocations.playingPool', x: -150.00, y: 49.10 },
  { name: 'Simon', zone: 'npcZones.tavern', location: 'npcLocations.drinkingBar', x: -151.06, y: 52.98 },
  { name: 'Rusk', zone: 'npcZones.tavern', location: 'npcLocations.bartender', x: -156.60, y: 52.09 },
  { name: 'Pellin', zone: 'npcZones.tavern', location: 'npcLocations.sleepingTable', x: -165.41, y: 54.41 },
  { name: 'Elin', zone: 'npcZones.tavern', location: 'npcLocations.topLeftTable', x: -170.91, y: 54.38 },
  { name: 'Livia', zone: 'npcZones.tavern', location: 'npcLocations.topLeftTable', x: -172.00, y: 51.82 },
  // Outside of Tavern
  { name: 'Thomel', zone: 'npcZones.tavern', location: 'npcLocations.outsideBench', x: -25.91, y: -14.37, actualZone: 'Town' },
  { name: 'Agnes', zone: 'npcZones.tavern', location: 'npcLocations.outsideBench', x: -28.31, y: -16.32, actualZone: 'Town' },
  { name: 'Garrick', zone: 'npcZones.tavern', location: 'npcLocations.outsideBench', x: -30.83, y: -14.16, actualZone: 'Town' },
  { name: 'Mirael', zone: 'npcZones.tavern', location: 'npcLocations.outsideRoaming', x: -25.72, y: -25.41, actualZone: 'Town' },
  // Alchemist
  { name: 'Nori', zone: 'npcZones.alchemist', location: 'npcLocations.insideAlchemist', x: -119.58, y: 97.31 },
  { name: 'Emil', zone: 'npcZones.alchemist', location: 'npcLocations.outsideAlchemist', x: -59.33, y: -26.60, actualZone: 'Town' },
  // Blacksmith
  { name: 'Rava', zone: 'npcZones.blacksmith', location: 'npcLocations.atCounter', x: -112.37, y: -2.41 },
  { name: 'Sela', zone: 'npcZones.blacksmith', location: 'npcLocations.repairingTools', x: -101.98, y: -1.05 },
  { name: 'Freya', zone: 'npcZones.blacksmith', location: 'npcLocations.outsideBlacksmith', x: 10.71, y: -17.40, actualZone: 'Town' },
  // East town
  { name: 'Callen', zone: 'npcZones.eastTown', location: 'npcLocations.eastTownArea', x: 3.09, y: 0.94, actualZone: 'Town' },
  { name: 'Niva', zone: 'npcZones.eastTown', location: 'npcLocations.eastTownArea', x: 17.76, y: 4.94, actualZone: 'Town' },
  { name: 'Lila', zone: 'npcZones.eastTown', location: 'npcLocations.hidingPillar1', x: 18.09, y: 6.75, actualZone: 'Town' },
  { name: 'Finn', zone: 'npcZones.eastTown', location: 'npcLocations.hidingPillar2', x: 22.80, y: 6.01, actualZone: 'Town' },
];

export const KNOWN_NPCS = KNOWN_NPCS_DATA.map(npc => npc.name);

export function getNPCInfo(name: string): NPCInfo | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase().trim();
  return KNOWN_NPCS_DATA.find(n => n.name.toLowerCase() === lower || lower.includes(n.name.toLowerCase()) || n.name.toLowerCase().includes(lower));
}
