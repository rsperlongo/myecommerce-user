# MyCommerce User Microservice

Microservices-based user management service with Clean Architecture and DDD principles.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- npm

### Environment Setup

```bash
# Copy environment file
cp .env.example .env
```

### Start Services

```bash
# Start all services (PostgreSQL, MongoDB, Redis, RabbitMQ, Graylog)
docker-compose up -d

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run start:dev
```

### Available Scripts

- `npm run start:dev` - Start with hot reload
- `npm run build` - Build production
- `npm run start:prod` - Run production build
- `npm test` - Run tests
- `npm run test:e2e` - Run E2E tests

## Architecture

```
Domain (Business Logic)
    ↓
Application (Use Cases)
    ↓
Modules (Controllers)
    ↓
Infrastructure (DB, Messaging, Cache)
```

### Layers

- **Domain**: Pure business logic, entities, and interfaces
- **Application**: Use cases, DTOs, and orchestration
- **Infrastructure**: Database, messaging, cache implementations
- **Modules**: NestJS modules organizing features
- **Shared**: Utilities, filters, pipes, and guards

## Microservices Communication

- **RabbitMQ**: Async messaging between services
- **HTTP**: Sync REST API communication
- **Redis**: Distributed caching

## Database

- **PostgreSQL**: Main relational database
- **MongoDB**: Document storage for flexible schemas

## Monitoring

- **Graylog**: Centralized logging and monitoring

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/profile` - Get user profile (requires JWT)
