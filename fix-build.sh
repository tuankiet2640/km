#!/bin/bash

# Fix Build Issues Script for KM AI Platform
# This script cleans up Docker and fixes common build issues

set -e

echo "🔧 Fixing Docker build issues for KM AI Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Stopping and removing existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

print_status "Removing old images..."
docker-compose rm -f 2>/dev/null || true

print_status "Cleaning up Docker build cache..."
docker builder prune -f

print_status "Removing dangling images..."
docker image prune -f

print_status "Creating necessary directories..."
mkdir -p logs uploads

print_status "Updating pip in backend container temporarily..."
# Create a temporary Dockerfile with updated pip
cat > backend/Dockerfile.temp << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Update pip first
RUN pip install --upgrade pip

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
EOF

# Backup original Dockerfile
if [ -f backend/Dockerfile ]; then
    mv backend/Dockerfile backend/Dockerfile.backup
fi

# Use the temporary Dockerfile
mv backend/Dockerfile.temp backend/Dockerfile

print_status "Building backend with updated Dockerfile..."
docker-compose build --no-cache backend

print_success "Build completed successfully!"

print_status "Starting services..."
docker-compose up -d

print_status "Waiting for services to be ready..."

# Wait for services
sleep 10

print_success "🎉 Build fix completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check if all services are running: docker-compose ps"
echo "2. View logs if needed: docker-compose logs -f"
echo "3. Access the platform at http://localhost:3000"
echo ""
echo "If you still encounter issues, check:"
echo "- Your internet connection for downloading packages"
echo "- Available disk space for Docker"
echo "- Docker daemon is running properly" 