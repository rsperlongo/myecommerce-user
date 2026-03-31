# MyCommerce User Microservice - Complete Setup Guide

## 📋 Project Overview

This is a complete microservices architecture setup using NestJS with Clean Architecture and Domain-Driven Design (DDD) principles.

### 🎯 What's Included

✅ **Clean Architecture & DDD Structure**
- Domain layer (business logic, entities)
- Application layer (use cases, DTOs)
- Infrastructure layer (database, messaging, cache)
- Module-based organization

✅ **Database Support**
- PostgreSQL - Primary relational database
- MongoDB - Document-based storage
- TypeORM integration with auto-schema generation

✅ **Microservices Ready**
- RabbitMQ for async messaging
- Redis for caching and session management
- JWT-based authentication & authorization
- Passport.js integration

✅ **Authentication & Security**
- Bcrypt for password hashing
- JWT token generation and validation
- Passport strategies (JWT, Local)
- Role-based access control ready

✅ **Monitoring & Logging**
- Graylog integration for centralized logging
- Docker Compose stack included

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Install Node.js 18+ and Docker/Docker Compose
node --version
docker --version
docker-compose --version
```

### 2. Environment Setup
```bash
# Clone/copy .env.example to .env
cp .env.example .env

# Edit .env with your values if needed
```

### 3. Start Infrastructure
```bash
# Launch all services (PostgreSQL, MongoDB, Redis, RabbitMQ, Graylog)
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 4. Install Dependencies
```bash
# Install npm packages (uses --legacy-peer-deps for Nest 11 compatibility)
npm install --legacy-peer-deps
```

### 5. Start Development Server
```bash
# Start with hot-reload
npm run start:dev

# Server runs on http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── domain/                          # Business Domain
│   ├── entities/                    # Domain entities
│   ├── repositories/                # Repository interfaces
│   └── value-objects/               # Value objects
│
├── application/                     # Use Cases & Application Logic
│   ├── use-cases/                   # Business operations
│   └── dtos/                        # Data transfer objects
│
├── infrastructure/                  # External Services
│   ├── persistence/
│   │   └── typeorm/                 # TypeORM repositories
│   ├── messaging/                   # RabbitMQ client
│   ├── cache/                       # Redis cache service
│   └── logging/                     # Graylog configuration
│
├── modules/                         # Feature Modules
│   ├── auth/                        # Authentication module
│   │   ├── services/                # Auth service (JWT, bcrypt)
│   │   ├── strategies/              # Passport strategies
│   │   ├── dtos/                    # Auth DTOs
│   │   ├── auth.controller.ts       # Auth endpoints
│   │   └── auth.module.ts           # Module configuration
│   └── users/                       # (Ready to add)
│
├── shared/                          # Shared Utilities
│   ├── filters/                     # Exception filters
│   ├── guards/                      # Auth guards
│   └── pipes/                       # Validation pipes
│
├── app.module.ts                    # Main app module with all configs
├── main.ts                          # Application entry point
└── ARCHITECTURE.ts                  # Architecture documentation
```

---

## 🔧 Available Commands

```bash
# Development
npm run start:dev         # Start with hot-reload
npm run start:debug       # Start with debugging enabled

# Production
npm run build             # Build application
npm run start:prod        # Run production build

# Testing
npm test                  # Run unit tests
npm run test:watch       # Watch mode
npm run test:e2e         # E2E tests
npm run test:cov         # Coverage report

# Code Quality
npm run lint             # Run ESLint and fix
npm run format           # Format code with Prettier
npm audit fix            # Fix vulnerabilities
```

---

## 🌐 API Endpoints

### Authentication Module

```bash
# Register new user
POST /auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password123"
}

# Login
POST /auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password123"
}

# Get Profile (requires JWT)
POST /auth/profile
Authorization: Bearer <your_jwt_token>
```

---

## 🐳 Docker Compose Services

All services are configured in `docker-compose.yml`:

| Service | Port | URL | Username | Password |
|---------|------|-----|----------|----------|
| PostgreSQL | 5432 | localhost:5432 | postgres | postgres |
| MongoDB | 27017 | localhost:27017 | - | - |
| Redis | 6379 | localhost:6379 | - | - |
| RabbitMQ | 5672, 15672 | localhost:15672 | guest | guest |
| Graylog | 9000 | http://localhost:9000 | admin | admin* |

