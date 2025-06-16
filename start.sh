#!/bin/bash

# Enhanced AI Knowledge Platform Startup Script
# This script sets up and starts the complete platform with all services

set -e

echo "🚀 Starting KM AI Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

print_status "Checking environment files..."

# Create .env file from example if it doesn't exist
if [ ! -f backend/.env ]; then
    print_warning "Backend .env file not found. Creating from example..."
    cp backend/env.example backend/.env
    print_success "Created backend/.env file"
    print_warning "Please update the API keys in backend/.env before proceeding"
fi

# Create logs directory if it doesn't exist
if [ ! -d logs ]; then
    mkdir -p logs
    print_status "Created logs directory"
fi

# Create uploads directory if it doesn't exist
if [ ! -d uploads ]; then
    mkdir -p uploads
    print_status "Created uploads directory"
fi

print_status "Starting services with Docker Compose..."

# Build and start all services
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose up -d --build

print_status "Waiting for services to be ready..."

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U postgres -d kmdb; do
    sleep 2
done
print_success "PostgreSQL is ready"

# Wait for Redis to be ready
print_status "Waiting for Redis to be ready..."
until docker-compose exec -T redis redis-cli ping; do
    sleep 2
done
print_success "Redis is ready"

# Wait for backend to be ready
print_status "Waiting for backend API to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        break
    fi
    sleep 2
done
print_success "Backend API is ready"

# Display service status
echo ""
print_success "🎉 KM AI Platform is now running!"
echo ""
echo "📋 Service URLs:"
echo "   🌐 Frontend:        http://localhost:3000"
echo "   🔧 Backend API:     http://localhost:8000"
echo "   📚 API Docs:        http://localhost:8000/docs"
echo "   📊 Flower (Celery): http://localhost:5555"
echo ""
echo "🗄️  Database Information:"
echo "   📍 Host:     localhost:5432"
echo "   🗃️  Database: kmdb"
echo "   👤 User:     postgres"
echo "   🔑 Password: 12345678"
echo ""
echo "🔍 To check service status:"
echo "   docker-compose ps"
echo ""
echo "📋 To view logs:"
echo "   docker-compose logs -f [service_name]"
echo ""
echo "🛑 To stop all services:"
echo "   docker-compose down"
echo ""

# Show running containers
print_status "Running containers:"
docker-compose ps 