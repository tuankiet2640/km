import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    setActiveConversation, 
    setSearchQuery,
    fetchConversations 
} from '../../store/conversationSlice';
import { 
    selectFilteredConversations, 
    selectActiveConversation,
    selectSearchQuery 
} from '../../store/selectors';

export default function Sidebar({ currentConversation, setCurrentConversation, setMessages, user }) {
    const dispatch = useDispatch();
    const conversations = useSelector(selectFilteredConversations) || [];
    const activeConversationId = useSelector(selectActiveConversation);
    const reduxSearchQuery = useSelector(selectSearchQuery);
    const [searchQuery, setLocalSearchQuery] = useState('');
    
    // Fetch conversations when component mounts
    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);
    
    // Sync local search query with Redux state
    useEffect(() => {
        if (searchQuery !== reduxSearchQuery) {
            dispatch(setSearchQuery(searchQuery));
        }
    }, [searchQuery, reduxSearchQuery, dispatch]);

    const handleNewChat = () => {
        setCurrentConversation({
            id: 'new',
            title: 'New Chat',
            createdAt: new Date(),
        });
        setMessages([{ 
            role: 'assistant', 
            content: 'Hello! How can I help you today?', 
            timestamp: new Date() 
        }]);
    };

    const handleSelectConversation = (conversation) => {
        // Update Redux state
        dispatch(setActiveConversation(conversation.id));
        
        // Update local state
        setCurrentConversation(conversation);
        
        // In a real app, you would fetch the messages for this conversation from an API
        setMessages([
            { 
                role: 'assistant', 
                content: 'Hello! How can I help you today?', 
                timestamp: new Date(conversation.lastUpdated.getTime() - 1000 * 60) 
            },
            { 
                role: 'user', 
                content: conversation.preview, 
                timestamp: conversation.lastUpdated 
            },
            { 
                role: 'assistant', 
                content: "I'd be happy to help with that! Let me know if you need more specific information.", 
                timestamp: new Date(conversation.lastUpdated.getTime() + 1000 * 30) 
            },
        ]);
    };

    return (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
            <div className="p-4">
                <button
                    onClick={handleNewChat}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                    <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    New Chat
                </button>
            </div>

            <div className="px-4 pb-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 dark:text-white"
                    />
                    <svg
                        className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Recent Conversations
                </h3>
                
                {conversations.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No conversations found</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {conversations.map((conversation) => (
                            <li key={conversation.id}>
                                <button
                                    onClick={() => handleSelectConversation(conversation)}
                                    className={`w-full px-3 py-2 flex flex-col items-start rounded-md transition-colors ${
                                        currentConversation.id === conversation.id
                                            ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <h4 className="font-medium text-sm truncate max-w-[170px]">
                                            {conversation.title}
                                        </h4>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                            {formatDate(conversation.lastUpdated)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full mt-1">
                                        {conversation.preview}
                                    </p>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-300">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                            ) : (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.accountType || 'Free Account'}</p>
                    </div>
                    <button className="ml-auto p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

function formatDate(date) {
    // Format the date to a relative string (e.g., "2h ago", "3d ago")
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
        return diffDay === 1 ? '1d ago' : `${diffDay}d ago`;
    } else if (diffHour > 0) {
        return diffHour === 1 ? '1h ago' : `${diffHour}h ago`;
    } else if (diffMin > 0) {
        return diffMin === 1 ? '1m ago' : `${diffMin}m ago`;
    } else {
        return 'Just now';
    }
}