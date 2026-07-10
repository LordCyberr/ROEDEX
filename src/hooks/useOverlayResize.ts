import React from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { MotionValue } from 'motion/react';

interface UseOverlayResizeProps {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  isHorizontal: boolean;
  activeDimKey: string;
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export function useOverlayResize({
  overlayRef,
  isHorizontal,
  activeDimKey,
  x,
  y,
}: UseOverlayResizeProps) {
  const handleResizeDown = (e: React.PointerEvent, dir: string) => {
    e.stopPropagation();
    e.preventDefault();
    const el = overlayRef.current;
    if (!el) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = el.getBoundingClientRect().width;
    const startH = el.getBoundingClientRect().height;
    const startOverlayX = x.get();
    const startOverlayY = y.get();
    
    const minW = isHorizontal ? 420 : 220;
    const minH = isHorizontal ? 150 : 200;
    const maxW = window.innerWidth - 16;
    const maxH = window.innerHeight * 0.85;
    
    const onMove = (me: PointerEvent) => {
      let newW = startW;
      let newH = startH;
      let newX = startOverlayX;
      let newY = startOverlayY;
      
      if (dir.includes('e')) {
        newW = Math.max(minW, Math.min(maxW, startW + (me.clientX - startX)));
      } else if (dir.includes('w')) {
        newW = Math.max(minW, Math.min(maxW, startW - (me.clientX - startX)));
        newX = startOverlayX + (startW - newW);
      }
      
      if (dir.includes('s')) {
        newH = Math.max(minH, Math.min(maxH, startH + (me.clientY - startY)));
      } else if (dir.includes('n')) {
        newH = Math.max(minH, Math.min(maxH, startH - (me.clientY - startY)));
        newY = startOverlayY + (startH - newH);
      }
      
      if (dir.includes('e') || dir.includes('w')) {
        el.style.width = `${newW}px`;
      }
      if (dir.includes('s') || dir.includes('n')) {
        el.style.height = `${newH}px`;
      }
      
      if (dir.includes('w')) x.set(newX);
      if (dir.includes('n')) y.set(newY);
    };
    
    const onUp = () => {
      const w = el.style.width;
      const h = el.style.height;
      const finalW = (w && w.endsWith('px')) ? parseInt(w) : undefined;
      const finalH = (h && h.endsWith('px')) ? parseInt(h) : undefined;
      
      const currentDimObj = useSettingsStore.getState().tabDimensions[activeDimKey] || {};
      
      const saveW = (dir.includes('e') || dir.includes('w')) ? finalW : currentDimObj.width;
      const saveH = (dir.includes('s') || dir.includes('n')) ? finalH : currentDimObj.height;
      
      if (saveW || saveH) {
        useSettingsStore.getState().setTabDimensions(activeDimKey, saveW, saveH);
      }
      useSettingsStore.getState().setOverlayPosition({ x: x.get(), y: y.get() });
      
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return { handleResizeDown };
}
