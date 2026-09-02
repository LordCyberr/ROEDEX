import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrackerStore } from '../../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import {
  Eye, Layers, ChevronDown, ChevronUp,
  Circle, Square, Crosshair, Zap, Grid3X3, Compass, Ruler, RotateCcw,
  Eraser, Upload, Download, MapPin
} from 'lucide-react';
import { MapCompressor } from '../../../core/map/MapCompressor';

// ── Slider ────────────────────────────────────────────────────────────────────
const SettingsSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step = 0.05, unit = '', onChange }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>
        {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(2) : value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${((value - min) / (max - min)) * 100}%, var(--border-accent) ${((value - min) / (max - min)) * 100}%, var(--border-accent) 100%)`,
      }}
    />
  </div>
);

// ── Toggle ────────────────────────────────────────────────────────────────────
const SettingsToggle: React.FC<{
  label: string;
  icon?: React.ReactNode;
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, icon, value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg transition-all duration-200 group"
    style={{
      background: value ? 'color-mix(in srgb, var(--accent-primary) 12%, transparent)' : 'var(--bg-hover)',
      border: `1px solid ${value ? 'color-mix(in srgb, var(--accent-primary) 35%, transparent)' : 'var(--border-subtle)'}`,
    }}
  >
    <div className="flex items-center gap-2">
      {icon && <span style={{ color: value ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{icon}</span>}
      <span className="text-[10px] font-medium" style={{ color: value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
    </div>
    <div
      className="w-8 h-4 rounded-full relative transition-all duration-300"
      style={{ background: value ? 'var(--accent-primary)' : 'var(--border-accent)' }}
    >
      <div
        className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300"
        style={{ left: value ? '18px' : '2px' }}
      />
    </div>
  </button>
);

// ── Layer Button ──────────────────────────────────────────────────────────────
const LayerBtn: React.FC<{
  label: string;
  icon: string;
  active: boolean;
  color: string;
  onClick: () => void;
}> = ({ label, icon, active, color, onClick }) => (
  <button
    onClick={onClick}
    title={`${active ? 'Hide' : 'Show'} ${label}`}
    className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all duration-200 flex-1"
    style={{
      background: active ? `color-mix(in srgb, ${color} 15%, transparent)` : 'var(--bg-hover)',
      border: `1px solid ${active ? `color-mix(in srgb, ${color} 40%, transparent)` : 'var(--border-subtle)'}`,
      opacity: active ? 1 : 0.5,
    }}
  >
    <span className="text-base leading-none">{icon}</span>
    <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: active ? color : 'var(--text-muted)' }}>{label}</span>
  </button>
);

// ── Collapsible Section ───────────────────────────────────────────────────────
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden mb-2" style={{ border: '1px solid var(--border-subtle)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 transition-colors duration-200 cursor-pointer"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--accent-primary)' }}>{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>{title}</span>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="p-3 flex flex-col gap-3" style={{ background: 'color-mix(in srgb, var(--bg-base) 60%, transparent)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MapSettings: React.FC = () => {
  const { mapSettings, updateMapSettings, trails, clearTrail, appendTrailPoints } = useTrackerStore(
    useShallow(state => ({
      mapSettings: state.mapSettings,
      updateMapSettings: state.updateMapSettings,
      trails: state.trails,
      clearTrail: state.clearTrail,
      appendTrailPoints: state.appendTrailPoints
    }))
  );

  const set = (updates: Partial<typeof mapSettings>) => updateMapSettings(updates);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClearTrail = () => {
    if (confirm('Are you sure you want to clear all map trails? This cannot be undone.')) {
      Object.keys(trails).forEach((zone) => clearTrail(zone));
    }
  };

  const handleExportMap = () => {
    const exportData: Record<string, { exploredPoints: { x: number, y: number }[] }> = {};
    for (const [zone, b64] of Object.entries(trails)) {
      const points = MapCompressor.unpackTrail(b64);
      if (points.length > 0) {
        exportData[zone] = { exploredPoints: points };
      }
    }
    
    if (Object.keys(exportData).length === 0) {
      alert("No explored data to export.");
      return;
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roedex_discovered_area_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportMap = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        let importedZones = 0;
        let importedPoints = 0;

        for (const zone in data) {
          if (data[zone] && Array.isArray(data[zone].exploredPoints)) {
            const points = data[zone].exploredPoints.map((p: any) => ({ x: p.x, y: p.y }));
            if (points.length > 0) {
              appendTrailPoints(zone, points);
              importedZones++;
              importedPoints += points.length;
            }
          }
        }

        if (importedZones > 0) {
          alert(`Successfully imported ${importedPoints} points across ${importedZones} zones!`);
        } else {
          alert('No valid map data found in this file. Please make sure it is a valid map export (e.g., roedex_discovered_area.json).');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse the map file. Please make sure it is a valid JSON map export.');
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* ── CORE ── */}
      <Section title="Engine Settings" icon={<RotateCcw size={11} />} defaultOpen={true}>
        <SettingsToggle
          label="Enable Minimap Engine"
          value={mapSettings.enabled}
          onChange={() => set({ enabled: !mapSettings.enabled })}
        />
        <SettingsToggle
          label="Borderless Free-Float Mode"
          value={!!mapSettings.borderless}
          onChange={() => set({ borderless: !mapSettings.borderless })}
        />
      </Section>

      {mapSettings.enabled && (
        <>
          {/* ── DISPLAY ── */}
          <Section title="Display" icon={<Eye size={11} />}>
            {/* Shape */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Shape</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Circle', icon: <Circle size={12} />, value: false },
                  { label: 'Square', icon: <Square size={12} />, value: true },
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => set({ borderless: opt.value })}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer"
                    style={{
                      background: (!!mapSettings.borderless) === opt.value
                        ? 'color-mix(in srgb, var(--accent-primary) 18%, transparent)'
                        : 'var(--bg-hover)',
                      border: `1px solid ${(!!mapSettings.borderless) === opt.value
                        ? 'color-mix(in srgb, var(--accent-primary) 50%, transparent)'
                        : 'var(--border-subtle)'}`,
                      color: (!!mapSettings.borderless) === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-1 flex flex-col gap-3">
              <SettingsSlider
                label="Minimap Size"
                value={mapSettings.mapSize || 180}
                min={120}
                max={600}
                step={10}
                unit="px"
                onChange={v => set({ mapSize: v })}
              />
              <SettingsSlider
                label="Window Opacity"
                value={mapSettings.opacity ?? 1.0}
                min={0.2}
                max={1.0}
                step={0.05}
                onChange={v => set({ opacity: v })}
              />
              <SettingsSlider
                label="Icon Scale"
                value={mapSettings.iconScaleMultiplier || 1.0}
                min={0.5}
                max={2.5}
                step={0.1}
                unit="×"
                onChange={v => set({ iconScaleMultiplier: v })}
              />
              <SettingsSlider
                label="Dimmed Entity Opacity"
                value={mapSettings.dimmedOpacity ?? 0.35}
                min={0.05}
                max={0.9}
                step={0.05}
                onChange={v => set({ dimmedOpacity: v })}
              />
            </div>

            {/* Icon Style */}
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Icon Theme</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['vector_detailed', 'minimal_icons', 'geometric', 'hollow_shapes', 'high_contrast', 'retro_pixel'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => set({ iconStyle: s as any })}
                    className="py-1.5 rounded-lg text-[9px] font-bold capitalize transition-all duration-200 cursor-pointer"
                    style={{
                      background: mapSettings.iconStyle === s
                        ? 'color-mix(in srgb, var(--accent-primary) 18%, transparent)'
                        : 'var(--bg-hover)',
                      border: `1px solid ${mapSettings.iconStyle === s
                        ? 'color-mix(in srgb, var(--accent-primary) 50%, transparent)'
                        : 'var(--border-subtle)'}`,
                      color: mapSettings.iconStyle === s ? 'var(--accent-primary)' : 'var(--text-muted)',
                    }}
                  >{s.replace('_', ' ')}</button>
                ))}
              </div>
            </div>
          </Section>

          {/* ── LAYERS ── */}
          <Section title="Layers" icon={<Layers size={11} />}>
            <div className="flex gap-2">
              <LayerBtn label="Mobs" icon="⚔️" active={mapSettings.showMobs !== false} color="#f87171"
                onClick={() => set({ showMobs: !(mapSettings.showMobs !== false) })} />
              <LayerBtn label="Nodes" icon="⛏️" active={mapSettings.showOres !== false} color="#60a5fa"
                onClick={() => set({ showOres: !(mapSettings.showOres !== false) })} />
              <LayerBtn label="Trees" icon="🌲" active={mapSettings.showTrees !== false} color="#4ade80"
                onClick={() => set({ showTrees: !(mapSettings.showTrees !== false) })} />
            </div>
            <div className="flex gap-2">
              <LayerBtn label="Plants" icon="🌿" active={mapSettings.showPlants !== false} color="#86efac"
                onClick={() => set({ showPlants: !(mapSettings.showPlants !== false) })} />
              <LayerBtn label="Drops" icon="💎" active={mapSettings.showDrops !== false} color="#fbbf24"
                onClick={() => set({ showDrops: !(mapSettings.showDrops !== false) })} />
              <LayerBtn label="Portals" icon="🌀" active={mapSettings.showPortals !== false} color="#c084fc"
                onClick={() => set({ showPortals: !(mapSettings.showPortals !== false) })} />
            </div>

            <div className="h-px my-1" style={{ background: 'var(--border-subtle)' }} />
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Rarity Filter</span>
            <div className="flex gap-2">
              <LayerBtn label="Common" icon="⬜" active={mapSettings.showCommon !== false} color="#9ca3af"
                onClick={() => set({ showCommon: !(mapSettings.showCommon !== false) })} />
              <LayerBtn label="Uncommon" icon="🟦" active={mapSettings.showUncommon !== false} color="#3b82f6"
                onClick={() => set({ showUncommon: !(mapSettings.showUncommon !== false) })} />
              <LayerBtn label="Rare" icon="🟩" active={mapSettings.showRare !== false} color="#22c55e"
                onClick={() => set({ showRare: !(mapSettings.showRare !== false) })} />
              <LayerBtn label="Mythic" icon="🟪" active={mapSettings.showMythical !== false} color="#a855f7"
                onClick={() => set({ showMythical: !(mapSettings.showMythical !== false) })} />
            </div>
          </Section>

          {/* ── OVERLAYS ── */}
          <Section title="Overlays" icon={<Compass size={11} />} defaultOpen={false}>
            <SettingsToggle label="Compass Rose" icon={<Compass size={12} />}
              value={mapSettings.showCompass !== false}
              onChange={v => set({ showCompass: v })} />
            <SettingsToggle label="Grid Lines" icon={<Grid3X3 size={12} />}
              value={!!mapSettings.showGrid}
              onChange={v => set({ showGrid: v })} />
            <SettingsToggle label="Scale Bar" icon={<Ruler size={12} />}
              value={!!mapSettings.showScaleBar}
              onChange={v => set({ showScaleBar: v })} />
            <SettingsToggle label="Coordinates HUD" icon={<Crosshair size={12} />}
              value={mapSettings.showCoordinates !== false}
              onChange={v => set({ showCoordinates: v })} />
            <SettingsToggle label="Auto Re-center Camera" icon={<RotateCcw size={12} />}
              value={mapSettings.autoRecenter !== false}
              onChange={v => set({ autoRecenter: v })} />
            {mapSettings.autoRecenter && (
              <div className="mt-1">
                <SettingsSlider
                  label="Re-center Delay"
                  value={mapSettings.autoRecenterDelay || 10}
                  min={3}
                  max={60}
                  step={1}
                  unit="s"
                  onChange={v => set({ autoRecenterDelay: v as any })}
                />
              </div>
            )}
          </Section>

          {/* ── DATA MANAGEMENT ── */}
          <Section title="Data Management" icon={<MapPin size={11} />} defaultOpen={false}>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleClearTrail}
                className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 px-3 rounded-lg border border-red-500/20 transition-colors text-[10px] font-bold cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Clear Explored Trails ({Object.keys(trails).length} zones)</span>
              </button>

              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center space-x-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-2 px-3 rounded-lg border border-emerald-500/20 transition-colors text-[10px] font-bold cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import</span>
                </button>
                <button
                  onClick={handleExportMap}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2 px-3 rounded-lg border border-blue-500/20 transition-colors text-[10px] font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportMap}
                accept=".json"
                className="hidden"
              />
            </div>
          </Section>

          {/* ── ADVANCED ── */}
          <Section title="Advanced" icon={<Zap size={11} />} defaultOpen={false}>
            <SettingsToggle label="Edge Glow Effect"
              value={!!mapSettings.edgeGlow}
              onChange={v => set({ edgeGlow: v })} />
            <SettingsToggle label="CRT Scanline Glitch"
              value={!!mapSettings.crtGlitch}
              onChange={v => set({ crtGlitch: v })} />
            <SettingsToggle label="Record Player Path"
              value={mapSettings.recordPaths !== false}
              onChange={v => set({ recordPaths: v })} />

            {/* Map theme */}
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Map Theme</span>
              <div className="grid grid-cols-2 gap-2">
                {(['glass', 'cyber', 'tactical', 'minimal'] as const).map(t => (
                  <button key={t}
                    onClick={() => set({ mapTheme: t })}
                    className="py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all duration-200 cursor-pointer"
                    style={{
                      background: mapSettings.mapTheme === t
                        ? 'color-mix(in srgb, var(--accent-primary) 18%, transparent)'
                        : 'var(--bg-hover)',
                      border: `1px solid ${mapSettings.mapTheme === t
                        ? 'color-mix(in srgb, var(--accent-primary) 50%, transparent)'
                        : 'var(--border-subtle)'}`,
                      color: mapSettings.mapTheme === t ? 'var(--accent-primary)' : 'var(--text-muted)',
                    }}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* Reset button */}
            <button
              onClick={() => updateMapSettings({
                mapSize: 180, opacity: 1.0 as any, borderless: false,
                iconStyle: 'vector_detailed' as any, iconScaleMultiplier: 1.0, dimmedOpacity: 0.35,
                showCommon: true, showUncommon: true, showRare: true, showMythical: true,
                showOres: true, showTrees: true, showPlants: true, showMobs: true,
                showDrops: true, showPortals: true, edgeGlow: false, crtGlitch: false,
                showCompass: true, showGrid: false, showScaleBar: false, autoRecenter: true,
                mapTheme: 'glass',
              })}
              className="w-full mt-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-200 hover:opacity-80 cursor-pointer"
              style={{
                background: 'color-mix(in srgb, #ef4444 10%, transparent)',
                border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)',
                color: '#f87171',
              }}
            >
              Reset to Defaults
            </button>
          </Section>
        </>
      )}
    </div>
  );
};
