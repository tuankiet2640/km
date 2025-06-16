# Enhanced AI Knowledge Platform Startup Script (Windows PowerShell)
# This script sets up and starts the complete platform with all services

Write-Host "🚀 Starting KM AI Platform..." -ForegroundColor Blue

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Status "Docker is running"
} catch {
    Write-Error "Docker is not running. Please start Docker and try again."
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose --version | Out-Null
    Write-Status "Docker Compose is available"
} catch {
    Write-Error "docker-compose is not installed. Please install it and try again."
    exit 1
}

Write-Status "Checking environment files..."

# Create .env file from example if it doesn't exist
if (!(Test-Path "backend/.env")) {
    Write-Warning "Backend .env file not found. Creating from example..."
    Copy-Item "backend/env.example" "backend/.env"
    Write-Success "Created backend/.env file"
    Write-Warning "Please update the API keys in backend/.env before proceeding"
}

# Create directories if they don't exist
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-Status "Created logs directory"
}

if (!(Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" | Out-Null
    Write-Status "Created uploads directory"
}

Write-Status "Starting services with Docker Compose..."

# Build and start all services
docker-compose down --remove-orphans 2>$null
docker-compose up -d --build

Write-Status "Waiting for services to be ready..."

# Wait for PostgreSQL to be ready
Write-Status "Waiting for PostgreSQL to be ready..."
do {
    Start-Sleep -Seconds 2
    $result = docker-compose exec -T postgres pg_isready -U postgres -d kmdb 2>$null
} while ($LASTEXITCODE -ne 0)
Write-Success "PostgreSQL is ready"

# Wait for Redis to be ready
Write-Status "Waiting for Redis to be ready..."
do {
    Start-Sleep -Seconds 2
    $result = docker-compose exec -T redis redis-cli ping 2>$null
} while ($LASTEXITCODE -ne 0)
Write-Success "Redis is ready"

# Wait for backend to be ready
Write-Status "Waiting for backend API to be ready..."
$timeout = 30
for ($i = 1; $i -le $timeout; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 -UseBasicParsing 2>$null
        if ($response.StatusCode -eq 200) {
            break
        }
    } catch {
        # Continue waiting
    }
    Start-Sleep -Seconds 2
}
Write-Success "Backend API is ready"

# Display service status
Write-Host ""
Write-Success "🎉 KM AI Platform is now running!"
Write-Host ""
Write-Host "📋 Service URLs:" -ForegroundColor Cyan
Write-Host "   🌐 Frontend:        http://localhost:3000"
Write-Host "   🔧 Backend API:     http://localhost:8000"
Write-Host "   📚 API Docs:        http://localhost:8000/docs"
Write-Host "   📊 Flower (Celery): http://localhost:5555"
Write-Host ""
Write-Host "🗄️  Database Information:" -ForegroundColor Cyan
Write-Host "   📍 Host:     localhost:5432"
Write-Host "   🗃️  Database: kmdb"
Write-Host "   👤 User:     postgres"
Write-Host "   🔑 Password: 12345678"
Write-Host ""
Write-Host "🔍 To check service status:" -ForegroundColor Yellow
Write-Host "   docker-compose ps"
Write-Host ""
Write-Host "📋 To view logs:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f [service_name]"
Write-Host ""
Write-Host "🛑 To stop all services:" -ForegroundColor Yellow
Write-Host "   docker-compose down"
Write-Host ""

# Show running containers
Write-Status "Running containers:"
docker-compose ps 