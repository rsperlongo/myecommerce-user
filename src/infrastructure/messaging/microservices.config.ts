// Microservices RabbitMQ Events
export const USER_EVENTS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_AUTHENTICATED: 'user.authenticated',
};

export const QUEUES = {
  USERS: 'users_queue',
  AUTH: 'auth_queue',
};

export const MICROSERVICES_CONFIG = {
  rabbitMQ: {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
    user: process.env.RABBITMQ_USER || 'guest',
    password: process.env.RABBITMQ_PASSWORD || 'guest',
  },
};
