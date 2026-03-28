#!/bin/bash
# Deployment script for Peer Learning Platform
# Usage: ./deploy.sh [environment]
# Environments: development, staging, production

set -e

ENVIRONMENT=${1:-development}
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment is valid
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    log_error "Invalid environment. Use: development, staging, or production"
    exit 1
fi

log_info "Deploying to $ENVIRONMENT environment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    log_warn ".env file not found. Creating from template..."
    cp .env.example .env
    log_warn "Please update .env with your configuration"
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Docker operations
case $ENVIRONMENT in
    development)
        log_info "Starting development environment..."
        docker-compose -f $DOCKER_COMPOSE_FILE down
        docker-compose -f $DOCKER_COMPOSE_FILE up --build -d
        ;;
    
    staging)
        log_info "Deploying to staging..."
        docker-compose -f $DOCKER_COMPOSE_FILE -f docker-compose.staging.yml down
        docker-compose -f $DOCKER_COMPOSE_FILE -f docker-compose.staging.yml up --build -d
        docker-compose -f $DOCKER_COMPOSE_FILE -f docker-compose.staging.yml exec api npm run migrate
        ;;
    
    production)
        log_info "Deploying to production..."
        
        # Pull latest images
        docker-compose -f $DOCKER_COMPOSE_FILE pull
        
        # Build and start services
        docker-compose -f $DOCKER_COMPOSE_FILE up --build -d
        
        # Run database migrations
        log_info "Running database migrations..."
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T api npm run migrate
        
        # Create database indexes
        log_info "Creating database indexes..."
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T api node scripts/db-indexes.js create
        
        # Cleanup old images
        log_info "Cleaning up old Docker images..."
        docker image prune -f
        ;;
esac

# Health check
log_info "Performing health checks..."
sleep 10

if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    log_info "✅ Application is healthy"
else
    log_error "❌ Health check failed"
    docker-compose logs api
    exit 1
fi

# Show status
log_info "Deployment status:"
docker-compose ps

log_info "🎉 Deployment to $ENVIRONMENT completed successfully!"
