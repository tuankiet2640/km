import React from 'react';
import { Link } from 'react-router-dom';

export default function NotAuthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <h1 className="text-4xl font-bold text-rose-600 mb-4">403 - Not Authorized</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          You do not have permission to access this page.<br />
          Please contact your administrator if you believe this is an error.
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
