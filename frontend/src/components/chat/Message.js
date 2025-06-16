import { formatDistance } from 'date-fns';

export default function Message({ message }) {
    const isUser = message.role === 'user';
    const formattedTime = formatTimeAgo(message.timestamp);

    return (
        <div className={`py-4 px-6 rounded-lg max-w-2xl mx-auto ${
            isUser 
                ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                : 'bg-gray-50 dark:bg-gray-800'
        }`}>
            <div className="flex items-start">
                <div className="mr-4 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    {isUser ? (
                        <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    ) : (
                        <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {isUser ? 'You' : 'AI Assistant'}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formattedTime}</span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{message.content}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return '';
    
    try {
        // If timestamp is a number (unix timestamp in ms), convert to Date
        const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
        
        // If less than 1 minute ago, show "Just now"
        const secondsAgo = Math.floor((new Date() - date) / 1000);
        if (secondsAgo < 60) {
            return 'Just now';
        }
        
        // For timestamps today, show the time (e.g., "2:30 PM")
        const now = new Date();
        if (date.getDate() === now.getDate() && 
            date.getMonth() === now.getMonth() && 
            date.getFullYear() === now.getFullYear()) {
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        }
        
        // Otherwise, use a relative format like "2 days ago"
        return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
        console.error('Error formatting time:', error);
        return '';
    }
}