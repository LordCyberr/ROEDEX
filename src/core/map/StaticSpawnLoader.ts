export class StaticSpawnLoader {
    static loadZoneSpawns(zoneName: string) {
        if (!zoneName) return;
        
        if (Boolean((import.meta as any).env?.DEV)) {
          console.log(`[StaticSpawnLoader] Loading static spawns for zone: ${zoneName}`);
        }
        
        // We let the TrackerStore handle static spawns or they can be loaded by CanvasMapEngine later.
    }
}
