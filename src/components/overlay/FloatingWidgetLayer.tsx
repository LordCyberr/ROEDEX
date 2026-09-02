/**
 * @file FloatingWidgetLayer.tsx
 * @description Floating widgets and notifications layer for ROEDEX overlay.
 * Houses NotificationToaster, CompanionOverlay, MinimizedOrb, and NPCTranslationBubble.
 */

import React from 'react';
import { NotificationToaster } from '../widgets/NotificationToaster';
import { CompanionOverlay } from '../widgets/CompanionOverlay';
import { NPCTranslationBubble } from './NPCTranslationBubble';
import { ErrorBoundary } from '../widgets/ErrorBoundary';
import { WhatsNewBanner } from './WhatsNewBanner';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';

const CompanionGuideOverlay = React.lazy(() => import('./CompanionGuideOverlay').then(m => ({ default: m.CompanionGuideOverlay })));

export const FloatingWidgetLayer: React.FC<{ containerRef?: any }> = React.memo(({ containerRef }) => {
  const { tutorialStep, tutorialCompleted } = useSettingsStore(
    useShallow((state: any) => ({
      tutorialStep: state.notificationSettings?.tutorialStep ?? 0,
      tutorialCompleted: state.notificationSettings?.tutorialCompleted ?? false,
    }))
  );

  return (
    <>
      {/* MinimizedOrb is managed exclusively by OverlayContainer's isMinimized ternary.
          DO NOT render it here — it would produce a duplicate ghost orb on screen. */}
      {(tutorialCompleted || tutorialStep > 0) && (
        <ErrorBoundary><CompanionOverlay constraintsRef={containerRef} /></ErrorBoundary>
      )}
      <NPCTranslationBubble />
      <ErrorBoundary><NotificationToaster /></ErrorBoundary>
      <ErrorBoundary><React.Suspense fallback={null}><CompanionGuideOverlay /></React.Suspense></ErrorBoundary>
      <ErrorBoundary><WhatsNewBanner /></ErrorBoundary>
    </>
  );
});

FloatingWidgetLayer.displayName = 'FloatingWidgetLayer';
