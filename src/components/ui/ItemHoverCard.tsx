/**
 * @file ItemHoverCard.tsx
 * @description Rich hover card component for ROEDEX item inspection.
 * Displays sanitized item name, rarity badge, floor/resell price, drop sources,
 * and 7-day marketplace trends when hovering over items across the UI.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useItemHoverCard } from '../../hooks/useItemHoverCard';
import { DB_LOOKUP, GAME_DATABASE } from '../../data/gameDatabase';
import { RESELL_VALUES } from '../../data/prices';
import { formatInternalName, getRarityColor } from '../../utils/formatters';
import { getRarityClass } from '../../utils/rarity';
import { useMarketDatabaseStore } from '../../store/marketDatabaseStore';
import { Coins, TrendingUp, TrendingDown, Layers, MapPin } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const ItemHoverCard: React.FC = React.memo(() => {
  const hoverInfo = useItemHoverCard();
  const { t } = useTranslation();
  const getMarketAnalysis = useMarketDatabaseStore((s: any) => s.getMarketAnalysis);

  if (!hoverInfo) return null;

  const { itemId, rect } = hoverInfo;
  const normalizedKey = itemId.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Look up entity or drop details
  const dbEntry = DB_LOOKUP[normalizedKey];
  const displayName = formatInternalName(itemId);
  const rarity = dbEntry?.rarity || 'common';
  const rarityClass = getRarityClass(rarity);

  // Price lookup
  const resellPrice = RESELL_VALUES[itemId.toLowerCase()] || RESELL_VALUES[displayName.toLowerCase()] || 0;

  // Drop sources
  const sources = GAME_DATABASE.filter(entity =>
    entity.drops.some(d => d.itemId.toLowerCase() === normalizedKey || d.sanitizedName.toLowerCase() === displayName.toLowerCase())
  ).map(e => e.sanitizedName);

  // 7-day trend analysis
  const marketAnalysis = getMarketAnalysis ? getMarketAnalysis(itemId) : null;

  // Calculate screen positioning
  const cardWidth = 220;
  const left = Math.min(Math.max(10, rect.left + rect.width / 2 - cardWidth / 2), window.innerWidth - cardWidth - 10);
  const top = rect.top > 200 ? rect.top - 10 : rect.bottom + 10;
  const transformOrigin = rect.top > 200 ? 'bottom center' : 'top center';

  return (
    <AnimatePresence>
      <motion.div
        id="roedex-item-hover-card"
        initial={{ opacity: 0, scale: 0.9, y: rect.top > 200 ? 5 : -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'fixed',
          top: `${top}px`,
          left: `${left}px`,
          width: `${cardWidth}px`,
          transformOrigin,
          zIndex: 9999,
        }}
        className="glass-panel border border-[var(--border-accent)] rounded-xl p-3 shadow-2xl backdrop-blur-xl bg-[var(--bg-panel)]/95 pointer-events-none text-left"
      >
        {/* Header: Name + Rarity Badge */}
        <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-[var(--border-subtle)]">
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">
              {displayName}
            </h4>
            <span className="text-[9px] text-[var(--text-muted)] font-mono uppercase">
              ID: {itemId}
            </span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${rarityClass}`}
            style={{ color: getRarityColor(rarity) }}
          >
            {rarity}
          </span>
        </div>

        {/* Price Row */}
        <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/[0.03] border border-white/[0.05] mb-2 text-[10px]">
          <span className="text-[var(--text-muted)] flex items-center gap-1">
            <Coins size={10} className="text-amber-400" />
            {t('itemCard.resellValue') || 'Floor / Resell'}
          </span>
          <span className="font-bold text-amber-400">
            {resellPrice ? `${resellPrice.toLocaleString()} R` : t('itemCard.unpriced') || 'N/A'}
          </span>
        </div>

        {/* 7-Day Market Trend */}
        {marketAnalysis && (
          <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/[0.03] border border-white/[0.05] mb-2 text-[10px]">
            <span className="text-[var(--text-muted)] flex items-center gap-1">
              <Layers size={10} />
              {t('itemCard.trend7d') || '7d Trend'}
            </span>
            <div className="flex items-center gap-1 font-bold">
              {marketAnalysis.priceChangePct >= 0 ? (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp size={10} /> +{marketAnalysis.priceChangePct.toFixed(1)}%
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-0.5">
                  <TrendingDown size={10} /> {marketAnalysis.priceChangePct.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        )}

        {/* Drop Sources */}
        {sources.length > 0 && (
          <div className="pt-1 border-t border-[var(--border-subtle)] text-[9px]">
            <span className="text-[var(--text-muted)] uppercase font-semibold flex items-center gap-1 mb-1">
              <MapPin size={9} />
              {t('itemCard.dropSources') || 'Drop Sources'}
            </span>
            <div className="flex flex-wrap gap-1">
              {sources.slice(0, 3).map(source => (
                <span
                  key={source}
                  className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-white/5 text-[var(--text-secondary)] font-medium"
                >
                  {source}
                </span>
              ))}
              {sources.length > 3 && (
                <span className="text-[var(--text-muted)] self-center">
                  +{sources.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});
