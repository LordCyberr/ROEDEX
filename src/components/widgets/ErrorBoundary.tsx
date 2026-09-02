import { Component, ErrorInfo, ReactNode } from 'react';
import { useTrackerStore } from '../../store/trackerStore';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** If true, renders nothing on error instead of a visible UI element */
  silent?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — catches React render errors and CONTAINS them.
 * 
 * CRITICAL: Previously this component re-threw the caught error (line 40: `throw this.state.error`),
 * which made the boundary completely useless — errors would propagate to the root and blank the app.
 * Now it silently swallows errors and renders null (or a custom fallback).
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ROEDEX ErrorBoundary] Caught and contained error:', error.message);

    // Push the React error into the global error log so Debug Panel can show it
    try {
      useTrackerStore.getState().logError(
        `React Error: ${error.message || 'Unknown Error'}`,
        `Stack: ${error.stack}\nComponent Stack: ${errorInfo.componentStack}`
      );
    } catch {
      // Ignore if logError itself fails (e.g. store not yet initialized)
    }
  }

  public render() {
    if (this.state.hasError) {
      // Return fallback if provided, otherwise render nothing (silent containment)
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return null;
    }

    return this.props.children;
  }
}
