#!/bin/bash

# =============================================================================
# MDAyuda - Help Desk System - Development Environment Setup
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "=============================================="
echo "  MDAyuda - Help Desk System Setup"
echo "=============================================="
echo -e "${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# =============================================================================
# Check Prerequisites
# =============================================================================

echo -e "\n${BLUE}Checking prerequisites...${NC}\n"

# Check .NET SDK
if command_exists dotnet; then
    DOTNET_VERSION=$(dotnet --version)
    print_status ".NET SDK found: $DOTNET_VERSION"
else
    print_error ".NET SDK 8.0+ is required but not installed"
    echo "  Install from: https://dotnet.microsoft.com/download/dotnet/8.0"
    exit 1
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
else
    print_error "Node.js 18+ is required but not installed"
    echo "  Install from: https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "npm found: $NPM_VERSION"
else
    print_error "npm is required but not installed"
    exit 1
fi

# Check SQL Server (optional - can use LocalDB on Windows)
if command_exists sqlcmd; then
    print_status "SQL Server tools found"
else
    print_warning "SQL Server command line tools not found"
    echo "  For local development, SQL Server LocalDB or a Docker container is recommended"
fi

# =============================================================================
# Install Dependencies
# =============================================================================

echo -e "\n${BLUE}Installing dependencies...${NC}\n"

# Backend dependencies
if [ -d "backend" ]; then
    echo "Installing backend dependencies..."
    cd backend
    dotnet restore
    print_status "Backend dependencies installed"
    cd ..
else
    print_warning "Backend directory not found - will be created during project setup"
fi

# Frontend dependencies
if [ -d "frontend" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    print_status "Frontend dependencies installed"
    cd ..
else
    print_warning "Frontend directory not found - will be created during project setup"
fi

# =============================================================================
# Database Setup
# =============================================================================

echo -e "\n${BLUE}Database setup...${NC}\n"

if [ -d "backend" ]; then
    cd backend

    # Check if database migrations exist
    if [ -d "Migrations" ]; then
        echo "Applying database migrations..."
        dotnet ef database update --project MDAyuda.API.csproj 2>/dev/null || {
            print_warning "Could not apply migrations. Make sure SQL Server is running."
            echo "  You may need to update the connection string in appsettings.json"
        }
    else
        print_warning "No migrations found - run 'dotnet ef migrations add InitialCreate' after models are created"
    fi

    cd ..
else
    print_warning "Skipping database setup - backend not yet created"
fi

# =============================================================================
# Environment Configuration
# =============================================================================

echo -e "\n${BLUE}Environment configuration...${NC}\n"

# Create .env file for frontend if it doesn't exist
if [ -d "frontend" ] && [ ! -f "frontend/.env.local" ]; then
    cat > frontend/.env.local << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Feature Flags
NEXT_PUBLIC_ENABLE_DARK_MODE=true
EOF
    print_status "Created frontend/.env.local"
fi

# Check backend appsettings
if [ -d "backend" ] && [ ! -f "backend/appsettings.Development.json" ]; then
    print_warning "backend/appsettings.Development.json not found"
    echo "  Copy appsettings.json to appsettings.Development.json and update connection string"
fi

# =============================================================================
# Start Development Servers
# =============================================================================

echo -e "\n${BLUE}Starting development servers...${NC}\n"

start_servers() {
    if [ -d "backend" ] && [ -d "frontend" ]; then
        echo "Starting backend server on port 5000..."
        cd backend
        dotnet run --urls "http://localhost:5000" &
        BACKEND_PID=$!
        cd ..

        echo "Starting frontend server on port 3000..."
        cd frontend
        npm run dev &
        FRONTEND_PID=$!
        cd ..

        print_status "Servers started"
        echo ""
        echo -e "${GREEN}=============================================="
        echo "  MDAyuda is running!"
        echo "=============================================="
        echo -e "${NC}"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend API: http://localhost:5000/api"
        echo "  Swagger docs: http://localhost:5000/swagger"
        echo ""
        echo "  Press Ctrl+C to stop all servers"
        echo ""

        # Wait for Ctrl+C
        trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
        wait
    else
        print_warning "Cannot start servers - project directories not yet created"
        echo ""
        echo "After creating the project structure, you can:"
        echo "  1. Start the backend: cd backend && dotnet run"
        echo "  2. Start the frontend: cd frontend && npm run dev"
        echo ""
        echo "The application will be available at:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend API: http://localhost:5000/api"
    fi
}

# Ask if user wants to start servers
if [ "$1" == "--no-start" ]; then
    echo "Skipping server startup (--no-start flag provided)"
    echo ""
    echo "To start the servers later:"
    echo "  Backend: cd backend && dotnet run"
    echo "  Frontend: cd frontend && npm run dev"
else
    start_servers
fi

echo -e "\n${GREEN}Setup complete!${NC}\n"
