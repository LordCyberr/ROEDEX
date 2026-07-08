export interface LocationPoint {
  x: number;
  y: number;
}

// Maps a zone name to its entrance coordinates from Town, and its entrance coordinates from inside
export const ZoneEntrances: Record<string, { townSide: LocationPoint, insideSide: LocationPoint }> = {
  'BlackSmith': {
    townSide: { x: 5.37, y: -18.28 },
    insideSide: { x: -111.83, y: -8.56 }
  },
  'Tavern': {
    townSide: { x: -24.52, y: -12.84 },
    insideSide: { x: -156.74, y: 40.60 }
  },
  'House': {
    townSide: { x: -39.50, y: -8.81 },
    insideSide: { x: -167.97, y: 94.90 }
  },
  'Alchemist': {
    townSide: { x: -57.73, y: -18.65 },
    insideSide: { x: -114.64, y: 82.36 }
  },
  'Guild': {
    townSide: { x: -58.30, y: 23.51 },
    insideSide: { x: -156.68, y: -6.67 }
  },
  'Mines': {
    townSide: { x: -6.66, y: 59.47 },
    insideSide: { x: 90.65, y: 105.59 }
  },
  'Marketplace': {
    townSide: { x: -6.96, y: 9.72 },
    insideSide: { x: -121.19, y: 49.72 }
  },
  'Bank': {
    townSide: { x: 28.59, y: 3.26 },
    insideSide: { x: 16.18, y: -123.52 }
  },
  'Forest': {
    townSide: { x: -69.62, y: -3.75 },
    insideSide: { x: 443.68, y: -16.55 }
  }
};
