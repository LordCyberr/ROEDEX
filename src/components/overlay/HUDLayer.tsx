/**
 * @file HUDLayer.tsx
 * @description In-game heads-up display layer for ROEDEX overlay.
 * Groups WeaponUI, ArmorUI, EfficiencyHUD, DirectionalArrow, and TargetUI into a lightweight layer.
 */

import React from 'react';
import { WeaponUI } from '../widgets/WeaponUI';
import { ArmorUI } from '../widgets/ArmorUI';
import { EfficiencyHUD } from '../widgets/EfficiencyHUD';
import { DirectionalArrow } from './DirectionalArrow';
import { PlayerHPBar } from '../widgets/PlayerHPBar';
import { ErrorBoundary } from '../widgets/ErrorBoundary';

export const HUDLayer: React.FC = React.memo(() => {
  return (
    <>
      <ErrorBoundary><WeaponUI /></ErrorBoundary>
      <ErrorBoundary><ArmorUI /></ErrorBoundary>
      <ErrorBoundary><EfficiencyHUD /></ErrorBoundary>
      <ErrorBoundary><PlayerHPBar /></ErrorBoundary>
      <ErrorBoundary><DirectionalArrow /></ErrorBoundary>
    </>
  );
});

HUDLayer.displayName = 'HUDLayer';
