export const STATIC_ENTRANCES = [
  { zone: 'Town', toZone: 'Mines', x: 148.5, y: 141.3, label: 'Mines' },
  { zone: 'Mines', toZone: 'Town', x: 88.7, y: 106.2, label: 'Town' },
  
  { zone: 'Town', toZone: 'House', x: -36.1, y: -9.9, label: 'House' },
  { zone: 'House', toZone: 'Town', x: -168.8, y: 95.9, label: 'Town' },
  
  { zone: 'Town', toZone: 'Blacksmith', x: 5.4, y: -18.3, label: 'Blacksmith' },
  { zone: 'Blacksmith', toZone: 'Town', x: -111.3, y: -5.8, label: 'Town' },
  
  // 13 Bidirectional Ladders for Mines <-> Lower Mines (Maze)
  { zone: 'Mines', toZone: 'Lower Mines', x: -252.9, y: 35.3, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -252.9, y: 35.3, label: 'Upper Floor' },
  { zone: 'Mines', toZone: 'Lower Mines', x: -206.4, y: 86.3, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -206.4, y: 86.3, label: 'Upper Floor' },
  { zone: 'Mines', toZone: 'Lower Mines', x: -141.9, y: 96.0, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -141.9, y: 96.0, label: 'Upper Floor' },
  { zone: 'Mines', toZone: 'Lower Mines', x: -179.4, y: 92.2, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -179.4, y: 92.2, label: 'Upper Floor' },
  { zone: 'Mines', toZone: 'Lower Mines', x: -232.0, y: 6.4, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -232.0, y: 6.4, label: 'Upper Floor' },
  { zone: 'Mines', toZone: 'Lower Mines', x: -158.4, y: -27.0, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -158.4, y: -27.0, label: 'Upper Floor' },
  { zone: 'Mines', toZone: 'Lower Mines', x: -161.4, y: 3.9, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -161.4, y: 3.9, label: 'Upper Floor' },
  { zone: 'Mines', toZone: 'Lower Mines', x: -116.4, y: 24.0, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -116.4, y: 24.0, label: 'Upper Floor' },
  { zone: 'Mines', toZone: 'Lower Mines', x: -114.9, y: 66.8, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -114.9, y: 66.8, label: 'Upper Floor' },
  { zone: 'Mines', toZone: 'Lower Mines', x: -171.9, y: 145.8, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -171.9, y: 145.8, label: 'Upper Floor' },
  { zone: 'Mines', toZone: 'Lower Mines', x: -189.9, y: 123.9, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -189.9, y: 123.9, label: 'Upper Floor' },
  { zone: 'Mines', toZone: 'Lower Mines', x: -131.4, y: 108.1, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -131.4, y: 108.1, label: 'Upper Floor' },
  { zone: 'Mines', toZone: 'Lower Mines', x: -227.3, y: 115.4, label: 'Lower Floor' },
  { zone: 'Lower Mines', toZone: 'Mines', x: -227.3, y: 115.4, label: 'Upper Floor' },
  // Forest entrance from Mines
  { zone: 'Mines', toZone: 'Forest', x: 366.7, y: 28.0, label: 'Forest' },
  
  { zone: 'Town', toZone: 'Alchemist', x: -57.7, y: -18.6, label: 'Alchemist' },
  { zone: 'Alchemist', toZone: 'Town', x: -113.7, y: 82.6, label: 'Town' },
  
  { zone: 'Town', toZone: 'Tavern', x: -24.5, y: -12.7, label: 'Tavern' },
  { zone: 'Tavern', toZone: 'Town', x: -156.5, y: 44.5, label: 'Town' },
  
  { zone: 'Town', toZone: 'Marketplace', x: -6.6, y: 9.5, label: 'Marketplace' },
  { zone: 'Marketplace', toZone: 'Town', x: -120.8, y: 49.0, label: 'Town' },
  
  { zone: 'Town', toZone: 'Bank', x: 27.4, y: 3.1, label: 'Bank' },
  { zone: 'Bank', toZone: 'Town', x: 15.3, y: -125.2, label: 'Town' },
  
  { zone: 'Town', toZone: 'Guild', x: -58.4, y: 23.8, label: 'Guild' },
  { zone: 'Guild', toZone: 'Town', x: -156.5, y: -7.8, label: 'Town' }
];
