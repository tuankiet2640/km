# Fix Build Issues Script for KM AI Platform (Windows PowerShell)
# This script cleans up Docker and fixes common build issues

Write-Host "🔧 Fixing Docker build issues for KM AI Platform..." -ForegroundColor Blue

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

Write-Status "Stopping and removing existing containers..."
docker-compose down --remove-orphans 2>$null

Write-Status "Removing old images..."
docker-compose rm -f 2>$null

Write-Status "Cleaning up Docker build cache..."
docker builder prune -f

Write-Status "Removing dangling images..."
docker image prune -f

Write-Status "Creating necessary directories..."
if (!(Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" }
if (!(Test-Path "uploads")) { New-Item -ItemType Directory -Path "uploads" }

Write-Status "Updating backend Dockerfile..."
# Create a temporary Dockerfile with updated pip
$dockerfileContent = @'
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
'@

# Backup original Dockerfile if it exists
if (Test-Path "backend/Dockerfile") {
    Move-Item "backend/Dockerfile" "backend/Dockerfile.backup" -Force
}

# Write the new Dockerfile
$dockerfileContent | Out-File -FilePath "backend/Dockerfile" -Encoding UTF8

Write-Status "Building backend with updated Dockerfile..."
docker-compose build --no-cache backend

Write-Success "Build completed successfully!"

Write-Status "Starting services..."
docker-compose up -d

Write-Status "Waiting for services to be ready..."
Start-Sleep -Seconds 10

Write-Success "🎉 Build fix completed!"
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check if all services are running: docker-compose ps"
Write-Host "2. View logs if needed: docker-compose logs -f"
Write-Host "3. Access the platform at http://localhost:3000"
Write-Host ""
Write-Host "If you still encounter issues, check:" -ForegroundColor Yellow
Write-Host "- Your internet connection for downloading packages"
Write-Host "- Available disk space for Docker"
Write-Host "- Docker daemon is running properly" 