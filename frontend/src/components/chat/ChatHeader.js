import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedModel } from '../../store/modelSlice';
import { selectAvailableModels, selectSelectedModel } from '../../store/selectors';

// Define default model values to use when Redux state isn't available
const defaultModels = [
    { label: 'GPT-4', id: 'gpt-4' },
    { label: 'GPT-3.5 Turbo', id: 'gpt-3.5-turbo' },
    { label: 'Claude 3 Opus', id: 'claude-opus' },
    { label: 'Claude 3 Sonnet', id: 'claude-sonnet' },
    { label: 'Claude 3 Haiku', id: 'claude-haiku' },
];

const defaultModel = defaultModels[0];

export default function ChatHeader({ title = 'New Chat', conversationId }) {
    const dispatch = useDispatch();
    
    // Use selectors with fallbacks
    const selectedModel = useSelector(selectSelectedModel) || defaultModel;
    const availableModels = useSelector(selectAvailableModels) || defaultModels;
    
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsModelDropdownOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleModelSelect = (modelId) => {
        dispatch(setSelectedModel(modelId));
        setIsModelDropdownOpen(false);
    };

    return (
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white truncate max-w-md">
                        {title}
                    </h2>
                    {conversationId !== 'new' && (
                        <span className="ml-2 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 text-xs rounded-full">
                            Active
                        </span>
                    )}
                </div>
                
                <div className="flex items-center space-x-3">
                    {/* Model Selector */}
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                            className="flex items-center px-3 py-1.5 text-sm font-medium bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-md"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {selectedModel.label}
                            <svg
                                className={`ml-1 h-4 w-4 transition-transform ${isModelDropdownOpen ? 'transform rotate-180' : ''}`}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        
                        {isModelDropdownOpen && (
                            <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                    {availableModels.map((model) => (
                                        <button
                                            key={model.id}
                                            onClick={() => handleModelSelect(model.id)}
                                            className={`block w-full text-left px-4 py-2 text-sm ${
                                                selectedModel.id === model.id
                                                    ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                                                    : 'text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-700 dark:hover:text-rose-300'
                                            }`}
                                            role="menuitem"
                                        >
                                            {model.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Share conversation"
                        aria-label="Share conversation"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                    
                    <button 
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Export conversation"
                        aria-label="Export conversation"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}