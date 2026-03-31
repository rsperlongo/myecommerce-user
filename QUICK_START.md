# 🎯 Quick Reference Guide - MyCommerce User Microservice

## 🚀 Get Started in 3 Steps

```bash
# Step 1: Start Docker containers
docker-compose up -d

# Step 2: Install dependencies
npm install --legacy-peer-deps

# Step 3: Run development server
npm run start:dev
```

Server running at: **http://localhost:3000**

---

## 🗂️ Project Structure Quick Map

```
src/
├── domain/                  → Business logic & entities
├── application/             → Use cases & DTOs  
├── infrastructure/          → Database & messaging
├── modules/auth/            → Authentication features
├── app.module.ts           → Main app configuration
└── main.ts                 → Entry point
```

---

## 🐳 Docker Services (localhost)

| Service | Port | URL |
|---------|------|-----|
| NestJS App | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | localhost:5432 |
| MongoDB | 27017 | localhost:27017 |
| Redis | 6379 | localhost:6379 |
| RabbitMQ Admin | 15672 | http://localhost:15672 |
| Graylog | 9000 | http://localhost:9000 |

---

## 📡 API Endpoints

### Authentication
```bash
# Register
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123"
}

# Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Protected Profile (requires JWT token)
POST /auth/profile
Authorization: Bearer <token>
```

---

## 🔧 Essential Commands

```bash
# Development
npm run start:dev          # Run with hot-reload
npm run start:debug        # Run with debugger

# Production
npm run build              # Build application
npm run start:prod         # Run built application

# Testing
npm test                   # Run tests
npm run test:e2e          # E2E tests

# Code Quality
npm run lint              # Lint & fix code
npm run format            # Format with Prettier
```

---

## 🐳 Docker Commands

```bash
# View all services
docker-compose ps

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f mongodb
docker-compose logs -f redis
docker-compose logs -f rabbitmq
docker-compose logs -f graylog

# Restart services
docker-compose restart postgres
docker-compose down              # Stop all
docker-compose up -d             # Start all
```

---

## 🔐 Default Credentials

| Service | Username | Password |
|---------|----------|----------|
| PostgreSQL | postgres | postgres |
| MongoDB | (none) | (none) |
| Redis | (none) | (none) |
| RabbitMQ | guest | guest |
| Graylog | admin | password |

**⚠️ Change in production!**

---

## 📦 Key Dependencies

- **Framework**: NestJS 11
- **Database**: PostgreSQL + MongoDB + Redis
- **Messaging**: RabbitMQ
- **Auth**: Passport.js + JWT + Bcrypt
- **Validation**: class-validator + class-transformer
- **ORM**: TypeORM + Mongoose

---

## 🧪 Test API with cURL

```bash
# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123"}'

# Get profile (replace TOKEN with actual JWT)
curl -X POST http://localhost:3000/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

---

## 📚 Documentation Files

- **COMPLETE_SETUP.md** - Comprehensive setup guide
- **MICROSERVICES_SETUP.md** - Architecture overview
- **IMPLEMENTATION_CHECKLIST.md** - What was implemented
- **ARCHITECTURE.ts** - Code structure documentation
- **.env.example** - Environment variables reference

---

## 🆘 Troubleshooting

**Port 3000 in use?**
```bash
lsof -i :3000 && kill -9 <PID>
```

**Docker won't start?**
```bash
docker-compose down -v
docker-compose up -d
```

**Dependencies fail?**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Database connection error?**
Check .env matches docker-compose.yml credentials

---

## ✅ Verification

```bash
# All services should show "running"
docker-compose ps

# Build should complete with 0 errors
npm run build

# App should start successfully
npm run start:dev
# Look for: "🔥 Loaded AppModule successfully"
```

---

## 📖 Learn More

- [NestJS Docs](https://docs.nestjs.com)
- [TypeORM Guide](https://typeorm.io)
- [Mongoose Docs](https://mongoosejs.com)
- [Passport.js](https://www.passportjs.org)
- [Docker Compose](https://docs.docker.com/compose)

---

**You're all set! Start developing microservices! 🚀**
