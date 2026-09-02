/**
 * @file ModalLayer.tsx
 * @description Global modals and window overlays layer for ROEDEX.
 * Encapsulates MarketplaceWindow, LifetimeStatsWindow, RunHistoryWindow, ChangelogModal, GlobalSearchModal, and QuickStatsDrawer.
 */

import React, { Suspense } from 'react';
import { ItemHoverCard } from '../ui/ItemHoverCard';
import { ErrorBoundary } from '../widgets/ErrorBoundary';

const MarketplaceWindow = React.lazy(() => import('../views/market/MarketplaceWindow').then(m => ({ default: m.MarketplaceWindow })));
const LifetimeStatsWindow = React.lazy(() => import('./LifetimeStatsWindow').then(m => ({ default: m.LifetimeStatsWindow })));
const RunHistoryWindow = React.lazy(() => import('./RunHistoryWindow').then(m => ({ default: m.RunHistoryWindow })));
const ChangelogModal = React.lazy(() => import('../ui/ChangelogModal').then(m => ({ default: m.ChangelogModal })));
const GlobalSearchModal = React.lazy(() => import('../ui/GlobalSearchModal').then(m => ({ default: m.GlobalSearchModal })));
const QuickStatsDrawer = React.lazy(() => import('../widgets/QuickStatsDrawer').then(m => ({ default: m.QuickStatsDrawer })));

export const ModalLayer: React.FC = React.memo(() => {
  return (
    <Suspense fallback={null}>
      <ErrorBoundary><MarketplaceWindow /></ErrorBoundary>
      <ErrorBoundary><LifetimeStatsWindow /></ErrorBoundary>
      <ErrorBoundary><RunHistoryWindow /></ErrorBoundary>
      <ErrorBoundary><ChangelogModal /></ErrorBoundary>
      <ErrorBoundary><GlobalSearchModal /></ErrorBoundary>
      <ErrorBoundary><QuickStatsDrawer /></ErrorBoundary>
      <ErrorBoundary><ItemHoverCard /></ErrorBoundary>
    </Suspense>
  );
});

ModalLayer.displayName = 'ModalLayer';
