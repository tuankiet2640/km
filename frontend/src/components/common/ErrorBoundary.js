import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error info here if needed
    // console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <h1 className="text-5xl font-extrabold text-rose-600 mb-4">Unexpected Error</h1>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Sorry, an unexpected error occurred.<br/>
              {this.state.error && <span className="block mt-2 text-sm text-rose-500">{this.state.error.message}</span>}
            </p>
            <button
              className="inline-block px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium transition"
              onClick={() => window.location.href = '/'}
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
