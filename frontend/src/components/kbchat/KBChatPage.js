import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import KBDropdown from './KBDropdown';
import { useQueryKnowledgeBaseMutation } from '../../features/api/ragApi';

/**
 * KBChatPage - Chat UI with Knowledge Base selection
 * Users can select a KB and chat with it (RAG).
 */
export default function KBChatPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedKb, setSelectedKb] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const [queryKnowledgeBase, { isLoading: isSending, error: queryApiError }] = useQueryKnowledgeBaseMutation();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedKb) return;
    const userMsg = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    try {
      const response = await queryKnowledgeBase({ kbId: selectedKb.id, query: currentInput }).unwrap();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.answer || (response.result || 'No answer.'),
        timestamp: new Date()
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${e?.data?.message || e?.error || 'Failed to get answer.'}`,
        timestamp: new Date()
      }]);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative">
      {/* KB Selection Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto p-4 flex items-center gap-2 sm:gap-4">
          <label htmlFor="kb-select" className="font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">Knowledge Base:</label>
          <KBDropdown value={selectedKb?.id} onChange={setSelectedKb} className="w-full" />
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto pt-6 pb-32 px-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
              {selectedKb
                ? `Ask anything about "${selectedKb.name}".`
                : "Please select a Knowledge Base to begin chatting."}
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-4 py-2 max-w-xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-100'}`}>
                <span>{msg.content}</span>
                <div className={`text-xs mt-1 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                  {msg.role === 'user' ? user?.username || 'You' : 'Assistant'}
                </div>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="mb-4 flex justify-start">
              <div className="rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-gray-100 animate-pulse">
                Assistant is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-md">
        <div className="max-w-3xl mx-auto p-4">
          <form
            className="flex gap-2 w-full"
            onSubmit={e => { e.preventDefault(); handleSend(); }}
            autoComplete="off"
          >
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder={selectedKb ? `Ask about ${selectedKb.name}...` : 'Select a Knowledge Base first'}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!selectedKb || isSending}
              aria-label="Ask a question"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              disabled={!input.trim() || !selectedKb || isSending}
            >
              Send
            </button>
          </form>
        </div>
      </div>
      {/* Removed separate error display at the bottom as errors are pushed to messages list */}
    </div>
  );
}
