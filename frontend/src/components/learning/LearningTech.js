import React from 'react';

const LearningTech = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            <span className="text-rose-600 dark:text-rose-400">🧠</span> Technology Behind MAI
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Explore the innovative technologies that power our AI platform
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="mb-12 bg-gradient-to-br from-rose-50 to-indigo-50 dark:from-rose-900/30 dark:to-indigo-900/30 p-8 rounded-xl shadow-sm">
            <h2 className="flex items-center text-rose-600 dark:text-rose-400">
              <span className="text-2xl mr-3">🚀</span> Local RAG Service with FastAPI
            </h2>
            <p>
              A flexible Retrieval-Augmented Generation (RAG) service that supports multiple LLM and embedding providers, built with FastAPI.
            </p>
            
            <h3 className="flex items-center">
              <span className="text-xl mr-2">✨</span> Key Features
            </h3>
            <ul>
              <li className="flex items-start">
                <span className="text-lg mr-2 mt-1">🤖</span>
                <span><strong>Multiple LLM Providers:</strong> Support for Ollama (local models), OpenAI, and Azure OpenAI</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2 mt-1">🔄</span>
                <span><strong>Multiple Embedding Providers:</strong> Flexible embedding options for different use cases</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2 mt-1">📄</span>
                <span><strong>Document Processing:</strong> Handle PDF, CSV, and TXT files with ease</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2 mt-1">🔍</span>
                <span><strong>FAISS Vector Store:</strong> Efficient similarity search for fast retrieval</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2 mt-1">💬</span>
                <span><strong>Conversation Memory:</strong> Maintain chat history for contextual responses</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2 mt-1">⚙️</span>
                <span><strong>Configurable:</strong> Fully configurable through environment variables</span>
              </li>
            </ul>
            
            <h3 className="flex items-center">
              <span className="text-xl mr-2">🌟</span> Recent Improvements
            </h3>
            <ul>
              <li className="flex items-start">
                <span className="text-lg mr-2 mt-1">🏗️</span>
                <span><strong>Enhanced Provider Architecture:</strong> Flexible provider-based design for easy switching between models</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2 mt-1">⚙️</span>
                <span><strong>Centralized Configuration:</strong> Settings managed through a central .env file with validation</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2 mt-1">🛡️</span>
                <span><strong>Improved Error Handling:</strong> Comprehensive error handling with helpful messages</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2 mt-1">📦</span>
                <span><strong>Dependency Management:</strong> Automatic validation of required dependencies</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2 mt-1">🔄</span>
                <span><strong>Updated LLM Integration:</strong> Latest LangChain packages for optimal performance</span>
              </li>
            </ul>
          </div>

          <h2 className="flex items-center">
            <span className="text-2xl mr-3">🧩</span> How RAG Powers Our Platform
          </h2>
          <p>
            Retrieval-Augmented Generation (RAG) is a powerful technique that enhances large language models by providing them with relevant information retrieved from a knowledge base. Here's how it powers our platform:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="flex items-center text-lg font-semibold mb-4">
                <span className="text-xl mr-2">📚</span> Knowledge Retrieval
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                When you ask a question, our system searches through its knowledge base using advanced vector embeddings to find the most relevant information.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="flex items-center text-lg font-semibold mb-4">
                <span className="text-xl mr-2">💡</span> Context Enhancement
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The retrieved information is added as context to the AI model, allowing it to generate more accurate, relevant, and factual responses.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="flex items-center text-lg font-semibold mb-4">
                <span className="text-xl mr-2">🔄</span> Continuous Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our knowledge base can be continuously updated with new information, ensuring that the AI always has access to the most current data.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="flex items-center text-lg font-semibold mb-4">
                <span className="text-xl mr-2">🛡️</span> Reduced Hallucinations
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                By grounding responses in retrieved facts, RAG significantly reduces the AI's tendency to generate incorrect or fabricated information.
              </p>
            </div>
          </div>

          <h2 className="flex items-center">
            <span className="text-2xl mr-3">🔧</span> Technical Architecture
          </h2>
          
          <p>
            Our RAG service is built with a flexible, modular architecture that allows for easy customization and expansion:
          </p>

          {/* Add new Frontend Architecture section here */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 my-8">
            <h3 className="flex items-center text-xl font-semibold mb-6">
              <span className="text-2xl mr-3">🎨</span> Frontend Architecture
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="flex items-center text-lg font-medium mb-3">
                  <span className="text-xl mr-2">📁</span> Core Structure
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-rose-500">⚛️</span>
                    <span><strong>React 18</strong> - Modern UI with hooks</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">📘</span>
                    <span><strong>TypeScript</strong> - Type-safe development</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-500">🔀</span>
                    <span><strong>React Router v6</strong> - Client routing</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500">📊</span>
                    <span><strong>Redux Toolkit</strong> - State management</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="flex items-center text-lg font-medium mb-3">
                  <span className="text-xl mr-2">🎯</span> Key Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-indigo-500">💾</span>
                    <span><strong>State Management</strong> - Redux + Context API</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-amber-500">🎨</span>
                    <span><strong>Design System</strong> - TailwindCSS + Dark mode</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-cyan-500">🔌</span>
                    <span><strong>API Integration</strong> - Axios + Socket.IO</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-emerald-500">⚡</span>
                    <span><strong>Performance</strong> - Code splitting + Lazy loading</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="flex items-center text-lg font-medium mb-3">
                  <span className="text-xl mr-2">📂</span> Folder Structure
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm">
                  <pre className="text-gray-700 dark:text-gray-300">
                  {`src/
├── 📁 components/    # Reusable UI components
├── 📁 features/      # Feature-specific logic
├── 🎣 hooks/         # Custom React hooks
├── 🔌 services/      # API communication
├── 📊 store/         # Redux store config
├── 🎨 styles/        # Global styles
└── 🛠️ utils/         # Helper functions`}
                  </pre>
                </div>
              </div>
            </div>
          </div>


          <h2 className="flex items-center">
            <span className="text-2xl mr-3">🛠️</span> Technologies Used
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-3xl mb-2">🐍</span>
              <h3 className="text-lg font-semibold mb-1">Python</h3>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                Core programming language for backend services
              </p>
            </div>
            
            <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-3xl mb-2">⚡</span>
              <h3 className="text-lg font-semibold mb-1">FastAPI</h3>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                Modern, fast web framework for building APIs
              </p>
            </div>
            
            <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-3xl mb-2">🦜</span>
              <h3 className="text-lg font-semibold mb-1">LangChain</h3>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                Framework for developing LLM-powered applications
              </p>
            </div>
            
            <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-3xl mb-2">🔍</span>
              <h3 className="text-lg font-semibold mb-1">FAISS</h3>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                Vector database for efficient similarity search
              </p>
            </div>
            
            <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-3xl mb-2">🤖</span>
              <h3 className="text-lg font-semibold mb-1">Ollama</h3>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                Run large language models locally
              </p>
            </div>
            
            <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-3xl mb-2">🧠</span>
              <h3 className="text-lg font-semibold mb-1">OpenAI</h3>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                Powerful cloud-based AI models
              </p>
            </div>
          </div>

          <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-lg my-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Interested in Learning More?</h3>
            <p className="mb-4">
              Check out our other learning resources or contact us to learn how you can implement similar technologies in your projects.
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="/learning/courses" 
                className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
              >
                Explore Courses
              </a>
              <a 
                href="/learning/docs" 
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Read Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningTech; 