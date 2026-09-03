// Global logger configuration for Graylog
export const GRAYLOG_CONFIG = {
  host: process.env.GRAYLOG_HOST || 'localhost',
  port: parseInt(process.env.GRAYLOG_PORT || '12201', 10),
  facility: 'mycommerce-user',
};

export const LOG_LEVEL = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};
