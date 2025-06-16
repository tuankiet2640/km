import { useState, useRef, useEffect } from 'react';

export default function InputArea({ sendMessage, isTyping }) {
    const [input, setInput] = useState('');
    const textareaRef = useRef(null);

    // Auto-resize textarea as content grows
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to get the correct scrollHeight
        textarea.style.height = 'auto';
        
        // Set new height based on scrollHeight (with a max height)
        const newHeight = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = `${newHeight}px`;
        
        // Only show scrollbar when content exceeds max height
        textarea.style.overflowY = textarea.scrollHeight > 200 ? 'auto' : 'hidden';
    }, [input]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isTyping) {
            sendMessage(input);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={isTyping}
                className="w-full p-4 pr-16 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none min-h-[56px] max-h-[200px] overflow-y-hidden"
                rows={1}
            />
            
            <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-3 bottom-3 p-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </button>
            
            {isTyping && (
                <div className="absolute -top-8 left-0 right-0 text-center">
                    <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">
                        AI is typing...
                    </span>
                </div>
            )}
        </form>
    );
}