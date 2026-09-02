import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../../hooks/useTranslation';

// ── Settings Panel ─────────────────────────────────────────────────────────────
export const AAAMapSettingsPanel: React.FC<{
  mapSettings: any;
  onUpdate: (s: any) => void;
  onClose: () => void;
}> = ({ mapSettings, onUpdate, onClose }) => {
  const { t } = useTranslation();
  const toggles: Array<{ key: string; label: string; color: string; defaultOn: boolean }> = [
    { key: 'fogOfWar',           label: t('minimap.toggles.fogOfWar'),           color: '#818cf8', defaultOn: true  },
    { key: 'showZonePill',       label: t('minimap.toggles.showZonePill'),       color: '#38bdf8', defaultOn: true  },
    { key: 'showDiscoveryBar',   label: t('minimap.toggles.showDiscoveryBar'),   color: '#38bdf8', defaultOn: true  },
    { key: 'discoveryBeam',      label: t('minimap.toggles.discoveryBeam'),      color: '#facc15', defaultOn: true  },
    { key: 'showOffScreenRadar', label: t('minimap.toggles.showOffScreenRadar'), color: '#c084fc', defaultOn: true  },
    { key: 'showGrid',           label: t('minimap.toggles.showGrid'),           color: '#64748b', defaultOn: false },
    { key: 'showCompass',        label: t('minimap.toggles.showCompass'),        color: '#f97316', defaultOn: true  },
    { key: 'showMobs',           label: t('minimap.toggles.showMobs'),           color: '#f87171', defaultOn: true  },
    { key: 'showPortals',        label: t('minimap.toggles.showPortals'),        color: '#22ff66', defaultOn: true  },
    { key: 'showDrops',          label: t('minimap.toggles.showDrops'),          color: '#fef08a', defaultOn: true  },
    { key: 'showCommon',         label: t('minimap.toggles.showCommon'),         color: '#9ca3af', defaultOn: true  },
    { key: 'showRare',           label: t('minimap.toggles.showRare'),           color: '#4ade80', defaultOn: true  },
    { key: 'showMythical',       label: t('minimap.toggles.showMythical'),       color: '#c084fc', defaultOn: true  },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className={`absolute ${mapSettings.popoutLeft ? 'right-full mr-2 origin-top-right' : 'left-full ml-2 origin-top-left'} top-0 z-50`}
      style={{
        background: 'linear-gradient(160deg, rgba(8,17,30,0.98), rgba(4,9,20,0.99))',
        border: '1px solid rgba(56,189,248,0.3)',
        borderRadius: 16,
        padding: '14px',
        width: 220,
        backdropFilter: 'blur(24px)',
        boxShadow: '0 0 40px rgba(56,189,248,0.15), 0 24px 64px rgba(0,0,0,0.95)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400/80">{t('minimap.title')}</span>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-[11px] font-bold px-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer">x</button>
      </div>

      <div className="mb-3">
        <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">{t('minimap.trailColor')}</div>
        <div className="flex gap-2 flex-wrap">
          {['#facc15', '#38bdf8', '#4ade80', '#c084fc', '#f87171', '#fb923c'].map(c => (
            <button key={c} onClick={() => onUpdate({ trailColor: c })}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 cursor-pointer"
              style={{ background: c, borderColor: mapSettings.trailColor === c ? '#fff' : 'transparent', boxShadow: mapSettings.trailColor === c ? `0 0 8px ${c}` : 'none' }}
            />
          ))}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex justify-between">
          <span>{t('minimap.mapSize')}</span>
          <span className="text-cyan-400 font-mono">{Math.round(mapSettings.mapSize || 200)}px</span>
        </div>
        <div className="relative flex items-center">
          <input type="range" min={150} max={460} step={10}
            value={mapSettings.mapSize || 200}
            onChange={e => onUpdate({ mapSize: +e.target.value, mapWidth: +e.target.value, mapHeight: +e.target.value })}
            className="w-full h-2 appearance-none rounded-full cursor-pointer bg-slate-800 border border-cyan-500/30 accent-cyan-400" />
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex justify-between">
          <span>{t('minimap.opacity')}</span>
          <span className="text-cyan-400 font-mono">{Math.round((mapSettings.opacity ?? 1) * 100)}%</span>
        </div>
        <div className="relative flex items-center">
          <input type="range" min={0.2} max={1} step={0.05}
            value={mapSettings.opacity ?? 1}
            onChange={e => onUpdate({ opacity: +e.target.value })}
            className="w-full h-2 appearance-none rounded-full cursor-pointer bg-slate-800 border border-cyan-500/30 accent-cyan-400" />
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">{t('minimap.shape')}</div>
        <div className="grid grid-cols-3 gap-1">
          {(['circle', 'square', 'rectangle'] as const).map(shape => {
            const active = (mapSettings.mapShape || 'circle') === shape;
            return (
              <button key={shape}
                onClick={() => onUpdate({ mapShape: shape, borderless: shape !== 'circle' })}
                className="py-1.5 rounded-lg text-[8.5px] font-bold capitalize transition-all cursor-pointer"
                style={{
                  background: active ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.06)'}`,
                  color: active ? '#38bdf8' : '#4b5563',
                }}
              >{t(`minimap.shapes.${shape}` as any)}</button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-white/5 my-2" />

      <div className="grid grid-cols-2 gap-1">
        {toggles.map(({ key, label, color, defaultOn }) => {
          const storedVal = mapSettings[key];
          const isOn = storedVal !== undefined ? Boolean(storedVal) : defaultOn;
          return (
            <button key={key} onClick={() => onUpdate({ [key]: !isOn })}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-left cursor-pointer"
              style={{
                background: isOn ? `${color}18` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isOn ? color + '45' : 'rgba(255,255,255,0.04)'}`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200" style={{ background: isOn ? color : '#1f2937' }} />
              <span className="text-[8.5px] font-semibold truncate transition-colors duration-200" style={{ color: isOn ? '#e2e8f0' : '#4b5563' }}>{label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
