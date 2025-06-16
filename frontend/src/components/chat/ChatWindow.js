import Message from './Message';
import InputArea from './InputArea';
import { useEffect } from 'react';

export default function ChatWindow({ messages, isTyping, messagesEndRef }) {
    // If this is used for demo purposes and you need to clear the hardcoded messages
    // messages = messages || [];
    
    return (
        <div className="space-y-6">
            {messages.map((message, index) => (
                <Message key={index} message={message} />
            ))}
            
            {isTyping && (
                <div className="py-4 px-6 rounded-lg bg-gray-50 dark:bg-gray-800 max-w-2xl mx-auto">
                    <div className="flex items-center">
                        <div className="mr-4 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                            <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                            <div className="flex space-x-2">
                                <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"></div>
                                <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse delay-150"></div>
                                <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse delay-300"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div ref={messagesEndRef} />
        </div>
    );
}