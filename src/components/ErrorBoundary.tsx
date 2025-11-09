// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { useToast } from 'react-hot-toast'; // Optional: If you want hook-based toast inside class (fallback to toast.error)

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // Custom fallback UI if provided
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global app error:', error, errorInfo);
    // Optional: Send to Sentry or Supabase logs
    // toast.error('Something went wrong—reloading page'); // Uncomment if toast hook available
    window.setTimeout(() => {
      // Auto-reload after 5s to avoid stuck state
      window.location.reload();
    }, 5000);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4" role="alert" aria-live="assertive">
          <div className="text-center max-w-md space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something broke.</h2>
              <p className="text-gray-600 dark:text-gray-400">We'll reload the app to fix it (5 seconds).</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Reload Now
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}