import React from 'react';
import { Link } from 'react-router-dom';

export default function AgentsHome() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Agents - Home
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Explore different AI agents available on our platform.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            to="/agents/minion" 
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Minion
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Task management and automation interface for AI agents
            </p>
          </Link>
          
          {/* Add more agent cards here as needed */}
        </div>
      </div>
    </div>
  );
} 