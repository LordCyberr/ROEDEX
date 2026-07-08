import { useTrackerStore } from '../../store/trackerStore';

export function initializeErrorInterceptor() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    try {
      const msg = event.message || 'Unknown Error';
      const stack = event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`;
      
      // Ignore ResizeObserver loop limit errors which are mostly harmless and spammy
      if (msg.includes('ResizeObserver loop limit exceeded')) return;
      if (msg.includes('ResizeObserver loop completed with undelivered notifications')) return;
      
      useTrackerStore.getState().logError(`[Uncaught Error] ${msg}`, stack);
    } catch (e) {
      // Prevent infinite loops if store itself throws
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      let msg = 'Unhandled Promise Rejection';
      let stack = '';
      
      if (event.reason instanceof Error) {
        msg = `[Unhandled Promise] ${event.reason.message}`;
        stack = event.reason.stack || '';
      } else if (typeof event.reason === 'string') {
        msg = `[Unhandled Promise] ${event.reason}`;
      } else {
        try {
          msg = `[Unhandled Promise] ${JSON.stringify(event.reason)}`;
        } catch (e) {
          msg = `[Unhandled Promise] [Unstringifiable Object]`;
        }
      }
      
      useTrackerStore.getState().logError(msg, stack);
    } catch (e) {
      // Prevent infinite loops
    }
  });
}
