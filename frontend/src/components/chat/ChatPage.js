import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import ChatHeader from './ChatHeader';
import Sidebar from './SideBar';
import ChatWindow from './ChatWindow';
import InputArea from './InputArea';

export default function ChatPage() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([{ 
        role: 'assistant', 
        content: 'Hello! How can I help you today?', 
        timestamp: new Date() 
    }]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentConversation, setCurrentConversation] = useState({
        id: 'new',
        title: 'New Chat',
        createdAt: new Date(),
    });
    const messagesEndRef = useRef(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = (content) => {
        if (!content.trim()) return;
        
        // Add user message
        const userMessage = { role: 'user', content, timestamp: new Date() };
        setMessages([...messages, userMessage]);
        
        // Show typing indicator
        setIsTyping(true);
        
        // Mock API delay - replace with actual API call
        setTimeout(() => {
            const aiResponse = { 
                role: 'assistant', 
                content: getAIResponse(content),
                timestamp: new Date() 
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
            
            // If this is a new conversation, set a title based on the first message
            if (currentConversation.id === 'new' && messages.length <= 1) {
                const title = content.length > 30 
                    ? content.substring(0, 30) + '...' 
                    : content;
                setCurrentConversation(prev => ({
                    ...prev,
                    id: Date.now().toString(),
                    title
                }));
            }
        }, 1000);
    };

    // Mock response function - replace with actual API integration
    const getAIResponse = (query) => {
        // Simple responses for demo purposes
        const responses = [
            "I understand what you're asking about. Let me think about that...",
            "That's an interesting question! Here's what I know about this topic.",
            "I'd be happy to help with that! Here's some information that might be useful.",
            "Great question! Based on my knowledge, I can share the following insights.",
            "I've analyzed your question and can provide the following information."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    };

    if (!isAuthenticated) {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="flex h-full bg-white dark:bg-gray-900">
            <Sidebar 
                currentConversation={currentConversation}
                setCurrentConversation={setCurrentConversation}
                setMessages={setMessages}
                user={user}
            />
            <div className="flex-1 flex flex-col h-full relative border-l border-gray-200 dark:border-gray-700">
                <ChatHeader 
                    title={currentConversation.title} 
                    conversationId={currentConversation.id}
                />
                <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                    <div className="max-w-3xl mx-auto pt-6 pb-32">
                        {messages.length === 1 && (
                            <div className="text-center px-4 py-12">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">How can I help you today?</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-8">Ask me anything, and I'll do my best to assist you.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                                    {[
                                        "Write a poem about artificial intelligence",
                                        "Help me plan a weekly meal schedule",
                                        "Explain quantum computing in simple terms",
                                        "Give me ideas for my next project"
                                    ].map((suggestion, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => sendMessage(suggestion)}
                                            className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <ChatWindow 
                            messages={messages} 
                            isTyping={isTyping} 
                            messagesEndRef={messagesEndRef}
                        />
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-md p-4">
                    <div className="max-w-3xl mx-auto">
                        <InputArea sendMessage={sendMessage} isTyping={isTyping} />
                    </div>
                </div>
            </div>
        </div>
    );
}