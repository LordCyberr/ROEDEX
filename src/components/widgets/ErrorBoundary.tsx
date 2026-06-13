import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ROEDEX] Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4 bg-[var(--bg-panel)] text-[var(--text-primary)] rounded-lg border border-red-500/30">
          <AlertTriangle className="text-red-500 mb-2 animate-pulse" size={32} />
          <h2 className="text-sm font-bold text-red-400 mb-1">Component Crashed</h2>
          <p className="text-[10px] text-[var(--text-muted)] text-center mb-4 max-w-[200px]">
            {this.state.error?.message || "An unexpected error occurred rendering this view."}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] hover:bg-white/10 border border-[var(--border-subtle)] rounded-full text-[10px] uppercase font-bold transition-colors"
          >
            <RefreshCcw size={12} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
