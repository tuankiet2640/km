# KM AI Platform - Advanced Knowledge Management System

A comprehensive, enterprise-grade AI platform built with FastAPI and React.js, featuring advanced AI-powered knowledge management, retrieval-augmented generation (RAG), multi-modal chat capabilities, workflow orchestration, and MCP (Model Context Protocol) integration.

## 🎯 Overview

KM AI Platform is a complete, next-generation AI knowledge management system that delivers enterprise-grade capabilities with cutting-edge AI integration. Built from the ground up with modern technologies, it provides a scalable, maintainable, and feature-rich solution for organizations seeking to harness the power of their knowledge assets through advanced AI workflows and intelligent automation.

## ✨ Key Features

### 🧠 Advanced AI Chat System
- **Real-time Streaming Responses**: Live AI responses with token-by-token streaming
- **Multi-modal Input Support**: Text, voice, files, images, and workflow execution
- **Multiple AI Provider Support**: OpenAI, Anthropic, DeepSeek, Qwen, and more
- **Mobile & Touch Optimized**: Native mobile experience with touch controls
- **Context-Aware Conversations**: Maintains conversation history and context
- **Voice Recognition & Synthesis**: Speech-to-text and text-to-speech capabilities
- **File Processing**: Direct file upload and processing in chat
- **Quality Feedback System**: User ratings and feedback collection
- **MCP Tool Integration**: External tool calling and service integration

### 📚 Enhanced Knowledge Base System
- **Hierarchical Organization**: Dataset → Document → Paragraph → Problem structure
- **Multiple Dataset Types**: Base, Web-scraped, and External integrations
- **Advanced Document Processing**: PDF, DOCX, TXT, CSV, XLSX, PPTX, and more
- **Intelligent Text Splitting**: Configurable chunking strategies
- **Vector Embeddings**: pgvector-powered semantic search with hybrid search modes
- **Auto-generated Questions**: AI-generated questions for enhanced retrieval
- **Import/Export Capabilities**: Flexible data exchange formats
- **Web Synchronization**: Automated web content crawling and updates
- **Smart Data Analytics**: Document intelligence and content insights

### 🔧 Workflow Engine
- **Visual Workflow Designer**: Drag-and-drop workflow creation
- **Multiple Node Types**: AI Chat, Knowledge Retrieval, Conditions, Functions, MCP Tools
- **Complex Business Logic**: Support for conditional flows and decision trees
- **Template Library**: Pre-built workflow templates for common scenarios
- **Real-time Execution**: Live workflow monitoring and debugging
- **Error Handling**: Robust retry mechanisms and error recovery
- **Performance Analytics**: Detailed execution metrics and optimization insights

### 🔌 MCP (Model Context Protocol) Integration
- **External Tool Connectivity**: Seamless integration with external services
- **Multi-transport Support**: SSE, HTTP, and WebSocket connectivity
- **Database Integration**: Direct database querying and manipulation
- **Chart Generation**: Dynamic chart and visualization creation
- **Custom Function Support**: User-defined functions and tools
- **Security Controls**: Authentication and permission management
- **Health Monitoring**: Automatic service health checks and failover

### 🔍 Powerful Search & Retrieval
- **Semantic Search**: Vector similarity-based content discovery
- **Keyword Search**: Traditional full-text search capabilities
- **Hybrid Search**: Combined semantic and keyword search with weighted results
- **Relevance Scoring**: Advanced similarity scoring and ranking
- **Search Analytics**: Detailed usage and performance metrics
- **Hit Tracking**: Popular content identification
- **Multi-dataset Search**: Cross-dataset query capabilities
- **Smart Filtering**: Advanced filtering and faceted search

### 🚀 Enterprise-Ready Architecture
- **Async FastAPI Backend**: High-performance, scalable API
- **Modern React Frontend**: Component-based UI with TypeScript
- **PostgreSQL + pgvector**: Robust database with vector search
- **Redis Caching**: Performance optimization and session management
- **Docker Containerization**: Easy deployment and scaling
- **Background Task Processing**: Celery-based async operations
- **Comprehensive Logging**: Structured logging and monitoring
- **API Documentation**: Auto-generated OpenAPI specs

### 🔐 Security & Authentication
- **JWT-based Authentication**: Secure token-based auth
- **Role-based Access Control**: User, Admin, and custom roles
- **API Key Management**: External integration security
- **Rate Limiting**: DDoS protection and resource management
- **CORS Configuration**: Cross-origin request handling
- **Input Validation**: Comprehensive data validation
- **Audit Logging**: Complete activity tracking

## 🏗️ Enhanced Architecture

