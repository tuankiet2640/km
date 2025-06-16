import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-bold text-rose-600 dark:text-rose-400 mb-6">
          Hello World :3
        </h1>
        <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">
          Welcome to my AI platform! This application provides cutting-edge AI services to help you with various tasks. 
          Explore the different features and discover what AI can do for you.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-rose-100 dark:border-rose-900/30">
            <div className="rounded-full w-12 h-12 bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">AI Chat</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Chat with advanced AI models including GPT-4 and Claude 3 Opus.
            </p>
            <Link to="/chat" className="text-rose-600 dark:text-rose-400 hover:underline font-medium">
              Start chatting →
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-rose-100 dark:border-rose-900/30">
            <div className="rounded-full w-12 h-12 bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Learning Resources</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Explore learning materials to help you get the most out of AI.
            </p>
            <Link to="/learning" className="text-rose-600 dark:text-rose-400 hover:underline font-medium">
              Start learning →
            </Link>
          </div>
        </div>
        
        <Link to="/chat" className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium shadow-md transition-colors">
          Get Started
        </Link>
      </div>
    </div>
  );
} 