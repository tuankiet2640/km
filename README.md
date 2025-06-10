# KM - Knowledge Management Platform

A comprehensive, modern platform built with FastAPI and React.js, featuring advanced AI-powered knowledge management, retrieval-augmented generation (RAG), and multi-modal chat capabilities.

## 🎯 Overview

KM is a complete AI platform, delivering enterprise-grade knowledge management with cutting-edge AI integration. Built from the ground up with modern technologies, it provides a scalable, maintainable, and feature-rich solution for organizations seeking to harness the power of their knowledge assets.

## ✨ Key Features

### 🧠 Advanced AI Chat System
- **Real-time Streaming Responses**: Live AI responses with token-by-token streaming
- **Multi-modal Input Support**: Text, voice, files, and images
- **OpenAI-Compatible API**: Seamless integration with existing tools
- **Mobile & Touch Optimized**: Native mobile experience with touch controls
- **Context-Aware Conversations**: Maintains conversation history and context
- **Voice Recognition & Synthesis**: Speech-to-text and text-to-speech capabilities
- **File Processing**: Direct file upload and processing in chat
- **Quality Feedback System**: User ratings and feedback collection

### 📚 Comprehensive Knowledge Base System
- **Hierarchical Organization**: Dataset → Document → Paragraph → Problem structure
- **Multiple Dataset Types**: Base, Web-scraped, and External integrations
- **Advanced Document Processing**: PDF, DOCX, TXT, CSV, and more
- **Intelligent Text Splitting**: Configurable chunking strategies
- **Vector Embeddings**: pgvector-powered semantic search
- **Auto-generated Questions**: AI-generated questions for enhanced retrieval
- **Import/Export Capabilities**: Flexible data exchange formats
- **Web Synchronization**: Automated web content crawling and updates

### 🔍 Powerful Search & Retrieval
- **Semantic Search**: Vector similarity-based content discovery
- **Keyword Search**: Traditional full-text search capabilities
- **Hybrid Search**: Combined semantic and keyword search with weighted results
- **Relevance Scoring**: Advanced similarity scoring and ranking
- **Search Analytics**: Detailed usage and performance metrics
- **Hit Tracking**: Popular content identification
- **Multi-dataset Search**: Cross-dataset query capabilities

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

## 🏗️ Architecture

### Backend (FastAPI)
```
backend/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── core/                   # Core configuration
│   │   ├── config.py          # Settings and environment
│   │   ├── database.py        # Database connection
│   │   └── logging.py         # Logging configuration
│   ├── models/                 # SQLAlchemy models
│   │   ├── user.py            # User and authentication
│   │   ├── dataset.py         # Knowledge base structure
│   │   ├── document.py        # Document and paragraph models
│   │   ├── application.py     # AI application models
│   │   └── chat.py            # Chat and message models
│   ├── schemas/                # Pydantic schemas
│   │   ├── auth.py            # Authentication schemas
│   │   ├── dataset.py         # Dataset management schemas
│   │   ├── chat.py            # Chat interaction schemas
│   │   └── user.py            # User management schemas
│   ├── api/                    # API routes
│   │   └── v1/
│   │       ├── endpoints/     # Route implementations
│   │       └── api.py         # Main router
│   └── services/               # Business logic
│       ├── auth.py            # Authentication service
│       ├── dataset.py         # Dataset management
│       ├── chat.py            # Chat processing
│       ├── rag.py             # RAG implementation
│       ├── embedding.py       # Vector operations
│       └── user.py            # User management
```

### Frontend (React.js)
```
frontend/
├── src/
│   ├── components/            # Reusable components
│   │   ├── Layout/           # Main layout components
│   │   ├── Chat/             # Chat interface
│   │   ├── Dataset/          # Dataset management
│   │   └── Common/           # Shared components
│   ├── pages/                # Page components
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   ├── Login.tsx         # Authentication
│   │   ├── Datasets.tsx      # Dataset management
│   │   ├── Applications.tsx  # Application management
│   │   └── Chat.tsx          # Chat interface
│   ├── services/             # API integration
│   │   ├── api.ts            # Base API client
│   │   ├── auth.ts           # Authentication API
│   │   ├── datasets.ts       # Dataset API
│   │   └── chat.ts           # Chat API
│   ├── store/                # State management
│   │   └── auth.ts           # Authentication store
│   └── types/                # TypeScript definitions
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Python 3.11+ (for development)
- PostgreSQL 15+ with pgvector extension

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/km-platform.git
cd km-platform/fastAPI-reactJS-refactor
```

### 2. Environment Setup
```bash
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env
```

Configure your environment variables:
```env
# Database
DATABASE_URL=postgresql+asyncpg://km_user:km_password@localhost:5432/km_db

# AI Models
OPENAI_API_KEY=your_openai_api_key
DEFAULT_LLM_MODEL=gpt-3.5-turbo
DEFAULT_EMBEDDING_MODEL=text-embedding-ada-002

# Security
SECRET_KEY=your_secret_key_here
```

### 3. Launch with Docker
```bash
docker-compose up -d
```