### Backend (FastAPI)
```
backend/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── core/                   # Core configuration
│   │   ├── config.py          # Enhanced settings
│   │   ├── database.py        # Database with pgvector
│   │   └── logging.py         # Structured logging
│   ├── models/                 # SQLAlchemy models
│   │   ├── user.py            # User and authentication
│   │   ├── dataset.py         # Knowledge base structure
│   │   ├── document.py        # Document and paragraph models
│   │   ├── application.py     # Enhanced AI application models
│   │   ├── chat.py            # Multi-modal chat models
│   │   ├── workflow.py        # NEW: Workflow engine models
│   │   └── mcp.py             # NEW: MCP integration models
│   ├── schemas/                # Pydantic schemas
│   │   ├── auth.py            # Authentication schemas
│   │   ├── dataset.py         # Dataset management schemas
│   │   ├── chat.py            # Chat interaction schemas
│   │   ├── workflow.py        # NEW: Workflow schemas
│   │   └── mcp.py             # NEW: MCP schemas
│   ├── api/                    # API routes
│   │   └── v1/
│   │       ├── endpoints/     # Route implementations
│   │       └── api.py         # Main router
│   └── services/               # Business logic
│       ├── auth.py            # Authentication service
│       ├── dataset.py         # Dataset management
│       ├── chat.py            # Enhanced chat processing
│       ├── rag.py             # Advanced RAG implementation
│       ├── embedding.py       # Vector operations
│       ├── workflow_engine.py # NEW: Workflow orchestration
│       ├── mcp_client.py      # NEW: MCP service integration
│       └── user.py            # User management
```

### New Capabilities Added

#### 1. Workflow Engine
- **Node-based Execution**: Visual workflow creation with multiple node types
- **Conditional Logic**: Smart decision making and branching
- **Integration Points**: Seamless connection with AI models and external tools
- **Template System**: Reusable workflow templates for common scenarios
- **Real-time Monitoring**: Live execution tracking and performance metrics

#### 2. MCP (Model Context Protocol) Support
- **External Tool Integration**: Connect to databases, APIs, and external services
- **Multi-transport Support**: SSE, HTTP, and WebSocket connectivity
- **Security Framework**: Authentication and authorization for external services
- **Health Monitoring**: Automatic service health checks and status tracking
- **Usage Analytics**: Detailed tool usage and performance metrics

#### 3. Enhanced Multi-modal Support
- **Voice Processing**: Speech-to-text and text-to-speech capabilities
- **File Handling**: Advanced document processing and analysis
- **Image Analysis**: Image understanding and description capabilities
- **Rich Media Support**: Video and audio content processing

#### 4. Advanced Search Capabilities
- **Hybrid Search**: Combines semantic and keyword search for optimal results
- **Smart Filtering**: Advanced filtering and faceted search options
- **Performance Optimization**: Caching and indexing for fast retrieval
- **Analytics Dashboard**: Comprehensive search analytics and insights

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- PostgreSQL 15+ with pgvector extension
- Node.js 18+ (for development)
- Python 3.11+ (for development)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/km-ai-platform.git
cd km-ai-platform
```

### 2. Environment Setup
```bash
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env
```

Configure your environment variables (database credentials are already set for your PostgreSQL setup):
```env
# Database (Updated for your setup)
DATABASE_URL=postgresql+asyncpg://postgres:12345678@localhost:5432/kmdb

# AI Models
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
QWEN_API_KEY=your_qwen_api_key

# Advanced Features
MCP_ENABLED=true
WORKFLOW_ENGINE_ENABLED=true
MULTIMODAL_ENABLED=true
STREAMING_ENABLED=true
```

### 3. Launch with Docker
```bash
docker-compose up -d
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📖 Core Concepts

### Enhanced Knowledge Management
The platform now supports:

1. **Advanced RAG Pipeline**: Multi-stage retrieval with hybrid search
2. **Workflow Integration**: Knowledge retrieval as part of complex workflows
3. **MCP Tool Access**: External data sources and tools integration
4. **Real-time Analytics**: Live insights into knowledge usage and performance

### Workflow Orchestration
Create complex AI workflows with:

1. **Visual Designer**: Drag-and-drop workflow creation
2. **Multiple Node Types**: AI, retrieval, logic, and integration nodes
3. **Conditional Logic**: Smart branching and decision making
4. **Template Library**: Pre-built workflows for common scenarios

### MCP Integration
Connect to external services:

1. **Database Queries**: Direct database access and manipulation
2. **API Integrations**: REST API calls and data processing
3. **Chart Generation**: Dynamic visualization creation
4. **Custom Tools**: User-defined functions and integrations

## 🔧 Configuration

### Database Setup
Your PostgreSQL database is already configured:
```env
DATABASE_URL=postgresql+asyncpg://postgres:12345678@localhost:5432/kmdb
```

