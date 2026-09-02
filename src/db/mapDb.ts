import Dexie, { Table } from 'dexie';

export interface MapExploredRecord {
  zoneName: string;
  points: { x: number; y: number }[];
}

export class MapDatabase extends Dexie {
  exploredPaths!: Table<MapExploredRecord, string>;

  constructor() {
    super('RoedexMapDB');
    this.version(1).stores({
      exploredPaths: 'zoneName' // zoneName is the primary key
    });
  }
}

export const mapDb = new MapDatabase();
