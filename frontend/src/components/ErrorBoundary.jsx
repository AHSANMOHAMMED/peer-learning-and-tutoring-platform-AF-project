import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-12 md:p-16 shadow-lg relative overflow-hidden">
            {/* Decorative background icon */}
            <div className="absolute top-0 right-0 p-16 opacity-[0.04] pointer-events-none rotate-12">
              <ShieldAlert size={180} />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-100">
                <AlertTriangle size={32} />
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                  Something went wrong
                </h1>
                <p className="text-slate-500 text-base leading-relaxed max-w-md">
                  The application encountered an unexpected error. Please try refreshing the page or return to the dashboard.
                </p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Error Details</p>
                <code className="text-sm font-mono text-rose-500 break-all leading-relaxed">
                  {this.state.error?.toString() || 'An unknown error occurred'}
                </code>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 h-14 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-slate-700 transition-colors active:scale-[0.98] flex items-center justify-center gap-2.5"
                >
                  <RefreshCw size={16} /> Refresh Page
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 h-14 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors active:scale-[0.98] flex items-center justify-center gap-2.5"
                >
                  <Home size={16} /> Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
