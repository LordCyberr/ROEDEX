import { Vector2 } from '../../../types/events';

export interface TableRowData {
  id: string;
  name: string;
  zone?: string;
  dist: number;
  nearestPos?: Vector2;
  counts?: { alive: number; dead: number };
  respawnTimesMs?: number[];
}
