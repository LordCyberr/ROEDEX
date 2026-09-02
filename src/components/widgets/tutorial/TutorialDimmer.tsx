/**
 * @file TutorialDimmer.tsx
 * @description Tutorial Spotlight and Dimmer component for ROEDEX companion guide.
 * Renders 4-panel fixed dim backdrop overlays that create a cutout spotlight hole
 * around the target UI element while maintaining click-through precision.
 */

import React from 'react';

interface Props {
  targetRect: DOMRect | null;
  sTop: number;
  sHeight: number;
  sLeft: number;
  sWidth: number;
  allowGameInteraction?: boolean;
}

export const TutorialDimmer: React.FC<Props> = ({ targetRect, sTop, sHeight, sLeft, sWidth, allowGameInteraction }) => {
  if (!targetRect) return null;
  
  return (
    <>
      <div className={`absolute top-0 left-0 right-0 ${allowGameInteraction ? 'pointer-events-none bg-black/20' : 'pointer-events-auto bg-black/75'} transition-all duration-500`} style={{ height: sTop }} />
      <div className={`absolute bottom-0 left-0 right-0 ${allowGameInteraction ? 'pointer-events-none bg-black/20' : 'pointer-events-auto bg-black/75'} transition-all duration-500`} style={{ top: sTop + sHeight }} />
      <div className={`absolute ${allowGameInteraction ? 'pointer-events-none bg-black/20' : 'pointer-events-auto bg-black/75'} transition-all duration-500`} style={{ top: sTop, height: sHeight, left: 0, width: sLeft }} />
      <div className={`absolute ${allowGameInteraction ? 'pointer-events-none bg-black/20' : 'pointer-events-auto bg-black/75'} transition-all duration-500`} style={{ top: sTop, height: sHeight, left: sLeft + sWidth, right: 0 }} />
    </>
  );
};

export const TutorialSpotlight = TutorialDimmer;
