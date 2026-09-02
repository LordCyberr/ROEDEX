import React from 'react';
import { AnimatePresence } from 'motion/react';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ErrorBoundary } from '../widgets/ErrorBoundary';
import { PoppedOutWindowComponent } from './PoppedOutWindowComponent';
import { PoppedOutWindow } from '../../store/storeTypes';

interface Props {
  constraintsRef: React.RefObject<HTMLDivElement | null>;
}

export const PoppedOutWindowManager: React.FC<Props> = ({ constraintsRef }) => {
  const poppedOutWindows = useSettingsStore(useShallow(state => state.poppedOutWindows));

  return (
    <AnimatePresence>
      {(Object.values(poppedOutWindows) as PoppedOutWindow[]).map(win => (
        <ErrorBoundary key={win.id}>
          <PoppedOutWindowComponent window={win} constraintsRef={constraintsRef} />
        </ErrorBoundary>
      ))}
    </AnimatePresence>
  );
};
