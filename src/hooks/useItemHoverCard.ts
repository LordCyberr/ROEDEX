/**
 * @file useItemHoverCard.ts
 * @description Global event listener delegation hook for Item Hover Cards.
 * Listens for mouseover events on elements with `data-item-id` or `data-item-name` attributes
 * and exposes positioning and item details for the hover tooltip.
 */

import { useState, useEffect } from 'react';

export interface HoveredItemInfo {
  itemId: string;
  rect: DOMRect;
}

export function useItemHoverCard() {
  const [hoveredInfo, setHoveredInfo] = useState<HoveredItemInfo | null>(null);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const itemEl = target.closest('[data-item-id], [data-item-name]') as HTMLElement | null;
      if (itemEl) {
        const itemId = itemEl.getAttribute('data-item-id') || itemEl.getAttribute('data-item-name');
        if (itemId) {
          const rect = itemEl.getBoundingClientRect();
          setHoveredInfo({ itemId, rect });
          return;
        }
      }

      // If mouse is not over an item element, clear hover card (unless over hover card itself)
      if (!target.closest('#roedex-item-hover-card')) {
        setHoveredInfo(null);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (!related || !related.closest('[data-item-id], [data-item-name], #roedex-item-hover-card')) {
        setHoveredInfo(null);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return hoveredInfo;
}
