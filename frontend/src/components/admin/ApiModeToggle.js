import React, { useState, useEffect } from 'react';
import appConfig from '../../config/appConfig';

/**
 * API Mode Toggle Component
 * 
 * Allows switching between mock and production API modes during development.
 * This component should only be visible in development mode and for admin users.
 */
const ApiModeToggle = () => {
  const [apiMode, setApiMode] = useState(appConfig.api.mode);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Update state when API mode changes
  useEffect(() => {
    setApiMode(appConfig.api.mode);
  }, []);
  
  // Toggle API mode
  const handleToggleMode = () => {
    const newMode = apiMode === 'mock' ? 'production' : 'mock';
    setShowConfirmation(true);
  };
  
  // Confirm mode change
  const handleConfirmChange = () => {
    // Only available in development
    if (process.env.NODE_ENV !== 'development') return;
    
    // Toggle the mode using appConfig
    appConfig.dev.toggleApiMode();
    
    // Update state
    setApiMode(appConfig.api.mode === 'mock' ? 'production' : 'mock');
    setShowConfirmation(false);
    
    // The toggleApiMode function will reload the page automatically
  };
  
  // Cancel mode change
  const handleCancelChange = () => {
    setShowConfirmation(false);
  };
  
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            API Mode: <span className="font-bold">{apiMode.toUpperCase()}</span>
          </h3>
          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
            {apiMode === 'mock' 
              ? 'Using mock data for all API requests' 
              : 'Using production API endpoints'}
          </p>
        </div>
        
        <button
          onClick={handleToggleMode}
          className="px-3 py-1 text-xs font-medium rounded-md bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-700"
        >
          Switch to {apiMode === 'mock' ? 'Production' : 'Mock'} Mode
        </button>
      </div>
      
      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Confirm API Mode Change
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to switch to {apiMode === 'mock' ? 'production' : 'mock'} mode? 
              This will reload the page and may affect your current work.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelChange}
                className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChange}
                className="px-4 py-2 text-sm font-medium rounded-md bg-rose-600 text-white hover:bg-rose-700"
              >
                Switch Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiModeToggle;
