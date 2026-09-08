import { StateCreator } from 'zustand';
import { TrackerState } from '../storeTypes';
import { MapSlice } from '../types';
import { MapCompressor } from '../../core/map/MapCompressor';
// Note: defaultTrails.ts removed — trails are lazy-loaded from public/defaultTrails.json
// via chrome.runtime.getURL() in trackerStore.ts (~97KB bundle saving).

export const createMapSlice: StateCreator<TrackerState, [], [], MapSlice> = (set) => ({
  mapSettings: {
    enabled: true,
    borderless: false,
    mapSize: 180,
    edgeGlow: true,
    crtGlitch: true,
    showCommon: true,
    showUncommon: true,
    showRare: true,
    showMythical: true,
    showOres: true,
    showTrees: true,
    showPlants: true,
    showResources: true,
    showDrops: true,
    hiddenMobs: [],
    hiddenResources: [],
    autoRecenter: true,
    autoRecenterDelay: 10,
    mapRefreshRate: 'uncapped',
    mapTheme: 'glass',
    defaultZoom: 10.0,
    mapPosition: { x: 0, y: 0 },
    iconStyle: 'vector_detailed',
    iconScaleMultiplier: 1.0,
    dimmedOpacity: 0.35,
    customColors: {},
  },

  trails: {} as Record<string, string>,
  customZones: [],
  deathSpot: null,
  isRecordingTrail: false,
  isEraserMode: false,

  mapPan: { x: 0, y: 0 },
  mapZoom: 1,

  updateMapSettings: (settings) =>
    set((state) => ({
      mapSettings: { ...state.mapSettings, ...settings },
    })),

  appendTrailPoints: (zone, points) => {
    if (!points.length) return;
    set((state) => {
      const currentB64 = state.trails[zone];
      const existingPoints = currentB64 ? MapCompressor.unpackTrail(currentB64) : [];
      const newB64 = MapCompressor.packTrail([...existingPoints, ...points]);
      return {
        trails: {
          ...state.trails,
          [zone]: newB64,
        },
      };
    });
  },

  setDeathSpot: (point) => set({ deathSpot: point }),

  setMapPan: (pan) => set({ mapPan: pan }),

  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  clearTrail: (zone) =>
    set((state) => {
      const newTrails = { ...state.trails };
      delete newTrails[zone];
      return { trails: newTrails };
    }),

  setIsRecordingTrail: (val) => set({ isRecordingTrail: val }),
  setIsEraserMode: (val) => set({ isEraserMode: val }),

  eraseTrailPoints: (zone, center, radius) => set((state) => {
    if (!state.trails[zone]) return state;
    const existing = MapCompressor.unpackTrail(state.trails[zone]);
    const radiusSq = radius * radius;
    
    // Filter out any points that fall within the eraser circle
    const newPoints = existing.filter(p => {
      const dx = p.x - center.x;
      const dy = p.y - center.y;
      return (dx * dx + dy * dy) > radiusSq;
    });
    
    if (newPoints.length === existing.length) return state; // no points erased
    
    return {
      trails: {
        ...state.trails,
        [zone]: MapCompressor.packTrail(newPoints)
      }
    };
  }),
});
