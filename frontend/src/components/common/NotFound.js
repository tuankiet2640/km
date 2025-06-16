import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <h1 className="text-5xl font-extrabold text-rose-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