### AI Provider Configuration
```env
# Multiple AI providers supported
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=sk-...
QWEN_API_KEY=qwen-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Advanced Features
```env
# Enable advanced capabilities
MCP_ENABLED=true
WORKFLOW_ENGINE_ENABLED=true
MULTIMODAL_ENABLED=true
STREAMING_ENABLED=true
WEB_SCRAPING_ENABLED=true
ANALYTICS_ENABLED=true
```

## 🔌 Enhanced API Reference

### New Workflow Endpoints
```http
GET    /api/v1/workflows/                    # List workflows
POST   /api/v1/workflows/                    # Create workflow
GET    /api/v1/workflows/{id}                # Get workflow
PUT    /api/v1/workflows/{id}                # Update workflow
POST   /api/v1/workflows/{id}/execute        # Execute workflow
GET    /api/v1/workflows/{id}/executions     # Get executions
```

### New MCP Endpoints
```http
GET    /api/v1/mcp/servers/                  # List MCP servers
POST   /api/v1/mcp/servers/                  # Register server
POST   /api/v1/mcp/servers/{id}/test         # Test connection
POST   /api/v1/mcp/tools/call                # Call MCP tool
GET    /api/v1/mcp/tools/history             # Tool call history
```

### Enhanced Chat Endpoints
```http
POST   /api/v1/chat/{id}/stream              # Streaming chat
POST   /api/v1/chat/{id}/voice               # Voice message
POST   /api/v1/chat/{id}/files               # File upload
POST   /api/v1/chat/{id}/workflow            # Workflow execution
```

## 🔬 Advanced Use Cases

### 1. Intelligent Question Answering with Charts
```python
# Example workflow: Query database + Generate chart
workflow = {
    "nodes": [
        {"type": "mcp_tool", "tool": "database_query"},
        {"type": "mcp_tool", "tool": "chart_generator"},
        {"type": "ai_chat", "model": "gpt-4"}
    ]
}
```

### 2. Multi-step Research Assistant
```python
# Example: Web search + Knowledge retrieval + Analysis
workflow = {
    "nodes": [
        {"type": "web_scraper", "query": "{{user_query}}"},
        {"type": "knowledge_retrieval", "datasets": ["research_db"]},
        {"type": "ai_chat", "prompt": "Analyze and synthesize..."}
    ]
}
```

### 3. Document Processing Pipeline
```python
# Example: File upload + Processing + Knowledge update
workflow = {
    "nodes": [
        {"type": "file_processor", "formats": ["pdf", "docx"]},
        {"type": "knowledge_updater", "dataset": "documents"},
        {"type": "ai_chat", "prompt": "Summarize new content..."}
    ]
}
```

## 🚢 Deployment

### Production Configuration
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# With Celery workers for background processing
docker-compose up -d celery-worker
```

### Scaling Considerations
- **Database**: PostgreSQL with pgvector for vector operations
- **Workflow Engine**: Distributed execution with Celery
- **MCP Services**: Load balancing for external service calls
- **Caching**: Redis for session and performance optimization

## 🔒 Security Features

### Enhanced Security
- **Multi-factor Authentication**: Optional 2FA support
- **API Rate Limiting**: Comprehensive rate limiting
- **Input Sanitization**: Advanced input validation
- **Audit Logging**: Complete activity tracking
- **Secure MCP Integration**: Encrypted communication with external services

## 📊 Analytics & Monitoring

### Built-in Analytics
- **Workflow Performance**: Execution time and success rates
- **MCP Tool Usage**: External service call analytics
- **Search Analytics**: Query patterns and result quality
- **User Engagement**: Detailed usage metrics
- **System Health**: Real-time monitoring and alerting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on the enhanced architecture and new features.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI**: For the excellent async Python framework
- **React Community**: For the robust frontend ecosystem
- **pgvector**: For PostgreSQL vector search capabilities
- **LangChain**: For AI/LLM integration framework
- **MCP Protocol**: For external tool integration standards

## 📞 Support

- 📧 Email: [Contact for support]
- 💬 Discord: [Join our community]
- 📚 Documentation: [Full documentation]
- 🐛 Issues: [GitHub Issues]

---

**Built with ❤️ for the future of AI-powered knowledge management**

## 🆕 What's New in v2.0.0

### Major Features Added
✅ **Workflow Engine**: Visual workflow creation and execution  
✅ **MCP Integration**: External tool and service connectivity  
✅ **Enhanced Multi-modal Support**: Voice, files, images  
✅ **Advanced Search**: Hybrid semantic + keyword search  
✅ **Real-time Streaming**: Live AI responses  
✅ **Analytics Dashboard**: Comprehensive usage insights  
✅ **Performance Optimization**: Caching and indexing improvements  
✅ **Security Enhancements**: Advanced authentication and authorization  

### Database Updates
✅ **Updated for PostgreSQL**: Full support for your database setup  
✅ **pgvector Integration**: Advanced vector search capabilities  
✅ **Performance Optimizations**: Improved query performance  

### Developer Experience
✅ **Enhanced API Documentation**: Comprehensive OpenAPI specs  
✅ **Docker Optimization**: Improved container performance  
✅ **Development Tools**: Better debugging and monitoring  
✅ **Type Safety**: Full TypeScript support 