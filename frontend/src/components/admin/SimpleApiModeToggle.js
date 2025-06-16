import React, { useState, useEffect } from 'react';
import appConfig from '../../config/appConfig';

/**
 * Simple API Mode Toggle Component
 * 
 * A lightweight component that allows switching between mock and production API modes
 * during development. Only visible in development mode.
 */
const SimpleApiModeToggle = () => {
  const [apiMode, setApiMode] = useState(appConfig.api.mode);
  
  // Update the UI when API mode changes
  const toggleApiMode = () => {
    // Only available in development
    if (process.env.NODE_ENV !== 'development') return;
    
    // Toggle the mode
    appConfig.dev.toggleApiMode();
    
    // Update state (though page will reload)
    setApiMode(appConfig.api.mode === 'mock' ? 'production' : 'mock');
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
          onClick={toggleApiMode}
          className="px-3 py-1 text-xs font-medium rounded-md bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-700"
        >
          Switch to {apiMode === 'mock' ? 'Production' : 'Mock'} Mode
        </button>
      </div>
    </div>
  );
};

export default SimpleApiModeToggle;