Or use the convenience script:
```bash
./start.sh
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📖 Core Concepts

### Knowledge Base Hierarchy
KM organizes knowledge in a four-tier hierarchy:

1. **Dataset**: Top-level knowledge container (e.g., "Company Policies")
2. **Document**: Individual files within a dataset (e.g., "Employee Handbook.pdf")
3. **Paragraph**: Text chunks optimized for retrieval (e.g., "Vacation policy section")
4. **Problem**: Auto-generated questions for enhanced search (e.g., "How many vacation days?")

### RAG Pipeline
The Retrieval-Augmented Generation pipeline:

1. **Query Processing**: User query is converted to embeddings
2. **Similarity Search**: Vector search finds relevant paragraphs
3. **Context Assembly**: Top results are combined with conversation history
4. **AI Generation**: LLM generates response using retrieved context
5. **Source Attribution**: Results include source references and similarity scores

### Multi-modal Chat
Support for various input types:

- **Text**: Standard text messages
- **Voice**: Speech-to-text with audio processing
- **Files**: Document upload with text extraction
- **Images**: Image analysis and description (planned)
- **Workflow**: Custom workflow execution (planned)

## 🔧 Configuration

### AI Models
Configure different AI providers:

```python
# OpenAI
OPENAI_API_KEY=sk-...
DEFAULT_LLM_MODEL=gpt-4
DEFAULT_EMBEDDING_MODEL=text-embedding-ada-002

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_LLM_MODEL=claude-3-sonnet-20240229

# Local Models
LOCAL_MODEL_PATH=/path/to/models
LOCAL_MODEL_DEVICE=cuda
```

### Vector Search
Customize search behavior:

```python
VECTOR_DIMENSION=1536          # Embedding dimension
DEFAULT_SIMILARITY_THRESHOLD=0.7    # Minimum similarity score
DEFAULT_RETRIEVAL_LIMIT=10     # Max results per search
DEFAULT_SEARCH_MODE=semantic   # semantic, keyword, hybrid
```

### Document Processing
Configure text processing:

```python
PDF_PARSER=pymupdf            # PDF processing library
TEXT_SPLITTER=recursive       # Text splitting strategy
MAX_FILE_SIZE_MB=100          # Maximum upload size
ALLOWED_EXTENSIONS=pdf,docx,txt,md,csv
```

## 🔌 API Reference

### Authentication
```http
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

### Datasets
```http
GET    /api/v1/datasets/                    # List datasets
POST   /api/v1/datasets/                    # Create dataset
GET    /api/v1/datasets/{id}                # Get dataset
PUT    /api/v1/datasets/{id}                # Update dataset
DELETE /api/v1/datasets/{id}                # Delete dataset
POST   /api/v1/datasets/{id}/vectorize      # Start vectorization
POST   /api/v1/datasets/{id}/import         # Import content
GET    /api/v1/datasets/{id}/export         # Export content
```

### Chat
```http
GET    /api/v1/chat/                        # List chats
POST   /api/v1/chat/                        # Create chat
POST   /api/v1/chat/{id}/messages           # Send message
POST   /api/v1/chat/{id}/stream             # Stream chat
POST   /api/v1/chat/{id}/voice              # Voice message
POST   /api/v1/chat/{id}/files              # File message
```

### OpenAI-Compatible
```http
POST   /api/v1/chat/openai/chat/completions # OpenAI-compatible endpoint
```

## 🎨 Frontend Components

### Chat Interface
Real-time chat with streaming responses:

```typescript
import { ChatInterface } from '@/components/Chat';

<ChatInterface 
  applicationId="app-id"
  enableVoice={true}
  enableFiles={true}
  streamingEnabled={true}
/>
```

### Dataset Management
Comprehensive dataset tools:

```typescript
import { DatasetManager } from '@/components/Dataset';

<DatasetManager 
  showStats={true}
  enableImport={true}
  enableExport={true}
/>
```

## 🔍 Search Examples

### Semantic Search
```python
from app.services.rag import RAGService

rag_service = RAGService(db)
results = await rag_service.retrieve_relevant_context(
    application_id=app_id,
    query="How to reset password",
    limit=5,
    search_mode="semantic"
)
```

### Hybrid Search
```python
results = await rag_service.retrieve_relevant_context(
    application_id=app_id,
    query="vacation policy",
    limit=10,
    search_mode="hybrid",
    similarity_threshold=0.6
)
```

## 📊 Monitoring & Analytics

### Built-in Analytics
- Search query analysis
- Popular content tracking
- User engagement metrics
- Performance monitoring
- Error tracking and alerting

### Health Checks
```http
GET /health              # Application health
GET /health/db           # Database connectivity
GET /health/redis        # Redis connectivity
GET /metrics             # Prometheus metrics
```

## 🚢 Deployment

### Production Docker
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes
```yaml
# Example Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: km-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: km-backend
  template:
    metadata:
      labels:
        app: km-backend
    spec:
      containers:
      - name: backend
        image: km/backend:latest
        ports:
        - containerPort: 8000
```

### Scaling Considerations
- **Database**: Use read replicas for high query loads
- **Vector Search**: Consider dedicated vector databases for large datasets
- **File Storage**: Use object storage (S3, GCS) for production files
- **Caching**: Redis cluster for distributed caching
- **Load Balancing**: Use nginx or cloud load balancers

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Backend development
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend development
cd frontend
npm install
npm run dev
```

### Testing
```bash
# Backend tests
pytest

# Frontend tests
npm test

# E2E tests
npm run test:e2e
```

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI**: For the excellent async Python framework
- **React Community**: For the robust frontend ecosystem
- **pgvector**: For PostgreSQL vector search capabilities

## 📞 Support

- 📧 Email: not yet created
- 💬 Discord: [Join our community](https://discord.gg/)
- 📚 Documentation: [Full docs](https://google.com)
- 🐛 Issues: [GitHub Issues](https://github.com/tuankiet2640/km/issues)

---

**Built with ❤️ by the KM Team** 