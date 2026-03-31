/**
 * Microservices Architecture - Clean Architecture + DDD
 * 
 * Folder Structure:
 * 
 * src/
 * ├── domain/              # Business Logic & Entities
 * │   ├── entities/        # Domain Entities
 * │   ├── repositories/    # Repository Interfaces
 * │   └── value-objects/   # Value Objects
 * ├── application/         # Use Cases & DTOs
 * │   ├── use-cases/       # Business Use Cases
 * │   └── dtos/           # Data Transfer Objects
 * ├── infrastructure/      # External Services & DB
 * │   ├── persistence/     # Database Repositories Implementation
 * │   ├── messaging/       # Message Queue Implementation
 * │   └── cache/          # Caching Layer
 * ├── modules/            # Feature Modules
 * │   ├── auth/           # Authentication Module
 * │   └── users/          # User Domain Module
 * └── shared/             # Shared Utilities & Filters
 *     ├── filters/        # Exception Filters
 *     ├── guards/         # Auth Guards
 *     └── pipes/          # Validation Pipes
 */

export const ARCHITECTURE_DOCS = {
  description:
    'Microservices with Clean Architecture and Domain-Driven Design (DDD)',
  patterns: [
    'Repository Pattern',
    'Dependency Injection',
    'Use Cases / Application Services',
    'Value Objects',
    'Domain Events',
  ],
  technologies: {
    database: ['PostgreSQL', 'MongoDB'],
    cache: 'Redis',
    messaging: 'RabbitMQ',
    monitoring: 'Graylog',
    auth: 'JWT with Passport',
  },
};
