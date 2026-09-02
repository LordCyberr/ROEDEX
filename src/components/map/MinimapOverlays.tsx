import React from 'react';

// ── Zone Tabs for fullscreen map ──────────────────────────────────────────────
export const ZONE_TAB_ORDER = [
  'Forest', 'Mines', 'Lower Mines', 'Town',
  'Blacksmith', 'Marketplace', 'Alchemist', 'Bank', 'Tavern', 'Guild',
];

export const FullscreenZoneTabs: React.FC<{
  activeZone: string | null;
  currentPlayerZone: string | null;
  onSelectZone: (zone: string) => void;
}> = React.memo(({ activeZone, currentPlayerZone, onSelectZone }) => (
  <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-auto"
    style={{ paddingTop: 14 }}>
    <div
      role="tablist"
      aria-label="Zone Map Selector"
      className="flex gap-1 px-3 py-1.5 rounded-full"
      style={{
        background: 'rgba(4,10,28,0.88)',
        border: '1px solid rgba(56,189,248,0.2)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.8), 0 0 20px rgba(56,189,248,0.1)',
      }}>
      {ZONE_TAB_ORDER.map(z => {
        const isActive = (activeZone || '').toLowerCase() === z.toLowerCase();
        const isPlayerHere = (currentPlayerZone || '').toLowerCase() === z.toLowerCase();
        return (
          <button
            key={z}
            role="tab"
            aria-selected={isActive}
            aria-label={`View ${z} map`}
            onClick={() => onSelectZone(z)}
            className="fullscreen-zone-tab px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
            style={{
              background: isActive
                ? 'linear-gradient(135deg, rgba(56,189,248,0.25), rgba(56,189,248,0.1))'
                : 'transparent',
              border: isActive ? '1px solid rgba(56,189,248,0.5)' : '1px solid transparent',
              color: isActive ? '#38bdf8' : isPlayerHere ? '#4ade80' : '#64748b',
              boxShadow: isActive ? '0 0 12px rgba(56,189,248,0.2)' : 'none',
              textShadow: isActive ? '0 0 8px rgba(56,189,248,0.6)' : 'none',
            }}>
            {isPlayerHere && !isActive && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"
                style={{ boxShadow: '0 0 6px #4ade80' }} />
            )}
            {z}
          </button>
        );
      })}
    </div>
  </div>
));

// ── Legend Panel for fullscreen map ───────────────────────────────────────────
const LEGEND_ITEMS = [
  { label: 'Mythical',    color: '#c084fc', glow: 'rgba(192,132,252,0.6)' },
  { label: 'Rare',        color: '#4ade80', glow: 'rgba(74,222,128,0.6)'  },
  { label: 'Uncommon',    color: '#60a5fa', glow: 'rgba(96,165,250,0.5)'  },
  { label: 'Common',      color: '#9ca3af', glow: 'rgba(156,163,175,0.4)' },
  { label: 'Zone Portal', color: '#22ff66', glow: 'rgba(34,255,102,0.5)'  },
];

export const FullscreenLegend: React.FC = React.memo(() => (
  <div
    role="region"
    aria-label="Map Legend"
    className="absolute bottom-6 left-6 z-50 pointer-events-auto"
    style={{
      background: 'rgba(4,10,28,0.9)',
      border: '1px solid rgba(56,189,248,0.2)',
      borderRadius: 12,
      padding: '10px 14px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
      minWidth: 130,
    }}>
    <div className="text-[8px] font-black uppercase tracking-[0.15em] text-cyan-400/70 mb-2"
      style={{ borderBottom: '1px solid rgba(56,189,248,0.15)', paddingBottom: 4 }}>
      LEGEND
    </div>
    {LEGEND_ITEMS.map(({ label, color, glow }) => (
      <div key={label} className="flex items-center gap-2 py-[3px]">
        <span className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: color, boxShadow: `0 0 6px ${glow}` }} />
        <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
      </div>
    ))}
  </div>
));

// ── Compass Rose ──────────────────────────────────────────────────────────────
export const CompassRose: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" stroke="rgba(56,189,248,0.25)" strokeWidth="1.2" />
    <circle cx="32" cy="32" r="22" stroke="rgba(56,189,248,0.12)" strokeWidth="0.8" strokeDasharray="2 2" />
    <line x1="32" y1="4" x2="32" y2="60" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    <line x1="4" y1="32" x2="60" y2="32" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    <polygon points="32,4 28,28 32,22 36,28" fill="#ef4444" opacity="0.95" />
    <polygon points="32,4 32,22 36,28" fill="#dc2626" opacity="0.95" />
    <polygon points="32,60 36,36 32,42 28,36" fill="rgba(255,255,255,0.35)" />
    <polygon points="4,32 28,28 22,32 28,36" fill="rgba(255,255,255,0.3)" />
    <polygon points="60,32 36,36 42,32 36,28" fill="rgba(255,255,255,0.3)" />
    <circle cx="32" cy="32" r="3.5" fill="rgba(255,255,255,0.9)" />
    <circle cx="32" cy="32" r="1.8" fill="#ef4444" />
    <text x="32" y="13" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#ef4444" fontFamily="monospace">N</text>
    <text x="32" y="58" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="rgba(255,255,255,0.5)" fontFamily="monospace">S</text>
    <text x="10" y="34.5" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="rgba(255,255,255,0.5)" fontFamily="monospace">W</text>
    <text x="54" y="34.5" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="rgba(255,255,255,0.5)" fontFamily="monospace">E</text>
    <text x="49" y="16" textAnchor="middle" fontSize="4" fontWeight="600" fill="rgba(255,255,255,0.35)" fontFamily="monospace">NE</text>
    <text x="15" y="16" textAnchor="middle" fontSize="4" fontWeight="600" fill="rgba(255,255,255,0.35)" fontFamily="monospace">NW</text>
    <text x="49" y="52" textAnchor="middle" fontSize="4" fontWeight="600" fill="rgba(255,255,255,0.35)" fontFamily="monospace">SE</text>
    <text x="15" y="52" textAnchor="middle" fontSize="4" fontWeight="600" fill="rgba(255,255,255,0.35)" fontFamily="monospace">SW</text>
  </svg>
);