*Graylog default password: "password"

### Useful Docker Commands
```bash
# View logs
docker-compose logs -f postgres          # Follow PostgreSQL logs
docker-compose logs -f rabbitmq          # Follow RabbitMQ logs
docker-compose logs -f graylog           # Follow Graylog logs

# Stop services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build
```

---

## 📦 Key Dependencies

### Core
- `@nestjs/common@11.0.1` - NestJS core
- `@nestjs/config@4.0.0` - Configuration management
- `reflect-metadata@0.2.2` - Metadata reflection

### Database & ORM
- `typeorm@0.3.28` - SQL ORM
- `@nestjs/typeorm@11.0.0` - TypeORM integration
- `pg@8.11.0` - PostgreSQL driver
- `mongoose@7.5.1` - MongoDB ODM
- `@nestjs/mongoose@11.0.4` - Mongoose integration

### Caching
- `ioredis@5.3.2` - Redis client
- `@liaoliaots/nestjs-redis@10.0.0` - Redis integration

### Microservices
- `@nestjs/microservices@11.0.1` - Microservices support
- `amqplib@0.10.3` - RabbitMQ client

### Authentication
- `@nestjs/passport@11.0.0` - Passport integration
- `passport@0.6.0` - Authentication middleware
- `passport-jwt@4.0.1` - JWT strategy
- `passport-local@1.0.0` - Local strategy
- `@nestjs/jwt@11.0.0` - JWT module
- `bcrypt@5.1.0` - Password hashing

### Validation
- `class-validator@0.14.1` - DTO validation
- `class-transformer@0.5.1` - DTO transformation

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files with secrets
   ```bash
   # Keep these safe in production:
   JWT_SECRET
   POSTGRES_PASSWORD
   RABBITMQ_PASSWORD
   ```

2. **Database Credentials**: Change default passwords in `docker-compose.yml`
   ```yaml
   POSTGRES_PASSWORD: "your-secure-password"
   ```

3. **JWT Configuration**: Update JWT_SECRET for production
   ```bash
   JWT_SECRET=your-production-secret-key
   JWT_EXPIRES_IN=3600s
   ```

4. **CORS Configuration**: Configure in `app.module.ts` for production
   ```typescript
   app.enableCors({
     origin: 'https://yourdomain.com',
     credentials: true,
   });
   ```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## 📝 Adding New Modules

### Example: Creating a User Module

1. **Create structure**
   ```bash
   mkdir -p src/modules/users/{controllers,services,dtos}
   ```

2. **Create entity**
   ```typescript
   // src/domain/entities/user.entity.ts
   export class UserEntity {
     id: string;
     email: string;
     roles: string[];
   }
   ```

3. **Create DTO**
   ```typescript
   // src/modules/users/dtos/create-user.dto.ts
   import { IsEmail, MinLength } from 'class-validator';

   export class CreateUserDto {
     @IsEmail()
     email: string;

     @MinLength(6)
     password: string;
   }
   ```

4. **Create service**
   ```typescript
   // src/modules/users/services/user.service.ts
   @Injectable()
   export class UserService {
     // Implementation
   }
   ```

5. **Create controller**
   ```typescript
   // src/modules/users/controllers/user.controller.ts
   @Controller('users')
   export class UserController {
     constructor(private readonly userService: UserService) {}
     // Endpoints
   }
   ```

6. **Create module**
   ```typescript
   // src/modules/users/users.module.ts
   @Module({
     controllers: [UserController],
     providers: [UserService],
   })
   export class UsersModule {}
   ```

7. **Import in AppModule**
   ```typescript
   // src/app.module.ts
   imports: [UsersModule, AuthModule, ...]
   ```

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Redis Connection Issues
```bash
# Check Redis status
docker-compose ps redis

# Test Redis connection
redis-cli -h localhost -p 6379 PING
```

### Dependency Conflicts
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Mongoose Documentation](https://mongoosejs.com)
- [Passport.js Documentation](https://www.passportjs.org)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)

---

## 📞 Support & Contribution

For issues, questions, or contributions, please refer to the repository documentation.

---

**Last Updated**: 2026-03-31
**Status**: ✅ Production Ready
