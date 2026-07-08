import { Vector2 } from '../types/events';

export type NodeType = 'Blackoak' | 'Ironwood' | 'Bronzewood' | 'Dreadwood' | 'Cinderheart' | 'Goldleaf' | 'Godwood' | 'Endpoint' | 'Mob' | 'chest' | 'portal';
export type PathPriority = 'Primary' | 'Secondary' | 'LowPriority';

export interface MapNode {
  id: string;
  type: NodeType;
  position: Vector2;
  color: string;
  label?: string;
}

export interface RoutePath {
  id: string;
  priority: PathPriority;
  color: string; // Red for Primary, Blue for Secondary, Yellow for LowPriority
  points: Vector2[]; // Array of coordinates that make up the line
}

// These coordinates will be mapped to the SVG canvas using the map calibration data.
// Replace { x: 0, y: 0 } with actual in-game coordinates.

export const FOREST_CALIBRATION = {
  topLeft: { x: 72.37, y: 109.31 }, 
  bottomRight: { x: 452.52, y: -92.55 } 
};

export const FOREST_NODES: MapNode[] = [
  { id: 'forest_chest_1', type: 'chest', position: { x: 168.09, y: 4.68 }, color: '#fbbf24', label: 'Forest Chest' },
  { id: 'forest_chest_2', type: 'chest', position: { x: 277.54, y: -45.81 }, color: '#fbbf24', label: 'Forest Chest' },
  { id: 'forest_chest_3', type: 'chest', position: { x: 292.26, y: 72.38 }, color: '#fbbf24', label: 'Forest Chest' },
  { id: 'forest_mine_portal_1', type: 'portal', position: { x: 255.10, y: -35.40 }, color: '#a855f7', label: 'Mine Entrance' }
];

export const FOREST_ROUTES: RoutePath[] = [
  {
    id: 'main-route-1',
    priority: 'Primary',
    color: '#34d399', // Emerald
    points: [
      { x: 120.0, y: 15.0 },
      { x: 130.0, y: 12.0 },
      { x: 145.0, y: 5.0 },
      { x: 160.0, y: 0.0 },
      { x: 175.0, y: -10.0 },
      { x: 190.0, y: -20.0 },
      { x: 210.0, y: -30.0 },
      { x: 230.0, y: -35.0 },
      { x: 250.0, y: -35.0 }
    ]
  },
  {
    id: 'optional-branch-1',
    priority: 'Secondary',
    color: '#fbbf24', // Amber
    points: [
      { x: 145.0, y: 5.0 },
      { x: 150.0, y: 10.0 },
      { x: 160.0, y: 12.0 },
      { x: 168.09, y: 4.68 } // Leads to forest_chest_1
    ]
  }
];

export interface MapZone {
  id: string;
  name: string;
  position: Vector2;
  radius: number; // In world coordinates
}

export const FOREST_ZONES: MapZone[] = [
  { id: 'zone-north', name: 'North Slime Camp', position: { x: 170.0, y: 15.0 }, radius: 40 },
  { id: 'zone-wolves', name: 'Wolf Den', position: { x: 230.0, y: -25.0 }, radius: 35 },
  { id: 'zone-golem', name: 'Golem Core', position: { x: 260.0, y: -40.0 }, radius: 25 },
];